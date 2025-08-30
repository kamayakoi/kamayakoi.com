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

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {media.map((mediaItem) => (
            <MediaPlayer
              key={mediaItem._id}
              media={mediaItem}
              onPlay={() => handleMediaPlay(mediaItem._id)}
              onPause={handleMediaPause}
            />
          ))}
        </div>

        {/* View All Media Button */}
        <div className="text-center mt-12">
          <button
            className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-sm transition-all duration-300 backdrop-blur-sm"
            onClick={() => {
              // TODO: Navigate to media page or open modal
              console.log("View all media clicked");
            }}
          >
            {currentLanguage === "fr"
              ? "Voir toutes les vidéos"
              : "View all videos"}
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
