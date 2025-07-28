"use client";

import { useRef, useState, useEffect } from "react";
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
  const [mutedStates, setMutedStates] = useState<boolean[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Limit to 5 events max for parallax display and ensure we always have an array
  // Sort by number descending to show highest numbers first (latest events first)
  const displayEvents = events?.slice(0, 5) || [];

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

        return (
          <section key={event._id} className="img-container">
            <div className="media-wrapper">
              {hasVideo ? (
                <div className="relative">
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={event.promoVideoUrl}
                    autoPlay
                    loop
                    muted={mutedStates[index]}
                    playsInline
                    className="event-media video"
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
                    className="absolute bottom-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 rounded-sm text-white focus:outline-none transition-colors duration-200"
                    aria-label={
                      mutedStates[index] ? "Unmute video" : "Mute video"
                    }
                  >
                    {mutedStates[index] ? (
                      <VolumeX size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>
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
          border-radius: 4px;
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
          border-radius: 4px;
        }

        .event-media.video {
          border-radius: 4px;
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
