"use client";

import { MusicProvider } from "@/lib/contexts/MusicContext";
import type { MusicTrack } from "@/lib/sanity/queries";

interface MusicWrapperProps {
  children: React.ReactNode;
  tracks: MusicTrack[];
}

export default function MusicWrapper({ children, tracks }: MusicWrapperProps) {
  // Render children wrapped in MusicProvider, now with server-fetched tracks
  return <MusicProvider tracks={tracks}>{children}</MusicProvider>;
}
