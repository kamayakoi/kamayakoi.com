import type React from 'react';
import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
import { TranslationProvider } from '@/lib/contexts/TranslationContext';
import { MediaProvider } from '@/lib/contexts/MediaContext';
import MusicWrapper from '@/components/landing/music-wrapper';
import { CartProvider } from '@/components/merch/cart/cart-context';
import { WishlistProvider } from '@/components/merch/wishlist/wishlist-context';
import { getHomepageLayoutData } from '@/lib/sanity/queries';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import {
  parseLanguageCookie,
  LANGUAGE_COOKIE_KEY,
} from '@/lib/i18n/language-cookie';
import type { Language } from '@/lib/i18n/config';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteConfig = {
  name: 'Kamayakoi',
  description: 'Abidjan Techno Gang',
  url: 'https://kamayakoi.com',
  ogImage: '/banner.webp',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'techno',
    'electronic music',
    'Abidjan',
    "Côte d'Ivoire",
    'underground music',
    'techno collective',
    'African techno',
    'electronic music events',
    'Abidjan nightlife',
    'techno parties',
    'music collective',
  ],
  authors: [{ name: 'Kamayakoi' }],
  creator: 'Kamayakoi',
  publisher: 'Kamayakoi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.description}`,
        type: 'image/webp',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@kamayakoi',
    site: 'https://www.kamayakoi.com',
  },
  alternates: {
    canonical: siteConfig.url,
  },
  category: 'music',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layoutData = await getHomepageLayoutData();
  const cookieStore = await cookies();
  const initialLanguage = parseLanguageCookie(
    cookieStore.get(LANGUAGE_COOKIE_KEY)?.value
  ) as Language;

  return (
    <html lang={initialLanguage} className="dark" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} font-sans flex flex-col min-h-screen`}
      >
        <ThemeProvider primaryButtonColor={layoutData.primaryButtonColor}>
          <MusicWrapper
            audioSettings={{
              audioPlayerEnabled: layoutData.audioPlayerEnabled,
              autoPlayMusic: layoutData.autoPlayMusic,
              musicTracks: layoutData.musicTracks,
            }}
          >
            <TranslationProvider initialLanguage={initialLanguage}>
              <MediaProvider>
                <CartProvider>
                  <WishlistProvider>
                    <main className="flex-grow">{children}</main>
                  </WishlistProvider>
                </CartProvider>
              </MediaProvider>
            </TranslationProvider>
          </MusicWrapper>
        </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
