"use client";

import Image from "next/image";
import Link from "next/link";
import { IG } from "@/components/icons/IG";
import { t } from "@/lib/i18n/translations";

interface Artist {
  _id: string;
  name: string;
  bio?: string;
  image?: string;
  socialLink?: string;
  isResident?: boolean;
}

interface ArtistCardProps {
  artist: Artist;
  currentLanguage: string;
}

export default function ArtistCard({
  artist,
  currentLanguage,
}: ArtistCardProps) {
  const cardBaseClasses =
    "relative flex flex-col w-full max-w-sm bg-white dark:bg-zinc-900 rounded-sm shadow-lg dark:shadow-2xl dark:shadow-black/80 overflow-hidden";
  const artistDisplayName = artist.name || "Artist";

  return (
    <div className={cardBaseClasses}>
      {artist.image && (
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={artist.image}
            alt={t(currentLanguage, "artistCard.imageAlt", {
              artistName: artistDisplayName,
            })}
            layout="fill"
            objectFit="cover"
            priority
            className="w-full aspect-square object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 dark:from-black/60 to-transparent pointer-events-none" />

          {/* Artist info overlay */}
          <div className="absolute top-6 left-6">
            <h2 className="text-2xl font-medium text-white drop-shadow-lg">
              {artist.name}
            </h2>
          </div>

          {/* Resident badge at bottom right */}
          {artist.isResident && (
            <div className="absolute bottom-3 right-3">
              <div className="inline-flex items-center px-2 py-1 text-xs bg-green-200/80 dark:bg-green-800/50 text-green-900 dark:text-green-200 rounded-sm font-semibold">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {t(currentLanguage, "artistCard.residentBadge")}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {!artist.image && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex flex-col">
                <h4 className="font-bold text-2xl text-gray-100 truncate leading-tight mb-2">
                  {artist.name}
                </h4>
                {artist.isResident && (
                  <div className="inline-flex items-center px-2 py-1 text-xs bg-green-200/80 dark:bg-green-800/50 text-green-900 dark:text-green-200 rounded-sm font-semibold">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="font-medium">
                      {t(currentLanguage, "artistCard.residentBadge")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {artist.socialLink && (
              <Link
                href={artist.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(currentLanguage, "artistCard.socialAriaLabel", {
                  artistName: artistDisplayName,
                })}
                className="text-gray-300 dark:text-gray-300"
              >
                <IG className="h-6 w-6" />
              </Link>
            )}
          </div>
        )}

        {artist.image && artist.socialLink && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="text-gray-500 dark:text-zinc-500 text-sm">
                Social
              </div>
            </div>
            <Link
              href={artist.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(currentLanguage, "artistCard.socialAriaLabel", {
                artistName: artistDisplayName,
              })}
              className="text-gray-300 dark:text-gray-300"
            >
              <IG className="h-6 w-6" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
