"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Volume2, VolumeX, ImageIcon, Play } from "lucide-react";
import { type EventParallaxData } from "@/lib/sanity/queries";
import { useMedia } from "@/lib/contexts/MediaContext";

interface ParallaxGalleryProps {
  events: EventParallaxData[];
}

export default function ParallaxGallery({ events }: ParallaxGalleryProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [mutedStates, setMutedStates] = useState<boolean[]>([]);
  const [showVideo, setShowVideo] = useState<boolean[]>([]);

  const {
    activeVideoIndex,
    setActiveVideo,
    setVideoPlaying,
    saveVideoState,
    getVideoState,
  } = useMedia();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Memoize displayEvents to prevent unnecessary re-renders
  const displayEvents = useMemo(() => {
    return events?.slice(0, 5) || [];
  }, [events]);

  // Initialize states
  useEffect(() => {
    const initialMutedStates = new Array(displayEvents.length).fill(false);
    const initialShowVideo = displayEvents.map(
      (event) => !!event.promoVideoUrl,
    );

    setMutedStates(initialMutedStates);
    setShowVideo(initialShowVideo);
  }, [displayEvents]);

  // Load saved video states and auto-play first video
  useEffect(() => {
    const timer = setTimeout(() => {
      displayEvents.forEach((event, index) => {
        if (event.promoVideoUrl && videoRefs.current[index]) {
          const savedState = getVideoState(event.slug);
          const video = videoRefs.current[index]!;

          if (savedState) {
            video.currentTime = savedState.currentTime;
            video.muted = savedState.muted;
            setMutedStates((prev) => {
              const newStates = [...prev];
              newStates[index] = savedState.muted;
              return newStates;
            });
          } else {
            video.muted = false;
          }
        }
      });

      // Try to auto-play first video (will fail gracefully if no user interaction)
      if (
        displayEvents.length > 0 &&
        videoRefs.current[0] &&
        displayEvents[0]?.promoVideoUrl
      ) {
        const firstVideo = videoRefs.current[0];
        setActiveVideo(0);
        setVideoPlaying(true);
        firstVideo.currentTime =
          getVideoState(displayEvents[0].slug)?.currentTime || 0;
        firstVideo.play().catch((error) => {
          console.log(
            "🎥 Video autoplay prevented:",
            error.message || "Autoplay blocked",
          );
          // Fallback: mute the video and try again
          firstVideo.muted = true;
          setMutedStates((prev) => {
            const newStates = [...prev];
            newStates[0] = true;
            return newStates;
          });
          firstVideo.play().catch(() => {
            console.log(
              "🎥 Video autoplay failed even when muted - user interaction required",
            );
            setVideoPlaying(false);
          });
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [displayEvents, getVideoState, setActiveVideo, setVideoPlaying]);

  // Scroll-based video management
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const viewportCenter = window.innerHeight / 2;
      let closestIndex = -1;
      let closestDistance = Infinity;

      sectionRefs.current.forEach((section, index) => {
        if (!section) return;

        const sectionRect = section.getBoundingClientRect();
        const sectionCenter = sectionRect.top + sectionRect.height / 2;
        const distance = Math.abs(viewportCenter - sectionCenter);
        const isVisible =
          sectionRect.top < window.innerHeight && sectionRect.bottom > 0;

        if (isVisible && distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeVideoIndex) {
        // Save state of previous video
        if (
          activeVideoIndex !== null &&
          videoRefs.current[activeVideoIndex] &&
          displayEvents[activeVideoIndex]?.promoVideoUrl
        ) {
          const prevVideo = videoRefs.current[activeVideoIndex];
          const prevEvent = displayEvents[activeVideoIndex];
          saveVideoState(
            prevEvent.slug,
            prevVideo.currentTime,
            prevVideo.muted,
            !prevVideo.paused,
          );
        }

        // Pause all videos
        videoRefs.current.forEach((video) => {
          if (video) {
            video.pause();
          }
        });

        setActiveVideo(closestIndex);

        // Play new active video if it exists
        if (
          closestIndex >= 0 &&
          videoRefs.current[closestIndex] &&
          displayEvents[closestIndex]?.promoVideoUrl &&
          showVideo[closestIndex]
        ) {
          const activeVideo = videoRefs.current[closestIndex];
          if (activeVideo) {
            const savedState = getVideoState(displayEvents[closestIndex].slug);

            if (savedState && savedState.wasPlaying) {
              activeVideo.currentTime = savedState.currentTime;
              activeVideo.muted = savedState.muted;
            }

            activeVideo.play().catch(() => {
              console.log("Video autoplay prevented");
            });
            setVideoPlaying(true);
          }
        } else {
          setVideoPlaying(false);
        }
      }
    };

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

    window.addEventListener("scroll", throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [
    activeVideoIndex,
    displayEvents,
    showVideo,
    setActiveVideo,
    setVideoPlaying,
    saveVideoState,
    getVideoState,
  ]);

  // Create individual transform hooks for each potential event slot (up to 5)
  const transform1 = useTransform(scrollYProgress, [0, 0.2], [-400, 400]);
  const transform2 = useTransform(scrollYProgress, [0.2, 0.4], [-400, 400]);
  const transform3 = useTransform(scrollYProgress, [0.4, 0.6], [-400, 400]);
  const transform4 = useTransform(scrollYProgress, [0.6, 0.8], [-400, 400]);
  const transform5 = useTransform(scrollYProgress, [0.8, 1], [-400, 400]);

  const transforms = [
    transform1,
    transform2,
    transform3,
    transform4,
    transform5,
  ];

  const handleImageClick = (slug: string, index: number) => {
    // Defer saving video state until after render cycle
    setTimeout(() => {
      if (videoRefs.current[index] && displayEvents[index]?.promoVideoUrl) {
        const video = videoRefs.current[index]!;
        saveVideoState(slug, video.currentTime, video.muted, !video.paused);
      }
    }, 0);

    router.push(`/events/${slug}`);
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

  const toggleMediaType = (index: number) => {
    if (
      !displayEvents[index]?.promoVideoUrl ||
      !displayEvents[index]?.featuredImage
    )
      return;

    // Decide what the next state will be and update the state
    const nextShowVideo = !showVideo[index];
    setShowVideo((prev) => {
      const newStates = [...prev];
      newStates[index] = nextShowVideo;
      return newStates;
    });

    // Perform side-effects based on the new state
    if (nextShowVideo) {
      // Logic for switching to video
      videoRefs.current.forEach((video, i) => {
        if (video && i !== index) video.pause();
      });

      const video = videoRefs.current[index];
      if (video) {
        setActiveVideo(index);
        setVideoPlaying(true);
        const savedState = getVideoState(displayEvents[index].slug);
        if (savedState) {
          video.currentTime = savedState.currentTime;
          video.muted = savedState.muted;
        }
        video.play().catch(() => {
          console.log("Video play prevented");
        });
      }
    } else {
      // Logic for switching to image
      const video = videoRefs.current[index];
      if (video) {
        saveVideoState(
          displayEvents[index].slug,
          video.currentTime,
          video.muted,
          !video.paused,
        );
        video.pause();
      }
      if (activeVideoIndex === index) {
        setActiveVideo(null);
        setVideoPlaying(false);
      }
    }
  };

  const getDisplayNumber = (event: EventParallaxData, index: number) => {
    if (event.number) {
      return `#${event.number.padStart(3, "0")}`;
    }
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
    <>
      <div
        ref={containerRef}
        className="relative z-10 min-h-[500vh] md:min-h-[400vh]"
      >
        {displayEvents.map((event, index) => {
          const hasVideo = !!event.promoVideoUrl;
          const hasImage = !!event.featuredImage;
          const hasBoth = hasVideo && hasImage;
          const currentShowVideo = showVideo[index];

          return (
            <section
              key={event._id}
              className="h-screen snap-start flex justify-center items-center relative"
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
            >
              <div className="w-[400px] h-[533px] md:w-[500px] md:h-[667px] lg:w-[600px] lg:h-[800px] m-5 mt-16 bg-black overflow-hidden relative rounded-lg shadow-2xl">
                {hasVideo && currentShowVideo ? (
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
                      onClick={() => handleImageClick(event.slug, index)}
                      onLoadedMetadata={() => {
                        if (videoRefs.current[index]) {
                          const savedState = getVideoState(event.slug);
                          if (savedState) {
                            videoRefs.current[index]!.currentTime =
                              savedState.currentTime;
                            videoRefs.current[index]!.muted = savedState.muted;
                          } else {
                            videoRefs.current[index]!.muted =
                              mutedStates[index];
                          }
                        }
                      }}
                    />

                    {/* Controls overlay */}
                    <div className="absolute bottom-4 right-4 z-40 flex items-center space-x-2">
                      {/* Sound toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoSound(index);
                        }}
                        className="p-2 bg-black/10 hover:bg-black/30 rounded-sm text-white focus:outline-none transition-colors duration-200"
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

                      {/* Media type toggle */}
                      {hasBoth && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMediaType(index);
                          }}
                          className="p-2 bg-black/10 hover:bg-black/30 rounded-sm text-white focus:outline-none transition-colors duration-200"
                          aria-label="Switch to image"
                        >
                          <ImageIcon size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full overflow-hidden rounded">
                    <Image
                      src={event.featuredImage || "/placeholder.webp"}
                      alt={event.title}
                      fill
                      className="absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onClick={() => handleImageClick(event.slug, index)}
                      quality={85}
                      priority={index < 2}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />

                    {/* Media type toggle for images with video */}
                    {hasBoth && (
                      <div className="absolute bottom-4 right-4 z-40">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMediaType(index);
                          }}
                          className="p-2 bg-black/10 hover:bg-black/30 rounded-sm text-white focus:outline-none transition-colors duration-200"
                          aria-label="Switch to video"
                        >
                          <Play size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <motion.h2
                  className="fixed top-4/4 right-4 md:right-96 transform -translate-y-1/2 text-white font-black pointer-events-none z-30"
                  style={{
                    y: transforms[index],
                    fontSize: "clamp(2rem, 10vw, 3.75rem)",
                    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                    letterSpacing: "-4px",
                    lineHeight: "0.8",
                    color: "#ff6b6b",
                    textShadow: `
                      0 0 10px rgba(255, 107, 107, 0.6),
                      0 0 20px rgba(255, 107, 107, 0.4),
                      2px 2px 10px rgba(0, 0, 0, 0.7)
                    `,
                    filter: "drop-shadow(0 0 5px rgba(255, 107, 107, 0.5))",
                  }}
                >
                  {getDisplayNumber(event, index)}
                </motion.h2>
              </div>
            </section>
          );
        })}

        <motion.div
          className="fixed left-0 bottom-12 h-1 bg-red-500 z-[1000] origin-left"
          style={{ width: progressWidth }}
        />
      </div>

      <style jsx global>{`
        html {
          scroll-snap-type: y mandatory;
        }
      `}</style>
    </>
  );
}
