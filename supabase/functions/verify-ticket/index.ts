import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

interface TicketVerificationRequest {
  ticket_identifier: string;
  verified_by: string;
  auto_admit?: boolean; // Whether to automatically admit valid tickets
}

interface TicketVerificationResponse {
  success: boolean;
  ticket_data?: any;
  error_code?: string;
  error_message?: string;
  admitted?: boolean; // Whether the ticket was successfully admitted
}

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Validation
if (!supabaseUrl || supabaseUrl.trim() === '') {
  console.error('SUPABASE_URL environment variable is missing or empty');
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseServiceRoleKey || supabaseServiceRoleKey.trim() === '') {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY environment variable is missing or empty'
  );
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Race condition prevention strategy:
// When auto_admit=true, we call mark_ticket_used FIRST (which holds a FOR UPDATE row lock),
// then verify_ticket to get display data. This prevents the TOCTOU race where two simultaneous
// scans both see the ticket as unused.

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const body: TicketVerificationRequest = await req.json();

    const { ticket_identifier, verified_by, auto_admit = true } = body;

    if (!ticket_identifier || ticket_identifier.trim() === '') {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: 'INVALID_INPUT',
          error_message: 'Ticket identifier is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const trimmedId = ticket_identifier.trim();

    // When auto_admit is true, we use a mark-first-verify-second strategy
    // to prevent race conditions on simultaneous scans.
    if (auto_admit) {
      console.log(`Auto-admit flow for ticket: ${trimmedId}`);

      // Step 1: Try to mark the ticket as used FIRST (this holds a row lock via FOR UPDATE)
      const { data: admitResult, error: admitError } = await supabase.rpc(
        'mark_ticket_used',
        {
          p_ticket_identifier: trimmedId,
          p_verified_by: verified_by || 'edge_function',
        }
      );

      if (admitError) {
        console.error('Admission error:', admitError);
        // If mark fails entirely, the ticket may not exist - try verify for better error
        const { data: ticketData } = await supabase.rpc('verify_ticket', {
          p_ticket_identifier: trimmedId,
        });

        return new Response(
          JSON.stringify({
            success: false,
            ticket_data: ticketData?.[0] || null,
            admitted: false,
            error_code: 'ADMISSION_FAILED',
            error_message: admitError.message,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Step 2: Now get the full ticket data for display (after the lock is released)
      const { data: ticketData, error: verifyError } = await supabase.rpc(
        'verify_ticket',
        { p_ticket_identifier: trimmedId }
      );

      if (verifyError || !ticketData || ticketData.length === 0) {
        console.error('Verification error after mark:', verifyError);
        return new Response(
          JSON.stringify({
            success: false,
            error_code: 'TICKET_NOT_FOUND',
            error_message: 'Ticket not found in system',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const ticket = ticketData[0];
      const isLegacyTicket =
        ticket.use_count !== undefined &&
        ticket.use_count !== null &&
        ticket.total_quantity !== undefined;

      // Calculate remaining tickets from the now-updated data
      let remainingTickets = 0;
      if (isLegacyTicket) {
        remainingTickets = Math.max(
          0,
          ticket.total_quantity - ticket.use_count
        );
      } else {
        remainingTickets = ticket.is_used ? 0 : 1;
      }

      const ticketWithRemaining = {
        ...ticket,
        remaining_tickets: remainingTickets,
      };

      // Handle the result of mark_ticket_used
      if (admitResult === 'SUCCESS') {
        console.log(
          `Ticket successfully admitted: ${trimmedId} (${ticket.customer_name})`
        );
        return new Response(
          JSON.stringify({
            success: true,
            ticket_data: ticketWithRemaining,
            admitted: true,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // DUPLICATE_SCAN or ALREADY_USED or NOT_FOUND
      console.log(`Admission result: ${admitResult} for ${trimmedId}`);
      return new Response(
        JSON.stringify({
          success: true, // Ticket exists and was verified
          ticket_data: ticketWithRemaining,
          admitted: false,
          error_code: admitResult,
          error_message:
            admitResult === 'ALREADY_USED'
              ? 'Ticket has already been used for entry'
              : admitResult === 'DUPLICATE_SCAN'
                ? 'Ticket scanned again too quickly'
                : admitResult === 'NOT_FOUND'
                  ? 'Ticket not found in system'
                  : 'Admission failed',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Non-auto-admit flow: verify only (no race condition concern since we're just reading)
    console.log(`Verify-only flow for ticket: ${trimmedId}`);

    const { data: ticketData, error: verifyError } = await supabase.rpc(
      'verify_ticket',
      { p_ticket_identifier: trimmedId }
    );

    if (verifyError) {
      console.error('Verification error:', verifyError);
      return new Response(
        JSON.stringify({
          success: false,
          error_code: 'VERIFICATION_FAILED',
          error_message: verifyError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!ticketData || ticketData.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: 'TICKET_NOT_FOUND',
          error_message: 'Ticket not found in system',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const ticket = ticketData[0];
    const isLegacyTicket =
      ticket.use_count !== undefined &&
      ticket.use_count !== null &&
      ticket.total_quantity !== undefined;

    let remainingTickets = 0;
    if (isLegacyTicket) {
      remainingTickets = Math.max(0, ticket.total_quantity - ticket.use_count);
    } else {
      remainingTickets = ticket.is_used ? 0 : 1;
    }

    const ticketWithRemaining = {
      ...ticket,
      remaining_tickets: remainingTickets,
    };

    return new Response(
      JSON.stringify({
        success: true,
        ticket_data: ticketWithRemaining,
        admitted: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error_code: 'INTERNAL_ERROR',
        error_message:
          error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
