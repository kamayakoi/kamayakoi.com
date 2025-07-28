"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/actions/utils";
import Image from "next/image";
import { useMusic } from "@/lib/contexts/MusicContext";

const formatTime = (seconds: number = 0) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    onChange(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <div
      className={cn(
        "relative w-full h-1 bg-white/20 rounded-full cursor-pointer",
        className,
      )}
      onClick={handleClick}
    >
      <motion.div
        className="absolute top-0 left-0 h-full bg-white rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

interface AudioPlayerProps {
  className?: string;
}

// Internal component that uses the music context
const AudioPlayerInternal = ({ className }: AudioPlayerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // Always start collapsed
  const [isClient, setIsClient] = useState(false);

  // Must call hooks unconditionally at top level
  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    stop
  } = useMusic();

  // Only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render during SSR
  if (!isClient) {
    return <div className="hidden" />;
  }

  console.log("🎵 AudioPlayer - tracks:", tracks);
  console.log("🎵 AudioPlayer - currentTrack:", currentTrack);
  console.log("🎵 AudioPlayer - tracks length:", tracks?.length);

  const handleSeek = (value: number) => {
    if (duration && duration > 0) {
      const time = (value / 100) * duration;
      if (isFinite(time) && time >= 0) {
        seekTo(time);
      }
    }
  };

  const handleClose = () => {
    console.log("🎵 AudioPlayer - Stop button clicked");
    stop(); // Use stop to permanently stop the music
    setIsVisible(false);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🎵 Audio player toggle button clicked - current state:", isPlaying);
    togglePlay();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!tracks || tracks.length === 0 || !currentTrack || !isVisible) {
    console.log("🎵 AudioPlayer - Not rendering because:", {
      hasNoTracks: !tracks,
      tracksLength: tracks?.length,
      hasNoCurrentTrack: !currentTrack,
      isVisible
    });
    return null;
  }

  console.log("🎵 AudioPlayer - Rendering with track:", currentTrack.title);

  // Compact version for events page or when collapsed
  if (!isExpanded) {
    return (
      <motion.div
        className={cn(
          "relative bg-[#1a1a1a] shadow-2xl border border-gray-800 rounded-sm w-[60px] h-[60px] overflow-visible",
          className,
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={handleExpand}
      >
        {/* Album art only */}
        <div className="w-full h-full relative cursor-pointer group">
          {currentTrack.coverImageUrl ? (
            <Image
              src={currentTrack.coverImageUrl}
              alt={currentTrack.title}
              width={60}
              height={60}
              className="w-full h-full object-cover rounded-sm"
            />
          ) : (
            <div className="w-full h-full bg-white/20 rounded-sm flex items-center justify-center">
              <Play className="h-6 w-6 text-white/70" />
            </div>
          )}

          {/* Expand indicator */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
            <ChevronRight className="h-4 w-4 text-white" />
          </div>

          {/* Playing indicator */}
          {isPlaying && (
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "relative bg-[#1a1a1a] shadow-2xl border border-gray-800 rounded-sm overflow-visible w-[380px] h-[70px]",
          className,
        )}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          delay: 0.1,
          type: "spring",
        }}
        layout
      >
        {/* Control buttons - completely outside with proper spacing */}
        <div className="absolute -top-3 -right-3 z-20 flex space-x-1">
          <button
            onClick={handleClose}
            className="bg-[#2a2a2a] rounded-sm w-4 h-4 flex items-center justify-center shadow-md hover:bg-[#3a3a3a] transition-colors border border-gray-700"
            aria-label="Close and stop music"
          >
            <X className="h-2.5 w-2.5 text-gray-300" />
          </button>
          {/* Collapse button */}
          <button
            onClick={handleExpand}
            className="bg-[#2a2a2a] rounded-sm w-4 h-4 flex items-center justify-center shadow-md hover:bg-[#3a3a3a] transition-colors border border-gray-700"
            aria-label="Collapse"
          >
            <ChevronRight className="h-2.5 w-2.5 text-gray-300 rotate-180" />
          </button>
        </div>

        <motion.div
          className="flex items-center w-full p-3"
          layout
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Cover Image */}
          {currentTrack.coverImageUrl && (
            <motion.div className="bg-white/20 overflow-hidden rounded-sm h-[45px] w-[45px] flex-shrink-0 mr-3">
              <Image
                src={currentTrack.coverImageUrl}
                alt={currentTrack.title}
                width={45}
                height={45}
                className="!object-cover w-full h-full"
              />
            </motion.div>
          )}

          {/* Content Area */}
          <motion.div className="flex flex-col flex-grow min-w-0">
            {/* Title and Artist - inline */}
            <motion.div className="mb-1">
              <h3 className="text-white font-bold text-sm truncate">
                {currentTrack.title}
                {currentTrack.artist && (
                  <span className="text-white/70 font-normal"> • {currentTrack.artist}</span>
                )}
              </h3>
            </motion.div>

            {/* Progress Slider */}
            <motion.div className="flex flex-col gap-y-1 mb-1">
              <CustomSlider
                value={progress}
                onChange={handleSeek}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <span className="text-white text-xs">
                  {formatTime(currentTime)}
                </span>
                <span className="text-white text-xs">
                  {formatTime(duration)}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Controls */}
          <motion.div className="flex items-center ml-3">
            <div className="flex items-center gap-1 bg-[#11111198] rounded-sm p-1">
              {tracks.length > 1 && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevTrack}
                    className="text-white hover:bg-[#111111d1] hover:text-white h-6 w-6 rounded-sm"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={handleTogglePlay}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-[#111111d1] hover:text-white h-6 w-6 rounded-sm"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>

              {tracks.length > 1 && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextTrack}
                    className="text-white hover:bg-[#111111d1] hover:text-white h-6 w-6 rounded-sm"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Wrapper component with error boundary
const AudioPlayer = ({ className }: AudioPlayerProps) => {
  try {
    return <AudioPlayerInternal className={className} />;
  } catch (error) {
    console.log("🎵 AudioPlayer - Error caught:", error);
    return <div className="hidden" />;
  }
};

export default AudioPlayer;
