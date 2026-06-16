import { corsHeaders } from './cors.ts';

/** Stable codes — keep in sync with lib/utils/checkout-api.ts */
export const CHECKOUT_ERROR_CODES = {
  CONFIG_SUPABASE: 'CONFIG_SUPABASE',
  CONFIG_LOMI: 'CONFIG_LOMI',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_QUANTITY: 'VALIDATION_QUANTITY',
  CUSTOMER_UPSERT_FAILED: 'CUSTOMER_UPSERT_FAILED',
  PURCHASE_CREATE_FAILED: 'PURCHASE_CREATE_FAILED',
  LOMI_INVALID_RESPONSE: 'LOMI_INVALID_RESPONSE',
  LOMI_SESSION_FAILED: 'LOMI_SESSION_FAILED',
  CHECKOUT_URL_MISSING: 'CHECKOUT_URL_MISSING',
  UNEXPECTED: 'UNEXPECTED',
} as const;

export type CheckoutErrorCode =
  (typeof CHECKOUT_ERROR_CODES)[keyof typeof CHECKOUT_ERROR_CODES];

export type CheckoutErrorBody = {
  ok: false;
  code: CheckoutErrorCode;
  /** Technical detail for client console / support — not shown to customers */
  debug: string;
};

export type CheckoutSuccessBody = {
  ok: true;
  checkout_url: string;
  purchase_id: string;
};

const jsonHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
};

export function checkoutError(
  code: CheckoutErrorCode,
  debug: string,
  status = 500
): Response {
  const body: CheckoutErrorBody = { ok: false, code, debug };
  console.error(`[create-lomi-checkout-session] ${code}:`, debug);
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

export function checkoutSuccess(
  checkout_url: string,
  purchase_id: string
): Response {
  const body: CheckoutSuccessBody = {
    ok: true,
    checkout_url,
    purchase_id,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: jsonHeaders,
  });
}
