import parsePhoneNumberFromString, {
  type CountryCode,
} from 'libphonenumber-js';

const LEGACY_COUNTRY_NAME_PHONE_PREFIX =
  /^(?:C[oô]te d['']Ivoire|Ivory Coast)\+?/i;

export function stripLegacyCountryPhonePrefix(phone: string): string {
  if (!LEGACY_COUNTRY_NAME_PHONE_PREFIX.test(phone)) {
    return phone;
  }
  const stripped = phone.replace(LEGACY_COUNTRY_NAME_PHONE_PREFIX, '');
  return stripped.startsWith('+') ? stripped : `+${stripped}`;
}

export type PhoneValidationResult =
  | { valid: true; e164: string; country: CountryCode | undefined }
  | { valid: false; reason: 'empty' | 'invalid' | 'ci_length' };

/**
 * Validate a phone number for checkout. Defaults to Côte d'Ivoire when no
 * country calling code is present.
 */
export function validatePhoneNumber(
  phone: string | null | undefined,
  defaultCountry: CountryCode = 'CI'
): PhoneValidationResult {
  if (!phone?.trim()) {
    return { valid: false, reason: 'empty' };
  }

  const cleaned = stripLegacyCountryPhonePrefix(phone.trim());

  try {
    const parsed = parsePhoneNumberFromString(
      cleaned,
      cleaned.startsWith('+') ? undefined : defaultCountry
    );

    if (!parsed) {
      return { valid: false, reason: 'invalid' };
    }

    if (!parsed.isValid()) {
      if (
        (parsed.country === 'CI' || defaultCountry === 'CI') &&
        parsed.nationalNumber.length < 10
      ) {
        return { valid: false, reason: 'ci_length' };
      }
      return { valid: false, reason: 'invalid' };
    }

    return {
      valid: true,
      e164: parsed.format('E.164'),
      country: parsed.country,
    };
  } catch {
    return { valid: false, reason: 'invalid' };
  }
}

/** Stripe / lomi `phone` field: E.164 only, max 20 characters. */
export function normalizePhoneForCheckout(
  phone: string | null | undefined,
  countryHint?: CountryCode | null
): string | undefined {
  const result = validatePhoneNumber(phone, countryHint ?? 'CI');
  if (!result.valid) return undefined;
  if (result.e164.length > 20) return undefined;
  return result.e164;
}
