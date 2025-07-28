"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useMusic } from "./MusicContext";

interface MediaContextType {
    activeVideoIndex: number | null;
    setActiveVideo: (index: number | null) => void;
    isVideoPlaying: boolean;
    setVideoPlaying: (playing: boolean) => void;
    videoStates: Record<string, { currentTime: number; muted: boolean; wasPlaying: boolean }>;
    saveVideoState: (slug: string, currentTime: number, muted: boolean, wasPlaying: boolean) => void;
    getVideoState: (slug: string) => { currentTime: number; muted: boolean; wasPlaying: boolean } | null;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

interface MediaProviderProps {
    children: ReactNode;
}

export function MediaProvider({ children }: MediaProviderProps) {
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [videoStates, setVideoStates] = useState<Record<string, { currentTime: number; muted: boolean; wasPlaying: boolean }>>({});

    const { pause: pauseMusic, play: playMusic } = useMusic();

    // Coordinate video and audio playback
    useEffect(() => {
        if (isVideoPlaying && activeVideoIndex !== null) {
            // Pause music when video is playing
            pauseMusic();
        } else if (!isVideoPlaying && activeVideoIndex === null) {
            // Resume music when no video is playing
            const timer = setTimeout(async () => {
                try {
                    await playMusic();
                } catch (err: unknown) {
                    console.log("Music resume prevented:", err);
                }
            }, 500); // Small delay to avoid conflicts

            return () => clearTimeout(timer);
        }
    }, [isVideoPlaying, activeVideoIndex, pauseMusic, playMusic]);

    const setActiveVideo = (index: number | null) => {
        setActiveVideoIndex(index);
    };

    const setVideoPlaying = (playing: boolean) => {
        setIsVideoPlaying(playing);
    };

    const saveVideoState = (slug: string, currentTime: number, muted: boolean, wasPlaying: boolean) => {
        setVideoStates(prev => ({
            ...prev,
            [slug]: { currentTime, muted, wasPlaying }
        }));

        // Also save to localStorage for persistence across sessions
        localStorage.setItem(`video-state-${slug}`, JSON.stringify({
            currentTime,
            muted,
            wasPlaying
        }));
    };

    const getVideoState = (slug: string) => {
        // First check in-memory state
        if (videoStates[slug]) {
            return videoStates[slug];
        }

        // Then check localStorage
        const stored = localStorage.getItem(`video-state-${slug}`);
        if (stored) {
            try {
                const state = JSON.parse(stored);
                // Update in-memory state
                setVideoStates(prev => ({
                    ...prev,
                    [slug]: state
                }));
                return state;
            } catch (e) {
                console.error("Error parsing stored video state:", e);
            }
        }

        return null;
    };

    const value: MediaContextType = {
        activeVideoIndex,
        setActiveVideo,
        isVideoPlaying,
        setVideoPlaying,
        videoStates,
        saveVideoState,
        getVideoState,
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
}

export function useMedia() {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error("useMedia must be used within a MediaProvider");
    }
    return context;
} 