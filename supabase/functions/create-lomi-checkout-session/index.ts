/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />
/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import {
  CHECKOUT_ERROR_CODES,
  checkoutError,
  checkoutSuccess,
} from '../_shared/checkout-api.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Supabase URL or Service Role Key is not set. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are defined in Edge Function environment variables.'
  );
}
const supabase = createClient(supabaseUrl || '', supabaseServiceRoleKey || '');

const LOMI_SECRET_KEY = Deno.env.get('LOMI_SECRET_KEY');
const LOMI_API_URL = Deno.env.get('LOMI_API_URL') || 'https://api.lomi.africa';
const APP_BASE_URL = (
  Deno.env.get('APP_BASE_URL') || 'http://localhost:3000'
).replace(/\/$/, '');

interface RequestPayload {
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketName: string;
  pricePerTicket: number;
  quantity: number;
  currencyCode?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  successUrlPath?: string;
  cancelUrlPath?: string;
  allowedProviders?: string[];
  productId?: string;
  priceId?: string;
  allowCouponCode?: boolean;
  allowQuantity?: boolean;
  eventDateText?: string;
  eventTimeText?: string;
  eventVenueName?: string;
  couponCode?: string;
  couponCodes?: string[];
  isBundle?: boolean;
  ticketsPerBundle?: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return checkoutError(
      CHECKOUT_ERROR_CODES.CONFIG_SUPABASE,
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing',
      500
    );
  }
  if (!LOMI_SECRET_KEY) {
    return checkoutError(
      CHECKOUT_ERROR_CODES.CONFIG_LOMI,
      'LOMI_SECRET_KEY missing',
      500
    );
  }

  try {
    const payload: RequestPayload = await req.json();
    console.log('Received payload:', JSON.stringify(payload, null, 2));
    console.log('Product ID in request:', payload.productId);

    const requiredFields: (keyof RequestPayload)[] = [
      'eventId',
      'eventTitle',
      'ticketTypeId',
      'ticketName',
      'pricePerTicket',
      'quantity',
      'userName',
      'userEmail',
    ];
    for (const field of requiredFields) {
      if (
        !(field in payload) ||
        payload[field] === undefined ||
        payload[field] === null ||
        String(payload[field]).trim() === ''
      ) {
        if (field === 'pricePerTicket' && payload[field] === 0) continue;

        return checkoutError(
          CHECKOUT_ERROR_CODES.VALIDATION_FAILED,
          `Missing or invalid field: ${field}`,
          400
        );
      }
    }
    if (payload.quantity <= 0) {
      return checkoutError(
        CHECKOUT_ERROR_CODES.VALIDATION_QUANTITY,
        `Invalid quantity: ${payload.quantity}`,
        400
      );
    }

    console.log('Creating/updating customer using RPC function');
    const { data: customerId, error: customerError } = await supabase.rpc(
      'upsert_customer',
      {
        p_name: payload.userName,
        p_email: payload.userEmail,
        p_phone: payload.userPhone || null,
        p_whatsapp: payload.userPhone || null,
      }
    );

    if (customerError || !customerId) {
      return checkoutError(
        CHECKOUT_ERROR_CODES.CUSTOMER_UPSERT_FAILED,
        customerError?.message || 'No customer ID returned',
        500
      );
    }

    console.log('Customer upserted successfully:', customerId);

    let currencyCode = (payload.currencyCode || 'XOF').toUpperCase();
    const validCurrencies = ['XOF', 'EUR', 'USD'];
    if (!validCurrencies.includes(currencyCode)) {
      console.warn(
        `Invalid currency code "${currencyCode}", defaulting to XOF`
      );
      currencyCode = 'XOF';
    }

    const totalAmount = payload.pricePerTicket * payload.quantity;
    const isBundle = payload.isBundle || false;
    const ticketsPerBundle = payload.ticketsPerBundle || 1;

    console.log('Creating purchase record using RPC function');
    console.log(
      `Bundle details: isBundle=${isBundle}, ticketsPerBundle=${ticketsPerBundle}`
    );

    const { data: purchaseId, error: purchaseError } = await supabase.rpc(
      'create_purchase',
      {
        p_customer_id: customerId,
        p_event_id: payload.eventId,
        p_event_title: payload.eventTitle,
        p_ticket_type_id: payload.ticketTypeId,
        p_ticket_name: payload.ticketName,
        p_quantity: payload.quantity,
        p_price_per_ticket: payload.pricePerTicket,
        p_total_amount: totalAmount,
        p_currency_code: currencyCode,
        p_event_date_text: payload.eventDateText || 'To Be Announced',
        p_event_time_text: payload.eventTimeText || 'Time TBA',
        p_event_venue_name: payload.eventVenueName || 'Venue TBA',
        p_is_bundle: isBundle,
        p_tickets_per_bundle: ticketsPerBundle,
      }
    );

    if (purchaseError || !purchaseId) {
      return checkoutError(
        CHECKOUT_ERROR_CODES.PURCHASE_CREATE_FAILED,
        purchaseError?.message || 'No purchase ID returned',
        500
      );
    }

    console.log('Created purchase record:', purchaseId);

    const successRedirectPath = payload.successUrlPath || '/payment/success';
    const cancelRedirectPath = payload.cancelUrlPath || '/payment/error';
    const priceId = payload.priceId || payload.productId || null;
    const isPriceBased = !!priceId;

    const baseLomiPayload = {
      success_url: `${APP_BASE_URL}${successRedirectPath}?purchase_id=${purchaseId}&status=success`,
      cancel_url: `${APP_BASE_URL}${cancelRedirectPath}?purchase_id=${purchaseId}&status=cancelled`,
      currency_code: currencyCode,
      quantity: payload.quantity,
      customer_email: payload.userEmail,
      customer_name: payload.userName,
      ...(payload.userPhone && { customer_phone: payload.userPhone }),
      allow_coupon_code:
        payload.allowCouponCode !== undefined ? payload.allowCouponCode : true,
      allow_quantity:
        payload.allowQuantity !== undefined ? payload.allowQuantity : true,
      metadata: {
        internal_purchase_id: purchaseId,
        event_id: payload.eventId,
        ticket_type_id: payload.ticketTypeId,
        customer_id: customerId,
        app_source: 'kamayakoi_events_app',
        is_price_based: isPriceBased,
      },
      require_billing_address: false,
    };

    const lomiPayload = isPriceBased
      ? {
          ...baseLomiPayload,
          price_id: priceId,
          title: `${payload.eventTitle} Tickets (x${payload.quantity})`,
          description: `Tickets for: ${payload.eventTitle}`,
        }
      : {
          ...baseLomiPayload,
          amount: payload.pricePerTicket,
          title: `${payload.ticketName} - ${payload.eventTitle} (x${payload.quantity})`,
          description: `Payment for ${payload.quantity} ticket(s) for the event: ${payload.eventTitle}. Ticket type: ${payload.ticketName}.`,
        };

    console.log('Calling lomi. API:', `${LOMI_API_URL}/checkout-sessions`);

    const lomiResponse = await fetch(`${LOMI_API_URL}/checkout-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LOMI_SECRET_KEY,
      },
      body: JSON.stringify(lomiPayload),
    });

    const lomiResponseText = await lomiResponse.text();
    console.log('lomi. API status:', lomiResponse.status, lomiResponseText);

    let lomiResponseData: Record<string, unknown>;
    try {
      lomiResponseData = JSON.parse(lomiResponseText);
    } catch {
      await supabase.rpc('update_purchase_lomi_session', {
        p_purchase_id: purchaseId,
        p_lomi_session_id: null,
        p_lomi_checkout_url: null,
        p_payment_processor_details: {
          error: 'Invalid JSON response from lomi. API',
          response: lomiResponseText.slice(0, 1000),
          failure_reason: 'invalid_json_response',
        },
      });

      return checkoutError(
        CHECKOUT_ERROR_CODES.LOMI_INVALID_RESPONSE,
        `Non-JSON response (HTTP ${lomiResponse.status}): ${lomiResponseText.slice(0, 300)}`,
        502
      );
    }

    if (!lomiResponse.ok || !lomiResponseData.checkout_session_id) {
      await supabase.rpc('update_purchase_lomi_session', {
        p_purchase_id: purchaseId,
        p_lomi_session_id: null,
        p_lomi_checkout_url: null,
        p_payment_processor_details: {
          ...lomiResponseData,
          failure_reason: 'lomi_api_error',
        },
      });

      const lomiDetail =
        typeof lomiResponseData.error === 'string'
          ? lomiResponseData.error
          : JSON.stringify(lomiResponseData).slice(0, 500);

      return checkoutError(
        CHECKOUT_ERROR_CODES.LOMI_SESSION_FAILED,
        `lomi HTTP ${lomiResponse.status}: ${lomiDetail}`,
        lomiResponse.status >= 400 && lomiResponse.status < 600
          ? lomiResponse.status
          : 502
      );
    }

    const checkoutUrl = lomiResponseData.checkout_url;
    if (typeof checkoutUrl !== 'string' || !checkoutUrl) {
      return checkoutError(
        CHECKOUT_ERROR_CODES.CHECKOUT_URL_MISSING,
        'lomi returned session but no checkout_url',
        502
      );
    }

    const { error: updatePurchaseError } = await supabase.rpc(
      'update_purchase_lomi_session',
      {
        p_purchase_id: purchaseId,
        p_lomi_session_id: lomiResponseData.checkout_session_id,
        p_lomi_checkout_url: checkoutUrl,
        p_payment_processor_details: {
          request: lomiPayload,
          response: lomiResponseData,
        },
      }
    );

    if (updatePurchaseError) {
      const isDuplicateSessionError = updatePurchaseError.message?.includes(
        'already has a lomi session ID'
      );
      if (!isDuplicateSessionError) {
        console.warn(
          'Failed to update purchase with lomi details:',
          updatePurchaseError.message
        );
      }
    }

    return checkoutSuccess(checkoutUrl, purchaseId);
  } catch (error) {
    const debug = error instanceof Error ? error.message : String(error);
    return checkoutError(CHECKOUT_ERROR_CODES.UNEXPECTED, debug, 500);
  }
});
