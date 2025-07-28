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

            {/* Role badge */}
            {badge && (
              <div className="absolute top-6 right-6">
                <span
                  className={`px-3 py-1 text-xs font-bold text-white rounded-full ${badge.color} badge-pulse`}
                >
                  {badge.label}
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden hover-scale-sm ring-2 ring-gray-200 dark:ring-zinc-700 flex-shrink-0">
                <Image
                  src={artist.imageUrl || "/placeholder.webp"}
                  width={32}
                  height={32}
                  alt={`${artist.name} avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hover-translate flex-1 min-w-0">
                {(artist.socialHandle || artist.socialLink) && (
                  <div className="text-sm text-gray-700 dark:text-zinc-200 truncate">
                    {artist.socialLink ? (
                      <Link
                        href={artist.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 transition-colors"
                      >
                        @{artist.socialHandle || "social"}
                      </Link>
                    ) : (
                      <span>@{artist.socialHandle}</span>
                    )}
                  </div>
                )}
                {socialPlatform && (
                  <div className="text-xs text-gray-500 dark:text-zinc-500">
                    {socialPlatform}
                  </div>
                )}
                {artist.bio && !artist.description && (
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1 line-clamp-2">
                    {artist.bio}
                  </div>
                )}
              </div>
            </div>

            {/* Full Description */}
            {artist.description && (
              <div className="mb-4">
                <div className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                  {artist.description.split('\n').map((paragraph, index) => (
                    <p key={index} className={index > 0 ? 'mt-3' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

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
