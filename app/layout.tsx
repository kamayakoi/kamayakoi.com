import type React from "react";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { TranslationProvider } from "@/lib/contexts/TranslationContext";
import { MediaProvider } from "@/lib/contexts/MediaContext";
import MusicWrapper from "@/components/landing/music-wrapper";
import { CartProvider } from "@/components/merch/cart/cart-context";
import { WishlistProvider } from "@/components/merch/wishlist/wishlist-context";
import { getHomepageMusicTracks } from "@/lib/sanity/queries";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteConfig = {
  name: "Kamayakoi",
  description: "Rendez-vous sauvage pour électrons libres.",
  url: "https://kamayakoi.com",
  ogImage: "/banner.webp",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
        alt: siteConfig.name,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@lomiafrica",
    site: "https://lomi.africa",
  },
  // Optional: Add robots and manifest info if needed
  // robots: { index: true, follow: true },
  // manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch music tracks for global audio player
  const musicTracks = await getHomepageMusicTracks();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} font-sans flex flex-col min-h-screen`}
      >
        <MusicWrapper tracks={musicTracks}>
          <TranslationProvider>
            <MediaProvider>
              <CartProvider>
                <WishlistProvider>
                  <main className="flex-grow">{children}</main>
                </WishlistProvider>
              </CartProvider>
            </MediaProvider>
          </TranslationProvider>
        </MusicWrapper>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
