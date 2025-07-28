"use client";

import { useEffect, useState } from "react";
import { MusicProvider } from "@/lib/contexts/MusicContext";
import { getHomepageMusicTracks, type MusicTrack } from "@/lib/sanity/queries";

interface MusicWrapperProps {
  children: React.ReactNode;
}

export default function MusicWrapper({ children }: MusicWrapperProps) {
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);

  useEffect(() => {
    const fetchMusicTracks = async () => {
      try {
        const tracks = await getHomepageMusicTracks();
        setMusicTracks(tracks);
      } catch (error) {
        console.error("Failed to fetch music tracks:", error);
      }
    };

    fetchMusicTracks();
  }, []);

  // Render children wrapped in MusicProvider
  return <MusicProvider tracks={musicTracks}>{children}</MusicProvider>;
}
