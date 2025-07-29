"use client";

import Image from "next/image";
import Link from "next/link";
import { IG } from "@/components/icons/IG";

interface Artist {
  _id: string;
  name: string;
  bio?: string;
  image?: string; // Expected to be a URL
  socialLink?: string;
  isResident?: boolean;
}

interface ArtistHoverCardProps {
  artist: Artist;
}

export default function ArtistHoverCard({ artist }: ArtistHoverCardProps) {
  return (
    <li className="text-gray-200 py-1 cursor-default">
      <span className="relative inline-flex items-center">
        <span className="text-primary mr-3">◆</span>
        {artist.name}
        <div className="absolute z-20 bottom-full mb-2 left-full ml-4 w-80 max-w-sm bg-white dark:bg-zinc-900 rounded-sm shadow-lg dark:shadow-2xl dark:shadow-black/80 overflow-hidden">
          {artist.image && (
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <Image
                src={artist.image}
                alt={`${artist.name ?? "Artist"}'s image`}
                layout="fill"
                objectFit="cover"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 dark:from-black/60 to-transparent pointer-events-none" />

              {/* Artist info overlay */}
              <div className="absolute top-3 left-3">
                <h4 className="text-xl font-medium text-white drop-shadow-lg">
                  {artist.name}
                </h4>
              </div>

              {/* Resident badge at bottom right */}
              {artist.isResident && (
                <div className="absolute bottom-3 right-3">
                  <div className="inline-flex items-center px-2 py-1 text-xs bg-green-200/80 dark:bg-green-800/50 text-green-900 dark:text-green-200 rounded-sm font-semibold">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Resident
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-5">
            {!artist.image && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                    {artist.name}
                  </h4>
                  {artist.isResident && (
                    <div className="inline-flex items-center px-2 py-1 text-xs bg-green-200/80 dark:bg-green-800/50 text-green-900 dark:text-green-200 rounded-sm font-semibold">
                      <span className="relative flex h-2 w-2 mr-1.5">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Resident
                    </div>
                  )}
                </div>
                {artist.socialLink && (
                  <Link
                    href={artist.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${artist.name ?? "Artist"}'s social media`}
                    className="text-gray-300 dark:text-gray-300"
                  >
                    <IG className="h-6 w-6" />
                  </Link>
                )}
              </div>
            )}

            {artist.image && artist.socialLink && (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-gray-500 dark:text-zinc-500 text-sm">
                    Social
                  </div>
                </div>
                <Link
                  href={artist.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${artist.name ?? "Artist"}'s social media`}
                  className="text-gray-300 dark:text-gray-300"
                >
                  <IG className="h-6 w-6" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </span>
    </li>
  );
}
