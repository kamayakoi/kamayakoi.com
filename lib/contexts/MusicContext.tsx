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

  // Controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setTrack: (index: number) => void;
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
}

export function MusicProvider({ children, tracks }: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

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
      // Don't pause when page becomes hidden - allow background playback
      if (document.hidden) {
        console.log("🎵 Page hidden - continuing background playback");
      } else {
        console.log("🎵 Page visible - resuming normal playback");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Detect user interaction for autoplay compliance
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    if (!hasUserInteracted) {
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [hasUserInteracted]);

  // Enhanced play function with autoplay handling
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log("🎵 Autoplay prevented:", errorMessage);
        setIsPlaying(false);

        // If user hasn't interacted yet, wait for interaction
        if (!hasUserInteracted) {
          console.log("🎵 Waiting for user interaction to play music");
        }
      }
    }
  }, [hasUserInteracted]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      console.log("🎵 Pausing audio - current state:", {
        paused: audioRef.current.paused,
        currentTime: audioRef.current.currentTime,
        isPlaying
      });

      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      console.log("🎵 Stopping audio permanently");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);

      // Force state update to ensure UI reflects stopped state
      setTimeout(() => {
        setIsPlaying(false);
      }, 0);
    }
  }, []);

  const togglePlay = useCallback(() => {
    console.log("🎵 Toggle play called - current state:", {
      isPlaying,
      audioPaused: audioRef.current?.paused,
      hasUserInteracted
    });

    // Use the actual audio element state for more reliable toggling
    if (audioRef.current) {
      if (audioRef.current.paused || audioRef.current.ended) {
        play();
      } else {
        pause();
      }
    } else if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play, hasUserInteracted]);

  const nextTrack = () => {
    if (tracks.length > 0) {
      setCurrentTrackIndex((prev) =>
        prev === tracks.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevTrack = () => {
    if (tracks.length > 0) {
      setCurrentTrackIndex((prev) =>
        prev === 0 ? tracks.length - 1 : prev - 1,
      );
    }
  };

  const setTrack = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrackIndex(index);
    }
  };

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
    if (clampedVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Track change logic - preserve state during navigation
  useEffect(() => {
    // Only reset if we're actually changing to a different track
    // This prevents resetting when navigating between pages
    if (audioRef.current && audioRef.current.src !== currentTrack?.audioUrl) {
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Load the new track
      audioRef.current.load();

      // Auto-play if we were already playing or if it's the first track
      setIsPlaying(prevIsPlaying => {
        const shouldPlay = prevIsPlaying || currentTrackIndex === 0;

        if (shouldPlay) {
          const playNewTrack = () => {
            if (audioRef.current) {
              audioRef.current.play().then(() => {
                setIsPlaying(true);
              }).catch(err => {
                console.error("Auto-play prevented:", err);
                setIsPlaying(false);
              });
            }
          };

          // Small delay to ensure the track is loaded
          setTimeout(playNewTrack, 100);
          return true;
        } else {
          return false;
        }
      });
    } else {
      // Same track - preserve playing state during navigation
      if (audioRef.current && audioRef.current.paused) {
        setIsPlaying(prevIsPlaying => {
          if (prevIsPlaying) {
            audioRef.current!.play().catch(err => {
              console.error("Resume play prevented:", err);
            });
          }
          return prevIsPlaying;
        });
      }
    }
  }, [currentTrackIndex, currentTrack?.audioUrl]); // Removed isPlaying from dependencies

  // Initialize audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const value: MusicContextType = {
    tracks,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
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
      {/* Global audio element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
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
      )}
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

