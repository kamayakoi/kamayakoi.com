"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

interface MediaItem {
  _id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
  thumbnail: string;
  duration?: string;
  artist?: string;
  genre?: string;
  isFeatured: boolean;
  tags?: string[];
  publishedAt?: string;
}

interface MediaShowcaseProps {
  media: MediaItem[];
}

export function MediaShowcase({ media }: MediaShowcaseProps) {
  const { currentLanguage } = useTranslation();
  const [playingMediaId, setPlayingMediaId] = useState<string | null>(null);
  const hasMedia = media && media.length > 0;

  const handleMediaPlay = (mediaId: string) => {
    // Pause any currently playing media
    if (playingMediaId && playingMediaId !== mediaId) {
      setPlayingMediaId(null);
    }
    setPlayingMediaId(mediaId);

    // Find the media item and open its URL
    const mediaItem = media.find((item) => item._id === mediaId);
    if (mediaItem) {
      window.open(mediaItem.url, "_blank");
    }
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
                : "Discover the best mixes and videos"}
            </p>
          </div>
        </div>

        {hasMedia ? (
          <>
            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {media.map((mediaItem) => (
                <div
                  key={mediaItem._id}
                  className="relative overflow-hidden rounded-sm bg-black/20 backdrop-blur-sm group cursor-pointer"
                  onClick={() => {
                    if (playingMediaId === mediaItem._id) {
                      handleMediaPause();
                    } else {
                      handleMediaPlay(mediaItem._id);
                    }
                  }}
                >
                  {/* Thumbnail or Placeholder */}
                  <div className="aspect-[4/3] relative">
                    {mediaItem.thumbnail ? (
                      <Image
                        src={mediaItem.thumbnail}
                        alt={mediaItem.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-white/50 text-center">
                          <div className="text-3xl mb-2">
                            {mediaItem.type === "youtube"
                              ? "📺"
                              : mediaItem.type === "soundcloud"
                                ? "🎵"
                                : mediaItem.type === "audio_url"
                                  ? "🎧"
                                  : "🎬"}
                          </div>
                          <div className="text-xs uppercase tracking-wide">
                            {mediaItem.type.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-lg font-bold mb-1">
                          {mediaItem.title}
                        </div>
                        {mediaItem.artist && (
                          <div className="text-sm text-white/80">
                            {mediaItem.artist}
                          </div>
                        )}
                        <div className="text-xs text-white/60 mt-2 uppercase tracking-wide">
                          {currentLanguage === "fr"
                            ? "Cliquer pour jouer"
                            : "Click to Play"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                      {mediaItem.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{mediaItem.genre || mediaItem.type}</span>
                      {mediaItem.duration && <span>{mediaItem.duration}</span>}
                    </div>
                  </div>
                </div>
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
          </>
        ) : (
          /* Coming Soon Message - using translations */
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20">
            <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
              {t(currentLanguage, "eventShowcase.media.comingSoon.title")}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {t(currentLanguage, "eventShowcase.media.comingSoon.description")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
