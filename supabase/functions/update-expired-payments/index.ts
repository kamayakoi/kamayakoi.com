import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify Authorization header matches service role key
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!authHeader || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing authorization',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract Bearer token
    const bearerToken = authHeader.replace('Bearer ', '');

    // Verify the token matches the service role key
    if (bearerToken !== serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid authorization token',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('🔄 Starting expired payments update...');

    // Call the main update function from our migration
    const { data: updateResult, error: updateError } = await supabaseClient.rpc(
      'update_expired_pending_payments'
    );

    if (updateError) {
      console.error('❌ Update function error:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: updateError.message,
          details: updateError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(
      '✅ Payment status update completed successfully:',
      updateResult
    );

    // Get current payment status summary for monitoring
    const { data: statusSummary, error: summaryError } = await supabaseClient
      .from('purchases')
      .select('status')
      .eq('status', 'pending_payment');

    let pendingCount = 0;
    if (summaryError) {
      console.warn(
        '⚠️ Could not fetch pending payments count:',
        summaryError.message
      );
    } else {
      pendingCount = statusSummary?.length || 0;
      console.log('📊 Remaining pending payments:', pendingCount);
    }

    // Prepare comprehensive response
    const response = {
      success: true,
      update_results: updateResult,
      timestamp: new Date().toISOString(),
      statistics: {
        payments_updated: updateResult?.[0]?.affected_rows || 0,
        remaining_pending: pendingCount,
      },
    };

    console.log('📈 Final statistics:', response.statistics);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('🚨 Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
