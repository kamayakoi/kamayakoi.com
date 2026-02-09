'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { t } from '@/lib/i18n/translations';
import { Card, CardContent } from '@/components/ui/card';

interface MediaItem {
  _id: string;
  title: string;
  title_fr?: string;
  type: string;
  url: string;
  description?: string;
  description_fr?: string;
  thumbnail?: string;
  duration?: string;
  artist?: string;
  genre?: string;
  publishedAt?: string;
}

interface MediaShowcaseProps {
  media: MediaItem[];
}

function MediaCard({ mediaItem }: { mediaItem: MediaItem }) {
  const { currentLanguage } = useTranslation();
  const { button } = useTheme();

  // Get the localized title and description
  const localizedTitle =
    currentLanguage === 'fr' && mediaItem.title_fr
      ? mediaItem.title_fr
      : mediaItem.title;

  const localizedDescription =
    currentLanguage === 'fr' && mediaItem.description_fr
      ? mediaItem.description_fr
      : mediaItem.description;

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Extract dynamic thumbnail for YouTube (SoundCloud uses Sanity thumbnail)
  const getDynamicThumbnail = useMemo(() => {
    // First priority: Sanity thumbnail
    if (mediaItem.thumbnail) return mediaItem.thumbnail;

    // Second priority: YouTube thumbnail extraction
    if (
      mediaItem.type === 'youtube' ||
      mediaItem.url.includes('youtube.com') ||
      mediaItem.url.includes('youtu.be')
    ) {
      const videoId = extractYouTubeId(mediaItem.url);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    return null;
  }, [mediaItem.thumbnail, mediaItem.type, mediaItem.url]);

  const mainImage = getDynamicThumbnail || '/placeholder.webp';
  const hasValidImage =
    mainImage && mainImage.trim() !== '' && mainImage !== '/placeholder.webp';

  const handleMediaClick = () => {
    window.open(mediaItem.url, '_blank');
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-sm border-border/40 bg-card p-0">
      <div className="relative rounded-t-sm overflow-hidden">
        <div
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
          onClick={handleMediaClick}
          role="button"
          tabIndex={0}
          aria-label={`Play ${localizedTitle}`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMediaClick();
            }
          }}
        >
          {hasValidImage ? (
            <div className="aspect-square relative bg-muted overflow-hidden">
              <Image
                src={mainImage}
                alt={localizedTitle}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                quality={100}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="text-black text-2xl leading-none">▶</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-square relative bg-muted overflow-hidden">
              <Image
                src="/placeholder.webp"
                alt={localizedTitle}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                quality={100}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="text-black text-2xl leading-none">▶</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-1 pb-4 px-4 flex flex-col min-h-[120px]">
        <div className="flex-1 space-y-1">
          <div className="cursor-pointer" onClick={handleMediaClick}>
            <h3 className="font-medium text-base leading-tight hover:text-primary transition-colors line-clamp-2 break-words overflow-wrap-anywhere">
              {localizedTitle}
            </h3>
          </div>

          {localizedDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words overflow-wrap-anywhere">
              {localizedDescription}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {mediaItem.artist && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded-sm ${button.badgeMuted}`}
              >
                {mediaItem.artist}
              </span>
            )}
            {mediaItem.genre && (
              <span className="px-2 py-1 text-xs font-medium rounded-sm bg-purple-900 text-purple-200">
                {mediaItem.genre}
              </span>
            )}
          </div>
          <div
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium cursor-pointer"
            onClick={handleMediaClick}
          >
            {t(currentLanguage, 'eventShowcase.media.play')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MediaShowcase({ media }: MediaShowcaseProps) {
  const { currentLanguage } = useTranslation();
  const { button } = useTheme();

  const hasMedia = media && media.length > 0;

  return (
    <section className="pt-16 md:pt-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-1 h-12 bg-white"></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {t(currentLanguage, 'eventShowcase.media.title')}
              <span className="text-white/60 mx-3 hidden md:inline">·</span>
              <span className="text-white/70 font-normal text-xl md:text-2xl block md:inline-block transform -translate-y-[5px]">
                {t(currentLanguage, 'eventShowcase.media.subtitle')}
              </span>
            </h2>
          </div>
        </div>

        {hasMedia ? (
          <>
            {/* Single row, horizontal scroll */}
            <div className="flex gap-6 overflow-x-auto pb-4 mb-12 scrollbar-hide -mx-4 px-4 md:-mx-8 md:px-8">
              {media.slice(0, Math.min(media.length, 25)).map(mediaItem => (
                <div key={mediaItem._id} className="flex-shrink-0 w-[280px]">
                  <MediaCard mediaItem={mediaItem} />
                </div>
              ))}
              {media.length > 25 && (
                <Link
                  href="/archives"
                  className="flex-shrink-0 w-[280px] group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-sm border-border/40 bg-card p-0 block"
                >
                  <div className="relative rounded-t-sm overflow-hidden">
                    <div
                      className={`aspect-square relative bg-gradient-to-br ${button.gradient} flex items-center justify-center`}
                    >
                      <div
                        className={`text-6xl ${button.gradientText} transition-colors duration-300`}
                      >
                        +
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 pb-4 px-4 space-y-1">
                    <h3 className="font-medium text-base leading-tight text-center hover:text-primary transition-colors">
                      {t(currentLanguage, 'eventShowcase.media.viewAll')}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {currentLanguage === 'fr'
                        ? `${media.length - 25} média${media.length - 25 > 1 ? 's' : ''} de plus`
                        : `${media.length - 25} more media`}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </>
        ) : (
          /* Coming Soon Message - using translations */
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20">
            <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
              {t(currentLanguage, 'eventShowcase.media.comingSoon.title')}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {t(currentLanguage, 'eventShowcase.media.comingSoon.description')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
