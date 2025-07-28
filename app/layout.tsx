import type React from "react";
import type { Metadata } from "next";
import { Bebas_Neue, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { TranslationProvider } from "@/lib/contexts/TranslationContext";
import MusicWrapper from "@/components/landing/music-wrapper";
import AudioPlayer from "@/components/landing/audio-player";
import { getHomepageMusicTracks } from "@/lib/sanity/queries";

// Bold geometric fonts matching the image style
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  weight: ["400"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["300", "400", "500", "600", "700"],
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
    template: `%s | ${siteConfig.name}`,
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bebasNeue.variable} ${oswald.variable} font-oswald flex flex-col min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationProvider>
            <MusicWrapper tracks={musicTracks}>
              {/* Global Desktop Audio Player - positioned in top-left */}
              <div className="hidden md:block fixed top-4 left-4 z-[70]">
                <AudioPlayer />
              </div>

              <main className="flex-grow">{children}</main>
            </MusicWrapper>
          </TranslationProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
