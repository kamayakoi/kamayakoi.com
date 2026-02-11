/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />
/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

// Helper function to convert Uint8Array to Base64 string
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Environment Variables ---
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail = Deno.env.get('FROM_EMAIL') || 'orders@updates.kamayakoi.com';
const APP_BASE_URL = (
  Deno.env.get('APP_BASE_URL') || 'https://www.kamayakoi.com'
).replace(/\/$/, '');
const defaultLogoUrl = 'https://www.kamayakoi.com/icon.png';

// --- Environment Validation ---
if (!supabaseUrl || !supabaseServiceRoleKey || !resendApiKey) {
  throw new Error(
    'Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)'
  );
}

// Validate API key format (Resend API keys typically start with "re_")
if (!resendApiKey.startsWith('re_')) {
  console.warn(
    'RESEND_API_KEY does not appear to be in the correct format (should start with "re_"). This may cause authentication errors.'
  );
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let purchaseIdFromRequest: string | null = null;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const resend = new Resend(resendApiKey);

    const body = await req.json();
    // The webhook will send an array of purchase IDs for cart checkouts
    const purchase_ids = body.purchase_ids;
    if (
      !purchase_ids ||
      !Array.isArray(purchase_ids) ||
      purchase_ids.length === 0
    ) {
      console.error(
        'send-merch-receipt-email: Missing purchase_ids in request'
      );
      return new Response(JSON.stringify({ error: 'Missing purchase_ids' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Use the first purchase ID for fetching shared customer data
    purchaseIdFromRequest = purchase_ids[0];

    // --- 1. Fetch Purchase, Customer, and Item Details using RPC ---
    console.log(
      `send-merch-receipt-email: Fetching data for purchase IDs: ${purchase_ids.join(', ')}`
    );

    // This RPC will need to be created. It should return customer info and a list of items.
    const { data: purchaseData, error: purchaseError } = await supabase.rpc(
      'get_merch_purchase_for_email_dispatch',
      { p_purchase_ids: purchase_ids }
    );

    if (purchaseError || !purchaseData) {
      console.error(
        `send-merch-receipt-email: Error fetching data for purchases ${purchase_ids.join(', ')}:`,
        purchaseError
      );
      // Can't reliably update status if we can't fetch the data
      return new Response(
        JSON.stringify({ error: 'Purchase not found or database error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    const { customer_name, customer_email, items, total_amount, shipping_fee } =
      purchaseData;

    if (!customer_email || !customer_name) {
      console.error(
        `send-merch-receipt-email: Customer data missing for purchases ${purchase_ids.join(', ')}`
      );
      // Update status for all purchases? This might be complex. For now, just error out.
      return new Response(JSON.stringify({ error: 'Customer data missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // --- 2. Prepare Data for Email ---
    const nameParts = customer_name.split(' ');
    const firstName = nameParts[0];

    // --- 3. Fetch Logo ---
    let logoSrc = defaultLogoUrl;
    try {
      console.log('Fetching logo from website...');
      const logoResponse = await fetch(defaultLogoUrl);
      if (logoResponse.ok) {
        const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
        const logoBase64 = uint8ArrayToBase64(logoBytes);
        logoSrc = `data:image/png;base64,${logoBase64}`;
        console.log('Successfully fetched and encoded logo from website.');
      } else {
        console.warn(
          `Failed to fetch logo (status: ${logoResponse.status}), using URL as fallback.`
        );
      }
    } catch (logoError) {
      console.warn(
        'Could not fetch logo for email, using default URL.',
        logoError
      );
    }

    // --- 4. Send Email with Resend ---
    const emailHtmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmation de votre commande Kamayakoi</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { padding: 20px; text-align: center; }
          .header img { width: 100px; }
          .content { padding: 30px; }
          .item-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .item-table th, .item-table td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
          .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
          .total-row td { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoSrc}" alt="Kamayakoi Logo" />
          </div>
          <div class="content">
            <h1>Merci pour votre commande, ${firstName}!</h1>
            <p>Nous avons bien reçu votre commande et nous la préparons pour l'expédition. Voici un récapitulatif :</p>
            <table class="item-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Quantité</th>
                  <th>Prix</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item: any) => `
                  <tr>
                    <td>${item.product_title}</td>
                    <td>${item.quantity}</td>
                    <td>${Number(item.total_amount).toLocaleString('fr-FR')} F CFA</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            <table class="item-table">
              <tbody>
                <tr><td>Sous-total</td><td style="text-align:right;">${(Number(total_amount) - Number(shipping_fee)).toLocaleString('fr-FR')} F CFA</td></tr>
                <tr><td>Livraison</td><td style="text-align:right;">${Number(shipping_fee).toLocaleString('fr-FR')} F CFA</td></tr>
                <tr class="total-row"><td>Total</td><td style="text-align:right;">${Number(total_amount).toLocaleString('fr-FR')} F CFA</td></tr>
              </tbody>
            </table>
            <p>Nous vous enverrons une autre notification dès que votre commande sera expédiée.</p>
            <p>Pour toute question, répondez simplement à cet e-mail.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Kamayakoi
          </div>
        </div>
      </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Kamayakoi <${fromEmail}>`,
      to: customer_email,
      reply_to: 'kamayakoi@gmail.com',
      subject: `Confirmation de votre commande #${purchase_ids[0].substring(0, 8)}`,
      html: emailHtmlBody,
    });

    if (emailError) {
      // Parse error details for better error messages
      let errorDetails = emailError instanceof Error 
        ? emailError.message 
        : JSON.stringify(emailError);
      let errorHint = '';
      
      try {
        const errorObj = typeof emailError === 'object' ? emailError : JSON.parse(errorDetails);
        if (errorObj.statusCode === 401 || errorObj.message?.includes('API key is invalid')) {
          errorHint = ' The Resend API key appears to be invalid or expired. Please check your RESEND_API_KEY environment variable in Supabase dashboard.';
        } else if (errorObj.statusCode === 403) {
          errorHint = ' The Resend API key does not have the required permissions.';
        } else if (errorObj.statusCode === 429) {
          errorHint = ' Rate limit exceeded. Please try again later.';
        }
      } catch {
        // If parsing fails, use the original error message
      }
      
      console.error('Resend error:', errorDetails);
      if (errorHint) {
        console.error(`Error hint:${errorHint}`);
      }
      
      throw new Error(`Failed to send email: ${errorDetails}${errorHint}`);
    }

    // --- 5. Update Purchase Records on Success ---
    // This could be another RPC `update_merch_email_dispatch_status`
    console.log(
      `Email sent successfully for purchases: ${purchase_ids.join(', ')}. Email ID: ${emailData?.id}`
    );

    return new Response(
      JSON.stringify({
        message: 'Merchandise receipt email sent successfully!',
        email_id: emailData?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred';
    console.error(
      `Unexpected error for purchases ${purchaseIdFromRequest || 'unknown'}:`,
      e
    );

    // Check if it's a Resend API error
    const isResendError = errorMessage.includes('Resend') || 
                         errorMessage.includes('API key') ||
                         errorMessage.includes('401');

    return new Response(
      JSON.stringify({ 
        error: isResendError ? 'Email service error' : 'Internal server error', 
        details: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
