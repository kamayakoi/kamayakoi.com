"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArtistData } from "@/lib/sanity/queries";

interface ArtistCardProps {
  artist: ArtistData;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
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
        return { label: "PRODUCER", color: "bg-orange-500" };
      case "dj":
        return { label: "DJ", color: "bg-red-500" };
      case "resident":
        return { label: "RESIDENT", color: "bg-yellow-500" };
      case "artist":
        return { label: "ARTIST", color: "bg-indigo-500" };
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
            transition: transform 300ms ease-out;
          }

          .hover-scale:hover {
            transform: scale(1.02);
          }

          .hover-translate {
            transition: transform 300ms ease-out;
          }

          .hover-translate:hover {
            transform: translateX(4px);
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

      <div className="w-full max-w-full">
        <div className="bg-[#1a1a1a] rounded-sm shadow-2xl shadow-black/80 overflow-hidden hover-scale">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative overflow-hidden md:w-1/3">
              <Image
                src={artist.imageUrl || "/placeholder.webp"}
                width={500}
                height={500}
                alt={artist.name}
                className="w-full aspect-[4/3] md:aspect-[1/1] object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

              {/* Artist name */}
              <div className="absolute top-4 left-4">
                <h2 className="text-lg md:text-xl font-medium text-white drop-shadow-lg">
                  {artist.name}
                </h2>
              </div>

              {/* Role badge - but not for residents since they have bottom badge */}
              {badge && !artist.isResident && (
                <div className="absolute top-6 right-6">
                  <span
                    className={`px-3 py-1 text-xs font-bold text-white rounded-sm ${badge.color} badge-pulse`}
                  >
                    {badge.label}
                  </span>
                </div>
              )}

              {/* Resident badge at bottom right */}
              {artist.isResident && (
                <div className="absolute bottom-2 right-2">
                  <div className="inline-flex items-center px-2 py-1 text-xs bg-green-800/50 text-green-200 rounded-sm font-semibold">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="relative inline-flex rounded-sm h-2 w-2 bg-green-500"></span>
                    </span>
                    Resident
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-6 md:w-2/3 flex flex-col justify-start">
              <div className="flex items-center gap-1.5 mb-6">
                <div className="hover-translate flex-1 min-w-0">
                  {(artist.socialHandle || artist.socialLink) && (
                    <div className="text-lg md:text-xl font-medium text-zinc-200 truncate">
                      {artist.socialLink ? (
                        <Link
                          href={artist.socialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-inherit transition-colors"
                        >
                          <span className="font-bold text-lg md:text-xl">
                            @
                          </span>
                          {artist.socialHandle || "social"}
                        </Link>
                      ) : (
                        <span>
                          <span className="font-bold text-lg md:text-xl">
                            @
                          </span>
                          {artist.socialHandle}
                        </span>
                      )}
                    </div>
                  )}
                  {socialPlatform && (
                    <div className="text-base text-zinc-500 mt-1">
                      {socialPlatform}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              {artist.bio && (
                <div className="mb-1.5">
                  <div className="text-gray-300 text-base leading-snug">
                    {artist.bio.split("\n").map((line, index) => {
                      const trimmedLine = line.trim();
                      if (trimmedLine === "") {
                        return <br key={index} />;
                      }
                      return (
                        <p key={index} className="mb-2">
                          {trimmedLine}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Video */}
              {artist.videoUrl && (
                <div className="mb-1.5">
                  <video
                    src={artist.videoUrl}
                    controls
                    className="w-full rounded-sm shadow-sm"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  {artist.videoCaption && (
                    <p className="text-xs text-zinc-500 mt-2 italic">
                      {artist.videoCaption}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtistCard;
