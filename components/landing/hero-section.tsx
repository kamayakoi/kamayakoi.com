"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

// Define content item interface
interface ContentItem {
  id: string;
  type: "video" | "image";
  src: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

// Props interface
interface HeroSectionProps {
  contentItems?: ContentItem[];
}

export function HeroSection({ contentItems = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Default content items (will be replaced with Sanity data later)
  const defaultContent: ContentItem[] = [
    {
      id: "1",
      type: "image",
      src: "/banner.webp",
      title: "KAMAYAKOI",
      description: "Connecting Club Culture To The World",
    },
    {
      id: "2",
      type: "image",
      src: "/placeholder.webp",
      title: "Featured Event",
      description: "Upcoming showcase",
    },
  ];

  const content = contentItems.length > 0 ? contentItems : defaultContent;
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

  // Handle mouse movement to show/hide controls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setShowControls(false), 3000);
    };

    const handleMouseLeave = () => {
      setShowControls(false);
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

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % content.length);
    setIsPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + content.length) % content.length);
    setIsPlaying(false);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderContent = () => {
    if (currentItem.type === "video") {
      return (
        <video
          ref={videoRef}
          autoPlay={isPlaying}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={currentItem.src}
          poster={currentItem.thumbnail}
        />
      );
    } else {
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
    }
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

          {/* Play/Pause button for videos */}
          {currentItem.type === "video" && (
            <button
              onClick={togglePlayPause}
              className={`mb-8 p-4 rounded-sm border-2 transition-all duration-300 ${
                showControls ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } ${
                isPlaying
                  ? "bg-white/20 border-white text-white hover:bg-white/30"
                  : "bg-white border-white text-black hover:bg-white/90"
              }`}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8">
        {/* Previous Button */}
        {content.length > 1 && (
          <button
            onClick={goToPrev}
            onMouseEnter={() => setShowLeftArrow(true)}
            onMouseLeave={() => setShowLeftArrow(false)}
            className={`p-2 rounded-sm bg-black/10 hover:bg-black/20 text-white transition-all duration-200 backdrop-blur-sm ${showLeftArrow ? "opacity-100" : "opacity-0"}`}
            aria-label="Previous content"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button */}
        {content.length > 1 && (
          <button
            onClick={goToNext}
            onMouseEnter={() => setShowRightArrow(true)}
            onMouseLeave={() => setShowRightArrow(false)}
            className={`p-2 rounded-sm bg-black/10 hover:bg-black/20 text-white transition-all duration-200 backdrop-blur-sm ${showRightArrow ? "opacity-100" : "opacity-0"}`}
            aria-label="Next content"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dot Indicators */}
      {content.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {content.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`w-3 h-1.5 rounded-sm transition-all duration-200 ${
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
