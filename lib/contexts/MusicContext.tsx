"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { MusicTrack } from "@/lib/sanity/queries";

interface MusicContextType {
  // Track data
  tracks: MusicTrack[];
  currentTrackIndex: number;
  currentTrack: MusicTrack | null;

  // Player state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Audio settings
  audioPlayerEnabled: boolean;

  // Controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setTrack: (index: number, autoPlay?: boolean) => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Audio ref for sharing between components
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
  tracks: MusicTrack[];
  audioPlayerEnabled?: boolean;
  autoPlayMusic?: boolean;
}

export function MusicProvider({
  children,
  tracks,
  audioPlayerEnabled = true,
  autoPlayMusic = false,
}: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Refs to avoid stale closures in callbacks and effects
  const isPlayingRef = useRef(isPlaying);
  const isStoppedRef = useRef(true); // Start as stopped until first play

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const currentTrack = tracks[currentTrackIndex] || null;

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  const handleLoadStart = () => {
    setCurrentTime(0);
    setDuration(0);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  // Handle background playback - continue playing when app loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      // This logic remains the same
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Detect user interaction for autoplay compliance
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };

    if (!hasUserInteracted) {
      document.addEventListener("click", handleUserInteraction);
      document.addEventListener("touchstart", handleUserInteraction);
      document.addEventListener("keydown", handleUserInteraction);
    }

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [hasUserInteracted]);

  // Enhanced play function
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        isStoppedRef.current = false; // User wants to play
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log("🎵 Autoplay prevented:", errorMessage);
        setIsPlaying(false);
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      console.log("🎵 Stopping audio permanently");
      isStoppedRef.current = true; // User explicitly stopped
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const togglePlay = useCallback(() => {
    console.log("🎵 Toggle play called - current state:", {
      isPlaying: isPlayingRef.current,
      isAudioPaused: audioRef.current?.paused,
    });
    if (audioRef.current?.paused) {
      play();
    } else {
      pause();
    }
  }, [pause, play]);

  const nextTrack = useCallback(() => {
    if (tracks.length > 0) {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    if (tracks.length > 0) {
      setCurrentTrackIndex(
        (prev) => (prev - 1 + tracks.length) % tracks.length,
      );
    }
  }, [tracks.length]);

  const setTrack = useCallback(
    (index: number, autoPlay: boolean = true) => {
      if (index >= 0 && index < tracks.length) {
        if (!autoPlay) {
          isStoppedRef.current = true;
        } else {
          isStoppedRef.current = false;
        }
        setCurrentTrackIndex(index);
      }
    },
    [tracks.length],
  );

  const seekTo = (time: number) => {
    if (audioRef.current && isFinite(time) && time >= 0) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setIsMuted(clampedVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.volume = newMuted ? 0 : volume;
      setIsMuted(newMuted);
    }
  };

  // Effect to handle track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const isNewSrc = audioRef.current.src !== currentTrack.audioUrl;

    if (isNewSrc) {
      const wasPlaying = isPlayingRef.current;
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();

      const shouldPlay =
        (wasPlaying || currentTrackIndex === 0) && !isStoppedRef.current;

      console.log("🎵 Track change:", {
        wasPlaying,
        isStopped: isStoppedRef.current,
        shouldPlay,
      });

      if (shouldPlay) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("🎵 Auto-play on track change failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentTrack, currentTrackIndex]);

  // Initialize audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Auto-play music on page load if enabled
  useEffect(() => {
    if (autoPlayMusic && tracks.length > 0 && hasUserInteracted && !isPlaying) {
      console.log("🎵 Auto-playing music on page load");
      // Small delay to ensure audio element is ready
      const timer = setTimeout(() => {
        play();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoPlayMusic, tracks.length, hasUserInteracted, isPlaying, play]);

  const value: MusicContextType = {
    tracks,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    audioPlayerEnabled,
    play,
    pause,
    stop,
    togglePlay,
    nextTrack,
    prevTrack,
    setTrack,
    seekTo,
    setVolume,
    toggleMute,
    audioRef,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadStart={handleLoadStart}
        onPlay={handlePlay}
        onPause={handlePause}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
        preload="metadata"
        playsInline
      />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
