"use client";

import { MusicProvider } from "@/lib/contexts/MusicContext";
import type { HomepageAudioSettings } from "@/lib/sanity/queries";

interface MusicWrapperProps {
  children: React.ReactNode;
  audioSettings: HomepageAudioSettings;
}

export default function MusicWrapper({
  children,
  audioSettings,
}: MusicWrapperProps) {
  // Render children wrapped in MusicProvider with audio settings
  return (
    <MusicProvider
      tracks={audioSettings.musicTracks}
      audioPlayerEnabled={audioSettings.audioPlayerEnabled}
      autoPlayMusic={audioSettings.autoPlayMusic}
    >
      {children}
    </MusicProvider>
  );
}
