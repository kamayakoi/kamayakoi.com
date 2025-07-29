"use client";

import React, { useRef } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/actions/utils";
import Image from "next/image";
import { useMusic } from "@/lib/contexts/MusicContext";

interface MiniAudioPlayerProps {
  className?: string;
}

const MiniAudioPlayer = ({ className }: MiniAudioPlayerProps) => {
  const { tracks, currentTrack, isPlaying, togglePlay, nextTrack } = useMusic();

  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🎵 Mini audio player clicked"); // Debug log

    // If only one track or no track, double click does nothing special
    if (tracks.length <= 1) {
      console.log("🎵 Single track - toggling play");
      togglePlay();
      return;
    }

    if (clickTimeout.current) {
      // This is a double click
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      console.log("🎵 Mini audio player double click: next track");
      nextTrack();
    } else {
      // This is a single click
      clickTimeout.current = setTimeout(() => {
        console.log("🎵 Mini audio player single click: toggle play");
        togglePlay();
        clickTimeout.current = null;
      }, 250); // 250ms wait for a potential double click
    }
  };

  if (!tracks || tracks.length === 0 || !currentTrack) {
    console.log("🎵 Mini audio player: No tracks available");
    return null;
  }

  return (
    <motion.div
      className={cn(
        "relative bg-[#1a1a1a] shadow-2xl border border-gray-800 rounded-sm w-[60px] h-[60px] overflow-visible cursor-pointer select-none",
        className,
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      style={{ pointerEvents: "auto" }} // Ensure pointer events are enabled
    >
      <div className="w-full h-full relative group">
        {currentTrack.coverImageUrl ? (
          <Image
            src={currentTrack.coverImageUrl}
            alt={currentTrack.title}
            width={60}
            height={60}
            className="w-full h-full object-cover rounded-sm"
            draggable={false} // Prevent drag interference
          />
        ) : (
          <div className="w-full h-full bg-white/20 rounded-sm flex items-center justify-center">
            <Play className="h-6 w-6 text-white/70" />
          </div>
        )}

        {/* Play/Pause indicator on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
          {isPlaying ? (
            <Pause className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </motion.div>
  );
};

export default MiniAudioPlayer;
