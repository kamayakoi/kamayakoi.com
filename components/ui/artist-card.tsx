"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ArtistData } from "@/lib/sanity/queries";

interface ArtistCardProps {
  artist: ArtistData;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  // Extract social platform from URL or use generic social if handle exists
  const getSocialPlatform = (url?: string) => {
    if (!url) return null;
    if (url.includes("instagram.com")) return { name: "Instagram" };
    if (url.includes("twitter.com") || url.includes("x.com")) return { name: "Twitter" };
    if (url.includes("soundcloud.com")) return { name: "SoundCloud" };
    if (url.includes("youtube.com")) return { name: "YouTube" };
    return { name: "Social" };
  };

  // Get role badge info
  const getRoleBadge = (role?: string, isResident?: boolean) => {
    // Don't show role badge if artist is resident (handled separately at bottom right)
    if (isResident) return null;

    switch (role) {
      case "host":
        return { label: "HOST", variant: "default" as const, className: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" };
      case "mc":
        return { label: "MC", variant: "default" as const, className: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" };
      case "producer":
        return { label: "PRODUCER", variant: "default" as const, className: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" };
      case "dj":
        return { label: "DJ", variant: "default" as const, className: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" };
      case "resident":
        return { label: "RESIDENT", variant: "default" as const, className: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" };
      case "artist":
        return { label: "ARTIST", variant: "default" as const, className: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" };
      default:
        return null;
    }
  };

  const badge = getRoleBadge(artist.role, artist.isResident);
  const socialPlatform = getSocialPlatform(artist.socialLink);

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 rounded-sm border-border/40 bg-card p-0 mb-6">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative overflow-hidden md:w-1/3">
          <div className="aspect-square relative bg-muted overflow-hidden">
            <Image
              src={artist.imageUrl || "/placeholder.webp"}
              alt={artist.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              quality={100}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>

          {/* Artist name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-xl font-bold text-white drop-shadow-lg mb-2">
              {artist.name}
            </h2>

            {/* Role badge */}
            {badge && (
              <Badge
                variant={badge.variant}
                className={`text-xs font-bold text-white border-0 shadow-lg ${badge.className}`}
              >
                {badge.label}
              </Badge>
            )}
          </div>

          {/* Resident badge at bottom right */}
          {artist.isResident && (
            <div className="absolute bottom-4 right-4">
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
        <CardContent className="p-6 md:w-2/3 flex flex-col justify-between">
          {/* Social Links */}
          {(artist.socialHandle || artist.socialLink) && (
            <div className="mb-4">
              {artist.socialLink ? (
                <Link
                  href={artist.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="font-bold">@</span>
                  {artist.socialHandle || "social"}
                </Link>
              ) : (
                <div className="inline-flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                  <span className="font-bold">@</span>
                  {artist.socialHandle}
                </div>
              )}
              {socialPlatform && (
                <p className="text-sm text-muted-foreground mt-1">
                  {socialPlatform.name}
                </p>
              )}
            </div>
          )}

          {/* Bio Section */}
          {artist.bio && (
            <div className="mb-4 flex-1">
              <div className="text-muted-foreground leading-relaxed">
                {artist.bio.split("\n").map((line, index) => {
                  const trimmedLine = line.trim();
                  if (trimmedLine === "") {
                    return <br key={index} />;
                  }
                  return (
                    <p key={index} className="mb-3 last:mb-0">
                      {trimmedLine}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Video */}
          {artist.videoUrl && (
            <div className="mb-4">
              <video
                src={artist.videoUrl}
                controls
                className="w-full rounded-sm shadow-sm border"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
              {artist.videoCaption && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {artist.videoCaption}
                </p>
              )}
            </div>
          )}

          {/* Separator */}
          <div className="mt-6 pt-4 border-t border-border/40"></div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ArtistCard;
