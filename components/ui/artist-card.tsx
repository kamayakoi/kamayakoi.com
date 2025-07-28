import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArtistData } from "@/lib/sanity/queries";

interface ArtistCardProps {
  artist: ArtistData;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  // Extract social platform from URL or use generic social if handle exists
  const getSocialPlatform = (url?: string) => {
    if (!url) return null;
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter";
    if (url.includes("soundcloud.com")) return "SoundCloud";
    if (url.includes("youtube.com")) return "YouTube";
    return "Social";
  };

  // Get role badge info
  const getRoleBadge = (role?: string, isResident?: boolean) => {
    if (isResident) return { label: "RESIDENT", color: "bg-yellow-500" };

    switch (role) {
      case "host":
        return { label: "HOST", color: "bg-blue-500" };
      case "mc":
        return { label: "MC", color: "bg-purple-500" };
      case "producer":
        return { label: "PRODUCER", color: "bg-green-500" };
      case "dj":
        return { label: "DJ", color: "bg-red-500" };
      case "resident":
        return { label: "RESIDENT", color: "bg-yellow-500" };
      default:
        return null;
    }
  };

  const badge = getRoleBadge(artist.role, artist.isResident);
  const socialPlatform = getSocialPlatform(artist.socialLink);

  return (
    <>
      <style>
        {`
          .hover-scale {
            transition: transform 700ms ease-out;
          }
          
          .hover-scale:hover {
            transform: scale(1.02);
          }
          
          .image-scale {
            transition: transform 700ms ease-out;
          }
          
          .image-container:hover .image-scale {
            transform: scale(1.03);
          }
          
          .hover-translate {
            transition: transform 500ms ease-out;
          }
          
          .hover-translate:hover {
            transform: translateX(4px);
          }
          
          .hover-scale-sm {
            transition: transform 500ms ease-out;
          }
          
          .hover-scale-sm:hover {
            transform: scale(1.1);
          }

          .badge-pulse {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }
        `}
      </style>

      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-zinc-900 rounded-sm shadow-lg dark:shadow-2xl dark:shadow-black/80 overflow-hidden hover-scale">
          <div className="relative overflow-hidden image-container">
            <Image
              src={artist.imageUrl || "/placeholder.webp"}
              width={400}
              height={400}
              alt={artist.name}
              className="w-full aspect-square object-cover image-scale"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 dark:from-black/60 to-transparent pointer-events-none"></div>

            {/* Artist name */}
            <div className="absolute top-6 left-6">
              <h2 className="text-2xl font-medium text-white drop-shadow-lg">
                {artist.name}
              </h2>
            </div>

            {/* Role badge - but not for residents since they have bottom badge */}
            {badge && !artist.isResident && (
              <div className="absolute top-6 right-6">
                <span
                  className={`px-3 py-1 text-xs font-bold text-white rounded-full ${badge.color} badge-pulse`}
                >
                  {badge.label}
                </span>
              </div>
            )}

            {/* Resident badge at bottom right */}
            {artist.isResident && (
              <div className="absolute bottom-3 right-3">
                <div className="inline-flex items-center px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-sm flex-shrink-0">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Resident
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="hover-translate flex-1 min-w-0">
                {(artist.socialHandle || artist.socialLink) && (
                  <div className="text-xl font-medium text-gray-700 dark:text-zinc-200 truncate">
                    {artist.socialLink ? (
                      <Link
                        href={artist.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 transition-colors"
                      >
                        <span className="font-bold">@</span>{artist.socialHandle || "social"}
                      </Link>
                    ) : (
                      <span><span className="font-bold">@</span>{artist.socialHandle}</span>
                    )}
                  </div>
                )}
                {socialPlatform && (
                  <div className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
                    {socialPlatform}
                  </div>
                )}
              </div>
            </div>

            {/* Video */}
            {artist.videoUrl && (
              <div className="mb-4">
                <video
                  src={artist.videoUrl}
                  controls
                  className="w-full rounded-sm shadow-sm"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                {artist.videoCaption && (
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 italic">
                    {artist.videoCaption}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtistCard;
