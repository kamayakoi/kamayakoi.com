"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/actions/utils";
import Image from "next/image";
import { useMusic } from "@/lib/contexts/MusicContext";

interface MiniAudioPlayerProps {
  className?: string;
  showStopButton?: boolean;
}

const MiniAudioPlayer = ({ className, showStopButton = false }: MiniAudioPlayerProps) => {
  const { tracks, currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, stop } =
    useMusic();

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🎵 Mini audio player button clicked - current state:", isPlaying);
    togglePlay();
  };

  const handleStop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🎵 Mini audio player stop clicked");
    stop();
  };

  if (!tracks || tracks.length === 0 || !currentTrack) return null;

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-sm px-2 py-1",
        className,
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cover Image */}
      {currentTrack.coverImageUrl && (
        <div className="w-8 h-8 rounded-sm overflow-hidden bg-white/20 flex-shrink-0">
          <Image
            src={currentTrack.coverImageUrl}
            alt={currentTrack.title}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1">
        {tracks.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={prevTrack}
            className="text-white hover:bg-white/20 h-6 w-6 rounded-sm p-0"
          >
            <SkipBack className="h-3 w-3" />
          </Button>
        )}

        <Button
          onClick={handleTogglePlay}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 h-6 w-6 rounded-sm p-0"
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>

        {tracks.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={nextTrack}
            className="text-white hover:bg-white/20 h-6 w-6 rounded-sm p-0"
          >
            <SkipForward className="h-3 w-3" />
          </Button>
        )}

        {/* Stop button - only show if requested */}
        {showStopButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            className="text-white hover:bg-white/20 h-6 w-6 rounded-sm p-0"
            aria-label="Stop music"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Track Info (optional, show on slightly larger screens) */}
      <div className="hidden sm:flex flex-col text-xs text-white min-w-0 max-w-[120px]">
        <div className="truncate font-medium leading-tight">
          {currentTrack.title}
        </div>
        {currentTrack.artist && (
          <div className="truncate text-white/70 leading-tight">
            {currentTrack.artist}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MiniAudioPlayer;
