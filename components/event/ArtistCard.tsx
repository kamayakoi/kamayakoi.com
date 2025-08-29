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
    "relative flex flex-col w-64 md:w-80 bg-white dark:bg-[#1a1a1a] rounded-sm shadow-lg dark:shadow-2xl dark:shadow-black/80 overflow-hidden";
  const artistDisplayName = artist.name || "Artist";

  return (
    <div className={cardBaseClasses}>
      {artist.image && artist.socialLink && (
        <Link
          href={artist.socialLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t(currentLanguage, "artistCard.socialAriaLabel", {
            artistName: artistDisplayName,
          })}
          className="block relative w-full h-64 md:h-80 overflow-hidden group cursor-pointer"
        >
          <Image
            src={artist.image}
            alt={t(currentLanguage, "artistCard.imageAlt", {
              artistName: artistDisplayName,
            })}
            fill
            style={{ objectFit: "cover" }}
            priority
            className="object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300" />

          {/* Artist name overlay - appears on hover/touch */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
            <h2 className="text-3xl font-bold text-white drop-shadow-2xl text-center px-4">
              {artist.name}
            </h2>
          </div>

          {/* Resident badge at bottom right */}
          {artist.isResident && (
            <div className="absolute bottom-4 right-4 z-10">
              <div className="inline-flex items-center px-2 py-1 text-xs bg-green-200/80 dark:bg-green-800/50 text-green-900 dark:text-green-200 rounded-sm font-semibold">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="relative inline-flex rounded-sm h-2 w-2 bg-green-500"></span>
                </span>
                {t(currentLanguage, "artistCard.residentBadge")}
              </div>
            </div>
          )}
        </Link>
      )}

      {artist.image && !artist.socialLink && (
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <Image
            src={artist.image}
            alt={t(currentLanguage, "artistCard.imageAlt", {
              artistName: artistDisplayName,
            })}
            fill
            style={{ objectFit: "cover" }}
            priority
            className="object-cover"
          />

          {/* Resident badge at bottom right */}
          {artist.isResident && (
            <div className="absolute bottom-4 right-4">
              <div className="inline-flex items-center px-2 py-1 text-xs bg-green-200/80 dark:bg-green-800/50 text-green-900 dark:text-green-200 rounded-sm font-semibold">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="relative inline-flex rounded-sm h-2 w-2 bg-green-500"></span>
                </span>
                {t(currentLanguage, "artistCard.residentBadge")}
              </div>
            </div>
          )}
        </div>
      )}

      {!artist.image && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex flex-col">
                <h4 className="font-bold text-2xl text-gray-100 truncate leading-tight mb-2">
                  {artist.name}
                </h4>
                {artist.isResident && (
                  <div className="inline-flex items-center px-2 py-1 text-xs bg-green-200/80 dark:bg-green-800/50 text-green-900 dark:text-green-200 rounded-sm font-semibold">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="relative inline-flex rounded-sm h-2 w-2 bg-green-500"></span>
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
        </div>
      )}
    </div>
  );
}
