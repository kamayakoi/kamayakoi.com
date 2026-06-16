import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LANGUAGE_COOKIE_KEY,
  LEGACY_LANGUAGE_COOKIE_KEY,
  isSupportedLanguage,
} from '@/lib/i18n/language-cookie';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const current = request.cookies.get(LANGUAGE_COOKIE_KEY)?.value;
  const legacy = request.cookies.get(LEGACY_LANGUAGE_COOKIE_KEY)?.value;
  const existing = isSupportedLanguage(current)
    ? current
    : isSupportedLanguage(legacy)
      ? legacy
      : undefined;

  if (existing) {
    if (!isSupportedLanguage(current) && isSupportedLanguage(legacy)) {
      response.cookies.set(LANGUAGE_COOKIE_KEY, legacy, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
    return response;
  }

  const acceptLanguage = request.headers
    .get('accept-language')
    ?.split(',')[0]
    ?.split('-')[0];
  const detected =
    acceptLanguage && isSupportedLanguage(acceptLanguage)
      ? acceptLanguage
      : 'en';

  response.cookies.set(LANGUAGE_COOKIE_KEY, detected, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
