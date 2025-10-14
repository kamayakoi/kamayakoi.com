"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Ticket,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
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
  slug?: string | { current: string };
  author?: {
    name: string;
    image?: string;
  };
  artist?: string;
  date?: string;
  publishedAt?: string;
  videoUrl?: string;
  ticketsAvailable?: boolean;
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
  featuredEvents?: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
    date: string;
    time?: string;
    location?:
      | string
      | {
          venueName?: string;
          address?: string;
        };
    description?: {
      en?: string;
      fr?: string;
    };
    flyer?: {
      url: string;
    };
    ticketsAvailable?: boolean;
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
  featuredEvents,
  highlightedContent,
}: HeroSectionProps) {
  const { currentLanguage } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [isTicketsButtonVisible, setIsTicketsButtonVisible] = useState(true);
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
              : "",
          videoUrl:
            item.type === "video"
              ? item.video?.asset?.url || item.videoUrl || ""
              : undefined,
          title: item.title,
          description: item.description,
          thumbnail:
            item.type === "video" && item.image?.asset?.url
              ? item.image.asset.url
              : undefined,
        }))
    : [];

  // Convert featured events to ContentItem format
  const featuredEventItems: ContentItem[] = featuredEvents
    ? featuredEvents.map((event) => {
        // Select description based on current language
        const description = event.description
          ? event.description[
              currentLanguage as keyof typeof event.description
            ] ||
            event.description.en ||
            event.description.fr
          : undefined;

        return {
          id: event._id,
          type: "event",
          src: event.flyer?.url || "",
          title: event.title,
          description: description,
          slug: event.slug,
          date: event.date,
          publishedAt: event.date, // Use date as publishedAt for events
          ticketsAvailable: event.ticketsAvailable,
        };
      })
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
          type:
            item.type === "video"
              ? "video"
              : item.type === "event"
                ? "event"
                : "image", // Normalize type for hero display
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
          ticketsAvailable: item.type === "event" ? true : undefined, // Assume tickets are available for events
        };
      })
    : [];

  // Combine all content sources with priority: highlighted > events first + sanity > props > defaults
  const content =
    highlightedItems.length > 0
      ? highlightedItems
      : sanityContent.length > 0 || featuredEventItems.length > 0
        ? [...featuredEventItems, ...sanityContent] // Events come first
        : contentItems.length > 0
          ? contentItems
          : defaultContent;

  const currentItem = content[currentIndex];

  // Auto-play video when video type is selected
  useEffect(() => {
    if (currentItem?.type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((error) => {
          console.log("Video autoplay failed:", error);
          // Handle play error silently - browser may block autoplay
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentItem, isPlaying]);

  // Set isPlaying to true when switching to a video
  useEffect(() => {
    if (currentItem?.type === "video") {
      setIsPlaying(true);
    }
  }, [currentIndex, currentItem]);

  // Keep video muted state in sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Show tickets button with animation delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTicketsButtonVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle close button click
  const handleCloseTicketsButton = () => {
    setIsTicketsButtonVisible(false);
  };

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

  const toggleSound = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const renderContent = () => {
    if (currentItem.type === "video" || currentItem.type === "media") {
      // Handle video content (both video type and media with videoUrl)
      const videoSrc = currentItem.videoUrl || currentItem.src;

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
            autoPlay
            loop
            muted={isMuted}
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
        {currentItem.type === "video" ? null : currentItem.type === "event" ? ( // No overlay for videos
          // Darker overlay for events
          <div className="absolute inset-0 bg-black/75" />
        ) : (
          // Very minimal overlay for other content
          <div className="absolute inset-0 bg-black/20" />
        )}
      </div>

      {/* Content Overlay - Hidden for videos when playing */}
      {!(currentItem.type === "video" && isPlaying) && (
        <div className="relative z-10 flex items-start justify-start min-h-screen pt-44 md:pt-20 pl-5 md:pl-20">
          <div className="text-left px-4 md:px-8 max-w-2xl mr-4 md:mr-0">
            {currentItem.title && (
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
                {currentItem.title}
              </h1>
            )}

            {/* Show description for all content, smaller for events */}
            {currentItem.description && (
              <p
                className={`font-medium tracking-wide text-white/90 mb-8 drop-shadow-md ${
                  currentItem.type === "event"
                    ? "text-base sm:text-lg md:text-xl opacity-95"
                    : "text-xl sm:text-2xl md:text-3xl"
                }`}
              >
                {currentItem.type === "event"
                  ? currentItem.description.split(".")[0] +
                    (currentItem.description.includes(".") ? "." : "")
                  : currentItem.description}
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
              {/* Show date for events right after title, for others in additional info */}
              {currentItem.type === "event" && currentItem.date && (
                <p className="hidden md:block text-white/80 text-sm">
                  {new Date(currentItem.date).toLocaleDateString(
                    currentLanguage === "fr" ? "fr-FR" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              )}
              {/* Show date for non-events in additional info section */}
              {currentItem.type !== "event" && currentItem.date && (
                <p className="text-white/70 text-sm">
                  {new Date(currentItem.date).toLocaleDateString(
                    currentLanguage === "fr" ? "fr-FR" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              )}
              {/* Show publishedAt for non-events only (events use date field) */}
              {currentItem.type !== "event" && currentItem.publishedAt && (
                <p className="text-white/70 text-sm">
                  {new Date(currentItem.publishedAt).toLocaleDateString(
                    currentLanguage === "fr" ? "fr-FR" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-start items-start">
              {/* Play/Pause button for videos */}
              {(currentItem.type === "video" ||
                currentItem.type === "media") && (
                <button
                  onClick={togglePlayPause}
                  className={`p-4 rounded-sm border-2 transition-all duration-300 ${
                    showControls
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
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
                      : t(
                          currentLanguage,
                          "eventShowcase.hero.actions.playVideo",
                        )
                  }
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </button>
              )}

              {/* Navigation buttons for non-event content with links */}
              {(currentItem.slug || currentItem.videoUrl) &&
                currentItem.type !== "event" && (
                  <button
                    onClick={() => {
                      if (currentItem.type === "article" && currentItem.slug) {
                        window.location.href = `/stories/${currentItem.slug}`;
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
                      t(
                        currentLanguage,
                        "eventShowcase.hero.actions.readArticle",
                      )}
                    {currentItem.type === "media" &&
                      t(
                        currentLanguage,
                        "eventShowcase.hero.actions.watchMedia",
                      )}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Event Hover Overlay - Left side overlay for events */}
      {currentItem.type === "event" && (
        <>
          {/* Hover overlay that covers the entire image */}
          <div className="absolute inset-0 z-10 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/40">
            {/* Event title and content on the left */}
            <div className="absolute left-8 md:top-1/2 top-3/4 md:-translate-y-1/2 -translate-y-1/4 max-w-md">
              {currentItem.title && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight text-white drop-shadow-lg">
                  {currentItem.title}
                </h1>
              )}

              {/* Event description removed for cleaner look */}
            </div>

            {/* Get Tickets button on bottom right */}
            {currentItem.slug && (
              <div className="absolute bottom-8 right-8">
                <button
                  onClick={() => {
                    if (currentItem.slug) {
                      // Use the same approach as event-showcase.tsx
                      const slug = (currentItem.slug as { current: string })
                        .current;
                      window.location.href = `/events/${slug}`;
                    }
                  }}
                  className="px-8 py-4 md:px-6 md:py-3 bg-white text-black hover:bg-white/90 rounded-sm font-semibold transition-all duration-300 shadow-lg text-lg md:text-base"
                >
                  {t(currentLanguage, "heroSection.getYourTickets")}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Get Tickets Button - Floating Bottom Right */}
      {isTicketsButtonVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed z-50
                     right-4 bottom-24  // Mobile: much higher up
                     sm:right-6 sm:bottom-6  // Small screens: default size & pos
                     md:right-8 md:bottom-16  // Medium screens and up: larger, higher up
                     lg:right-24 lg:bottom-20  // Larger screens: more to the left
                     "
          onMouseEnter={() => setShowCloseButton(true)}
          onMouseLeave={() => setShowCloseButton(false)}
        >
          {/* Close button - positioned as a separate element */}
          {showCloseButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute -top-3 -right-3 z-20"
            >
              <button
                onClick={handleCloseTicketsButton}
                className="bg-[#2a2a2a] rounded-sm w-6 h-6 flex items-center justify-center shadow-md hover:bg-[#3a3a3a] transition-colors border border-gray-700"
                aria-label="Close tickets button"
              >
                <X className="h-3.5 w-3.5 text-gray-300" />
              </button>
            </motion.div>
          )}

          <div className="bg-[#1a1a1a] rounded-sm shadow-2xl overflow-hidden border border-gray-800 relative min-w-[160px] md:min-w-[180px] lg:min-w-[200px]">
            {/* Button */}
            <div className="w-full">
              <button
                onClick={() => {
                  if (currentItem.type === "event" && currentItem.slug) {
                    const slug = (currentItem.slug as { current: string })
                      .current;
                    window.location.href = `/events/${slug}`;
                  } else {
                    window.location.href = `/events`;
                  }
                }}
                className="w-full py-4 px-6 md:px-8 md:py-5 lg:px-10 lg:py-4 bg-teal-800 hover:bg-teal-700 text-teal-200 hover:text-white text-base md:text-lg font-medium transition-all duration-300 rounded-b-sm flex items-center justify-center uppercase shadow-lg"
                aria-label="Get tickets"
              >
                <Ticket className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                <span className="font-medium">
                  {t(currentLanguage, "heroSection.getTickets")}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sound Toggle Button - Bottom Left (only for videos) */}
      {currentItem.type === "video" && (
        <button
          onClick={toggleSound}
          className="absolute bottom-2 md:bottom-8 left-4 md:left-8 z-20 p-2 bg-black/10 hover:bg-black/30 rounded-sm text-white focus:outline-none transition-colors duration-200"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}

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
