"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

// Define content item interface
interface ContentItem {
  id: string;
  type: "video" | "image" | "article" | "media" | "event";
  src: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  slug?: string;
  author?: {
    name: string;
    image?: string;
  };
  artist?: string;
  date?: string;
  publishedAt?: string;
  videoUrl?: string;
}

// Props interface
interface HeroSectionProps {
  contentItems?: ContentItem[];
  sanityHeroItems?: {
    _key: string;
    title?: string;
    description?: string;
    type: "image" | "video";
    image?: {
      asset: { url: string };
      alt?: string;
      caption?: string;
    };
    video?: {
      asset: { url: string };
    };
    videoUrl?: string;
    isActive: boolean;
  }[];
  highlightedContent?: {
    _id: string;
    type: "article" | "media" | "event" | "video" | "image";
    title: string;
    description?: string;
    image?: string;
    videoUrl?: string;
    slug?: string;
    publishedAt?: string;
    artist?: string;
    date?: string;
    author?: {
      name: string;
      image?: string;
    };
  }[];
}

export function HeroSection({
  contentItems = [],
  sanityHeroItems,
  highlightedContent,
}: HeroSectionProps) {
  const { currentLanguage } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Default content items (fallback)
  const defaultContent: ContentItem[] = [
    {
      id: "1",
      type: "image",
      src: "/banner.webp",
      // Banner image without text overlay
    },
  ];

  // Convert Sanity hero items to ContentItem format
  const sanityContent: ContentItem[] = sanityHeroItems
    ? sanityHeroItems
        .filter((item) => item.isActive)
        .map((item) => ({
          id: item._key,
          type: item.type,
          src:
            item.type === "image" && item.image?.asset?.url
              ? item.image.asset.url
              : item.video?.asset?.url
                ? item.video.asset.url
                : item.videoUrl || "",
          title: item.title,
          description: item.description,
          thumbnail:
            item.type === "video" && item.image?.asset?.url
              ? item.image.asset.url
              : undefined,
        }))
    : [];

  // Convert highlighted content to ContentItem format
  const highlightedItems: ContentItem[] = highlightedContent
    ? highlightedContent.slice(0, 15).map((item) => {
        // Ensure we have a valid src - prioritize image for display, videoUrl for videos
        let src = "";
        if (item.type === "video" && item.videoUrl) {
          src = item.videoUrl;
        } else if (item.image) {
          src = item.image;
        } else if (item.videoUrl) {
          src = item.videoUrl;
        }

        return {
          id: item._id,
          type: item.type === "video" ? "video" : "image", // Normalize type for hero display
          src: src,
          title: item.title,
          description: item.description,
          thumbnail: item.image,
          slug: item.slug,
          author: item.author,
          artist: item.artist,
          date: item.date,
          publishedAt: item.publishedAt,
          videoUrl: item.videoUrl,
        };
      })
    : [];

  // Combine all content sources with priority: highlighted > sanity > props > defaults
  const content =
    highlightedItems.length > 0
      ? highlightedItems
      : sanityContent.length > 0
        ? sanityContent
        : contentItems.length > 0
          ? contentItems
          : defaultContent;

  const currentItem = content[currentIndex];

  // Auto-play video when video type is selected
  useEffect(() => {
    if (currentItem?.type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Handle play error silently
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentItem, isPlaying]);

  // Handle mouse movement to show/hide controls and navigation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      setShowLeftArrow(true);
      setShowRightArrow(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
        setShowLeftArrow(false);
        setShowRightArrow(false);
      }, 3000);
    };

    const handleMouseLeave = () => {
      setShowControls(false);
      setShowLeftArrow(false);
      setShowRightArrow(false);
    };

    const section = document.getElementById("hero-section");
    if (section) {
      section.addEventListener("mousemove", handleMouseMove);
      section.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (section) {
        section.removeEventListener("mousemove", handleMouseMove);
        section.removeEventListener("mouseleave", handleMouseLeave);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % content.length);
    setIsPlaying(false);
  }, [content.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + content.length) % content.length);
    setIsPlaying(false);
  }, [content.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    const section = document.getElementById("hero-section");
    if (section) {
      section.addEventListener("keydown", handleKeyPress);
      // Make section focusable for keyboard navigation
      section.setAttribute("tabindex", "0");
    }

    return () => {
      if (section) {
        section.removeEventListener("keydown", handleKeyPress);
      }
    };
  }, [goToNext, goToPrev]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderContent = () => {
    if (currentItem.type === "video" || currentItem.type === "media") {
      // Handle video content (both video type and media with videoUrl)
      const videoSrc =
        currentItem.type === "video"
          ? currentItem.src
          : currentItem.videoUrl || currentItem.src;

      if (
        videoSrc &&
        (videoSrc.includes("youtube.com") ||
          videoSrc.includes("youtu.be") ||
          videoSrc.includes("vimeo.com"))
      ) {
        // Handle embedded videos (YouTube, Vimeo)
        return (
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src={videoSrc}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        );
      } else if (videoSrc) {
        // Handle direct video files
        return (
          <video
            ref={videoRef}
            autoPlay={isPlaying}
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={videoSrc}
            poster={currentItem.thumbnail || currentItem.src}
          />
        );
      }
    }

    // Handle image content (default fallback)
    return (
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={currentItem.src}
          alt={currentItem.title || "Hero content"}
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Background Content */}
      <div className="absolute inset-0">
        {renderContent()}

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center px-4 md:px-8 max-w-4xl mx-auto">
          {currentItem.title && (
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
              {currentItem.title}
            </h1>
          )}

          {currentItem.description && (
            <p className="text-lg sm:text-xl md:text-2xl font-light tracking-wide text-white/90 mb-8 drop-shadow-md">
              {currentItem.description}
            </p>
          )}

          {/* Additional info based on content type */}
          <div className="mb-8 space-y-2">
            {currentItem.author && (
              <p className="text-white/70 text-sm">
                By {currentItem.author.name}
              </p>
            )}
            {currentItem.artist && (
              <p className="text-white/70 text-sm">{currentItem.artist}</p>
            )}
            {currentItem.date && (
              <p className="text-white/70 text-sm">
                {new Date(currentItem.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            {currentItem.publishedAt && (
              <p className="text-white/70 text-sm">
                {new Date(currentItem.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Play/Pause button for videos */}
            {(currentItem.type === "video" || currentItem.type === "media") && (
              <button
                onClick={togglePlayPause}
                className={`p-4 rounded-sm border-2 transition-all duration-300 ${
                  showControls ? "opacity-100 scale-100" : "opacity-0 scale-95"
                } ${
                  isPlaying
                    ? "bg-white/20 border-white text-white hover:bg-white/30"
                    : "bg-white border-white text-white hover:bg-white/90"
                }`}
                aria-label={
                  isPlaying
                    ? t(
                        currentLanguage,
                        "eventShowcase.hero.actions.pauseVideo",
                      )
                    : t(currentLanguage, "eventShowcase.hero.actions.playVideo")
                }
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
            )}

            {/* Navigation buttons for content with links */}
            {((currentItem.type === "article" && currentItem.slug) ||
              (currentItem.type === "event" && currentItem.slug) ||
              currentItem.type === "media") && (
              <button
                onClick={() => {
                  if (currentItem.type === "article" && currentItem.slug) {
                    window.location.href = `/stories/${currentItem.slug}`;
                  } else if (currentItem.type === "event" && currentItem.slug) {
                    window.location.href = `/events/${currentItem.slug}`;
                  } else if (
                    currentItem.type === "media" &&
                    currentItem.videoUrl
                  ) {
                    window.open(currentItem.videoUrl, "_blank");
                  }
                }}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 rounded-sm transition-all duration-300"
              >
                {currentItem.type === "article" &&
                  t(currentLanguage, "eventShowcase.hero.actions.readArticle")}
                {currentItem.type === "event" &&
                  t(currentLanguage, "eventShowcase.hero.actions.viewEvent")}
                {currentItem.type === "media" &&
                  t(currentLanguage, "eventShowcase.hero.actions.watchMedia")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 z-10">
        {/* Previous Button */}
        {content.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log("Previous button clicked");
              goToPrev();
            }}
            onMouseEnter={() => setShowLeftArrow(true)}
            onMouseLeave={() => setShowLeftArrow(false)}
            className={`p-2 rounded-sm bg-black/10 hover:bg-black/20 text-white transition-all duration-200 backdrop-blur-sm cursor-pointer z-20 ${showLeftArrow ? "opacity-100" : "opacity-30"}`}
            aria-label="Previous content"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button */}
        {content.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log("Next button clicked");
              goToNext();
            }}
            onMouseEnter={() => setShowRightArrow(true)}
            onMouseLeave={() => setShowRightArrow(false)}
            className={`p-2 rounded-sm bg-black/10 hover:bg-black/20 text-white transition-all duration-200 backdrop-blur-sm cursor-pointer z-20 ${showRightArrow ? "opacity-100" : "opacity-30"}`}
            aria-label="Next content"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dot Indicators */}
      {content.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {content.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                console.log("Dot clicked:", index);
                goToIndex(index);
              }}
              className={`w-3 h-1.5 rounded-sm transition-all duration-200 cursor-pointer ${
                index === currentIndex
                  ? "bg-white scale-110"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to content ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
