"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX, ImageIcon, Play } from "lucide-react";
import { useMusic } from "@/lib/contexts/MusicContext";
import { useMedia } from "@/lib/contexts/MediaContext";

interface EventMediaDisplayProps {
  flyerUrl?: string;
  promoVideoUrl?: string;
  eventTitle: string;
  eventSlug: string; // Add slug to identify the event
}

export function EventMediaDisplay({
  flyerUrl,
  promoVideoUrl,
  eventTitle,
  eventSlug,
}: EventMediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    pause: pauseMusic,
    play: playMusic,
    isPlaying: isMusicPlaying,
  } = useMusic();
  const { saveVideoState, getVideoState, setVideoPlaying } = useMedia();

  // Determine if both media types are available
  const hasBoth = flyerUrl && promoVideoUrl;

  // State to manage which media to show
  const [showVideo, setShowVideo] = useState(!!promoVideoUrl);
  const [isMuted, setIsMuted] = useState(true);

  // Load saved video state on mount
  useEffect(() => {
    if (promoVideoUrl && videoRef.current) {
      const savedState = getVideoState(eventSlug);
      if (savedState) {
        videoRef.current.currentTime = savedState.currentTime;
        videoRef.current.muted = savedState.muted;
        setIsMuted(savedState.muted);
      }
    }
  }, [promoVideoUrl, eventSlug, getVideoState]);

  // Pause music if video is playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (isMusicPlaying) {
        pauseMusic();
      }
      setVideoPlaying(true);
    };

    const handlePause = () => {
      setVideoPlaying(false);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [isMusicPlaying, pauseMusic, setVideoPlaying]);

  // Save video state on unmount
  useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      if (videoElement && promoVideoUrl) {
        saveVideoState(
          eventSlug,
          videoElement.currentTime,
          videoElement.muted,
          !videoElement.paused,
        );
      }
    };
  }, [promoVideoUrl, eventSlug, saveVideoState]);

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const toggleMediaType = () => {
    if (hasBoth) {
      const newShowVideo = !showVideo;
      setShowVideo(newShowVideo);

      if (newShowVideo) {
        // Switching to video - pause music if it's playing
        if (isMusicPlaying) {
          pauseMusic();
        }
      } else {
        // Switching to image - resume music if it was playing before
        const wasMusicPlaying = localStorage.getItem("music-was-playing");
        if (wasMusicPlaying === "true") {
          playMusic();
        }
      }
    }
  };

  const currentMedia = showVideo ? "video" : "image";

  if (currentMedia === "video" && promoVideoUrl) {
    return (
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          src={promoVideoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Controls Overlay */}
        <div className="absolute bottom-4 right-4 z-40 flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 bg-black/20 hover:bg-black/40 rounded-sm text-white focus:outline-none transition-colors duration-200 backdrop-blur-sm"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {hasBoth && (
            <button
              onClick={toggleMediaType}
              className="p-2 bg-black/20 hover:bg-black/40 rounded-sm text-white focus:outline-none transition-colors duration-200 backdrop-blur-sm"
              aria-label="Switch to image"
            >
              <ImageIcon size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Fallback to image if video isn't available or if toggled
  if (flyerUrl) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={flyerUrl}
          alt={eventTitle}
          priority
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
        {hasBoth && (
          <div className="absolute bottom-4 right-4 z-40">
            <button
              onClick={toggleMediaType}
              className="p-2 bg-black/20 hover:bg-black/40 rounded-sm text-white focus:outline-none transition-colors duration-200 backdrop-blur-sm"
              aria-label="Switch to video"
            >
              <Play size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <ImageIcon className="w-16 h-16 text-muted-foreground" />
    </div>
  );
}
