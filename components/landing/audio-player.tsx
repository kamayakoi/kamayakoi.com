"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
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
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-white/20 rounded-full cursor-pointer",
        className,
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <motion.div
        className="absolute top-0 left-0 h-full bg-white rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </motion.div>
  );
};

interface AudioPlayerProps {
  className?: string;
}

const AudioPlayer = ({ className }: AudioPlayerProps) => {
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
  } = useMusic();

  console.log("🎵 AudioPlayer - tracks:", tracks);
  console.log("🎵 AudioPlayer - currentTrack:", currentTrack);
  console.log("🎵 AudioPlayer - tracks length:", tracks?.length);

  const handleSeek = (value: number) => {
    if (duration) {
      const time = (value / 100) * duration;
      if (isFinite(time)) {
        seekTo(time);
      }
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!tracks || tracks.length === 0 || !currentTrack) {
    console.log("🎵 AudioPlayer - Not rendering because:", {
      hasNoTracks: !tracks,
      tracksLength: tracks?.length,
      hasNoCurrentTrack: !currentTrack
    });
    return null;
  }

  console.log("🎵 AudioPlayer - Rendering with track:", currentTrack.title);

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "relative flex flex-col mx-auto rounded-sm overflow-hidden bg-[#11111198] shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm p-3 w-[280px] h-auto",
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
        <motion.div
          className="flex flex-col relative"
          layout
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Cover Image */}
          {currentTrack.coverImageUrl && (
            <motion.div className="bg-white/20 overflow-hidden rounded-sm h-[180px] w-full relative">
              <Image
                src={currentTrack.coverImageUrl}
                alt={currentTrack.title}
                width={180}
                height={180}
                className="!object-cover w-full my-0 p-0 !mt-0 border-none !h-full"
              />
            </motion.div>
          )}

          <motion.div className="flex flex-col w-full gap-y-2">
            {/* Title and Artist */}
            <motion.div className="text-center mt-1">
              <h3 className="text-white font-bold text-base">
                {currentTrack.title}
              </h3>
              {currentTrack.artist && (
                <p className="text-white/70 text-sm">{currentTrack.artist}</p>
              )}
            </motion.div>

            {/* Progress Slider */}
            <motion.div className="flex flex-col gap-y-1">
              <CustomSlider
                value={progress}
                onChange={handleSeek}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">
                  {formatTime(currentTime)}
                </span>
                <span className="text-white text-sm">
                  {formatTime(duration)}
                </span>
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div className="flex items-center justify-center w-full">
              <div className="flex items-center gap-2 w-fit bg-[#11111198] rounded-sm p-2">
                {tracks.length > 1 && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevTrack}
                      className="text-white hover:bg-[#111111d1] hover:text-white h-8 w-8 rounded-full"
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    onClick={togglePlay}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-[#111111d1] hover:text-white h-8 w-8 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
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
                      className="text-white hover:bg-[#111111d1] hover:text-white h-8 w-8 rounded-full"
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioPlayer;
