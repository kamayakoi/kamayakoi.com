import { FunctionsHttpError } from '@supabase/supabase-js';
import type { Language } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/translations';

/** Stable codes — keep in sync with supabase/functions/_shared/checkout-api.ts */
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
  NETWORK: 'NETWORK',
  NETWORK_IN_APP: 'NETWORK_IN_APP',
} as const;

export type CheckoutErrorCode =
  (typeof CHECKOUT_ERROR_CODES)[keyof typeof CHECKOUT_ERROR_CODES];

export type CheckoutApiErrorBody = {
  ok?: false;
  code?: CheckoutErrorCode | string;
  debug?: string;
  error?: string;
  details?: string | Record<string, unknown>;
};

export type CheckoutDisplayError = {
  message: string;
  code: string;
  debug?: string;
};

const EDGE_NETWORK_ERROR =
  /Failed to send a request to the Edge Function|FunctionsFetchError|FunctionsRelayError|NetworkError|fetch failed/i;

export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Instagram|FBAN|FBAV|FB_IAB|Twitter|Line\/|MicroMessenger|LinkedInApp/i.test(
    navigator.userAgent
  );
}

function translateCode(
  language: Language,
  code: string,
  namespace: 'purchaseModal' | 'cartPurchaseForm'
): string {
  const key = `${namespace}.errorCodes.${code}`;
  const translated = t(language, key);
  if (translated !== key) return translated;
  return t(language, `${namespace}.errorCodes.UNEXPECTED`);
}

/**
 * Map a structured API error body to a short customer message + support code.
 */
export function resolveCheckoutApiBody(
  body: CheckoutApiErrorBody | null | undefined,
  language: Language,
  namespace: 'purchaseModal' | 'cartPurchaseForm' = 'purchaseModal'
): CheckoutDisplayError {
  const code =
    (typeof body?.code === 'string' && body.code) ||
    CHECKOUT_ERROR_CODES.UNEXPECTED;
  const debug =
    (typeof body?.debug === 'string' && body.debug) ||
    (typeof body?.error === 'string' && body.error) ||
    (typeof body?.details === 'string' ? body.details : undefined);

  return {
    message: translateCode(language, code, namespace),
    code,
    debug,
  };
}

export async function resolveCheckoutInvokeError(
  error: { message?: string },
  language: Language,
  namespace: 'purchaseModal' | 'cartPurchaseForm' = 'purchaseModal'
): Promise<CheckoutDisplayError> {
  const message = error.message ?? '';

  if (EDGE_NETWORK_ERROR.test(message)) {
    const code = isInAppBrowser()
      ? CHECKOUT_ERROR_CODES.NETWORK_IN_APP
      : CHECKOUT_ERROR_CODES.NETWORK;
    return {
      message: translateCode(language, code, namespace),
      code,
      debug: message,
    };
  }

  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as CheckoutApiErrorBody;
      return resolveCheckoutApiBody(body, language, namespace);
    } catch {
      // Body was not JSON
    }
  }

  if (message.trim() && !message.includes('Edge Function')) {
    return {
      message: translateCode(language, CHECKOUT_ERROR_CODES.UNEXPECTED, namespace),
      code: CHECKOUT_ERROR_CODES.UNEXPECTED,
      debug: message,
    };
  }

  return {
    message: translateCode(
      language,
      CHECKOUT_ERROR_CODES.UNEXPECTED,
      namespace
    ),
    code: CHECKOUT_ERROR_CODES.UNEXPECTED,
    debug: message || undefined,
  };
}

export function reportCheckoutError(error: CheckoutDisplayError): void {
  console.error(
    `[checkout] ${error.code}`,
    error.debug ?? '(no debug detail)'
  );
}
