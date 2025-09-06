"use client";

import { useState } from "react";
import { MediaPlayer } from "./media-player";
import { MediaItem } from "@/lib/sanity/queries";
import { useTranslation } from "@/lib/contexts/TranslationContext";

interface FeaturedMediaProps {
  media: MediaItem[];
}

export function FeaturedMedia({ media }: FeaturedMediaProps) {
  const { currentLanguage } = useTranslation();
  const [playingMediaId, setPlayingMediaId] = useState<string | null>(null);

  if (!media || media.length === 0) {
    return null;
  }

  const handleMediaPlay = (mediaId: string) => {
    // Pause any currently playing media
    if (playingMediaId && playingMediaId !== mediaId) {
      setPlayingMediaId(null);
    }
    setPlayingMediaId(mediaId);
  };

  const handleMediaPause = () => {
    setPlayingMediaId(null);
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-1 h-12 bg-white"></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              {currentLanguage === "fr" ? "Vidéos" : "Medias"}
            </h2>
            <p className="text-white/70 text-lg">
              {currentLanguage === "fr"
                ? "Découvrez nos meilleures mixs et vidéos"
                : "Discover the best sounds and videos"}
            </p>
          </div>
        </div>

        {/* Horizontal Scrolling Media */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {media.slice(0, 50).map((mediaItem) => (
              <div key={mediaItem._id} className="flex-shrink-0 w-80">
                <MediaPlayer
                  media={mediaItem}
                  onPlay={() => handleMediaPlay(mediaItem._id)}
                  onPause={handleMediaPause}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
