"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import { type EventParallaxData } from "@/lib/sanity/queries";

interface ParallaxGalleryProps {
  events: EventParallaxData[];
}

export default function ParallaxGallery({ events }: ParallaxGalleryProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [mutedStates, setMutedStates] = useState<boolean[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Memoize displayEvents to prevent unnecessary re-renders and fix ESLint warning
  const displayEvents = useMemo(() => {
    // Limit to 5 events max for parallax display and ensure we always have an array
    // Sort by number descending to show highest numbers first (latest events first)
    return events?.slice(0, 5) || [];
  }, [events]);

  // Initialize muted states
  useEffect(() => {
    setMutedStates(new Array(displayEvents.length).fill(true));
  }, [displayEvents.length]);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll-based video management
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const viewportCenter = window.innerHeight / 2;
      let closestIndex = -1;
      let closestDistance = Infinity;

      // Find which section is closest to the center of the viewport
      sectionRefs.current.forEach((section, index) => {
        if (!section) return;

        const sectionRect = section.getBoundingClientRect();
        const sectionCenter = sectionRect.top + sectionRect.height / 2;
        const distance = Math.abs(viewportCenter - sectionCenter);

        // Check if section is at least partially visible
        const isVisible = sectionRect.top < window.innerHeight && sectionRect.bottom > 0;

        if (isVisible && distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Only update if the active index changed
      if (closestIndex !== activeVideoIndex) {
        setActiveVideoIndex(closestIndex);

        // Pause all videos first
        videoRefs.current.forEach((video) => {
          if (video) {
            video.pause();
          }
        });

        // Play the active video if it exists and has a video
        if (closestIndex >= 0 && videoRefs.current[closestIndex] && displayEvents[closestIndex]?.promoVideoUrl) {
          const activeVideo = videoRefs.current[closestIndex];
          if (activeVideo) {
            activeVideo.currentTime = 0; // Reset to beginning
            activeVideo.play().catch(err => {
              console.log("Video autoplay prevented:", err);
            });
          }
        }
      }
    };

    // Add scroll listener with throttling
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [activeVideoIndex, displayEvents]);

  // Create individual transform hooks for each potential event slot (up to 5)
  const transform1 = useTransform(
    scrollYProgress,
    [0, 0.2],
    [-400, 400],
  );
  const transform2 = useTransform(
    scrollYProgress,
    [0.2, 0.4],
    [-400, 400],
  );
  const transform3 = useTransform(
    scrollYProgress,
    [0.4, 0.6],
    [-400, 400],
  );
  const transform4 = useTransform(
    scrollYProgress,
    [0.6, 0.8],
    [-400, 400],
  );
  const transform5 = useTransform(
    scrollYProgress,
    [0.8, 1],
    [-400, 400],
  );

  const transforms = [
    transform1,
    transform2,
    transform3,
    transform4,
    transform5,
  ];

  const handleImageClick = (slug: string) => {
    if (slug) {
      router.push(`/events/${slug}`);
    }
  };

  const toggleVideoSound = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.muted = !video.muted;
      setMutedStates((prev) => {
        const newStates = [...prev];
        newStates[index] = video.muted;
        return newStates;
      });
    }
  };

  // Generate display number with proper padding
  const getDisplayNumber = (event: EventParallaxData, index: number) => {
    if (event.number) {
      return `#${event.number.padStart(3, "0")}`;
    }
    // Fallback: use reverse index based on total events length
    return `#${String(displayEvents.length - index).padStart(3, "0")}`;
  };

  if (displayEvents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        No events available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="parallax-container">
      {displayEvents.map((event, index) => {
        const hasVideo = !!event.promoVideoUrl;
        const isActiveVideo = activeVideoIndex === index;

        return (
          <section
            key={event._id}
            className="img-container"
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
          >
            <div className="media-wrapper">
              {hasVideo ? (
                <div className="relative w-full h-full overflow-hidden rounded">
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={event.promoVideoUrl}
                    loop
                    muted={mutedStates[index]}
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => handleImageClick(event.slug)}
                    onLoadedMetadata={() => {
                      if (videoRefs.current[index]) {
                        videoRefs.current[index]!.muted = mutedStates[index];
                      }
                    }}
                  />
                  {/* Sound toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoSound(index);
                    }}
                    className="absolute bottom-4 right-4 z-40 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white focus:outline-none transition-all duration-200 backdrop-blur-sm border border-white/20"
                    aria-label={
                      mutedStates[index] ? "Unmute video" : "Mute video"
                    }
                  >
                    {mutedStates[index] ? (
                      <VolumeX size={18} />
                    ) : (
                      <Volume2 size={18} />
                    )}
                  </button>
                  {/* Playing indicator */}
                  {isActiveVideo && (
                    <div className="absolute top-4 left-4 z-40 flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">LIVE</span>
                    </div>
                  )}
                </div>
              ) : (
                <Image
                  src={event.featuredImage || "/placeholder.webp"}
                  alt={event.title}
                  width={isMobile ? 350 : 500}
                  height={isMobile ? 467 : 600}
                  className="event-media image"
                  onClick={() => handleImageClick(event.slug)}
                  style={{ cursor: "pointer" }}
                  quality={85}
                  priority={index < 2}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              )}
              <motion.h2
                style={{
                  y: transforms[index],
                }}
                className="event-number"
              >
                {getDisplayNumber(event, index)}
              </motion.h2>
            </div>
          </section>
        );
      })}

      <motion.div className="progress" style={{ width: progressWidth }} />

      <style jsx>{`
        :global(html) {
          scroll-snap-type: y mandatory;
        }

        .parallax-container {
          min-height: 500vh;
        }

        .img-container {
          height: 100vh;
          scroll-snap-align: start;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .media-wrapper {
          width: ${isMobile ? "350px" : "500px"};
          height: ${isMobile ? "467px" : "600px"};
          margin: 20px;
          background: #f5f5f5;
          overflow: hidden;
          position: relative;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .event-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .event-media.image {
          border-radius: 8px;
        }

        .event-media:hover {
          transform: scale(1.02);
        }

        .event-number {
          color: #87CEEB;
          margin: 0;
          font-family: "Azeret Mono", monospace;
          font-size: ${isMobile ? "80px" : "120px"};
          font-weight: 700;
          letter-spacing: -3px;
          line-height: 1.2;
          position: absolute;
          display: inline-block;
          top: calc(50% - ${isMobile ? "40px" : "60px"});
          left: calc(50% + ${isMobile ? "200px" : "300px"});
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
          z-index: 20;
          pointer-events: none;
        }

        .progress {
          position: fixed;
          left: 0;
          bottom: 50px;
          height: 5px;
          background: var(--accent, #ff6b6b);
          z-index: 1000;
          transform-origin: left;
        }

        @media (max-width: 768px) {
          .parallax-container {
            min-height: 400vh;
          }

          .event-number {
            font-size: 70px;
            top: calc(50% - 35px);
            left: calc(50% + 150px);
          }
        }
      `}</style>
    </div>
  );
}
