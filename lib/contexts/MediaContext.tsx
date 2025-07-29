"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import { useMusic } from "./MusicContext";

interface MediaContextType {
    activeVideoIndex: number | null;
    setActiveVideo: (index: number | null) => void;
    isVideoPlaying: boolean;
    setVideoPlaying: (playing: boolean) => void;
    videoStates: Record<
        string,
        { currentTime: number; muted: boolean; wasPlaying: boolean }
    >;
    saveVideoState: (
        slug: string,
        currentTime: number,
        muted: boolean,
        wasPlaying: boolean,
    ) => void;
    getVideoState: (
        slug: string,
    ) => { currentTime: number; muted: boolean; wasPlaying: boolean } | null;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

interface MediaProviderProps {
    children: ReactNode;
}

export function MediaProvider({ children }: MediaProviderProps) {
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [videoStates, setVideoStates] = useState<
        Record<string, { currentTime: number; muted: boolean; wasPlaying: boolean }>
    >({});

    const { pause: pauseMusic, isPlaying: isMusicPlaying } = useMusic();

    // Coordinate video and audio playback
    useEffect(() => {
        if (isVideoPlaying && activeVideoIndex !== null) {
            if (isMusicPlaying) {
                pauseMusic();
            }
        }
    }, [isVideoPlaying, activeVideoIndex, pauseMusic, isMusicPlaying]);

    const setActiveVideo = useCallback((index: number | null) => {
        setActiveVideoIndex(index);
    }, []);

    const setVideoPlaying = useCallback((playing: boolean) => {
        setIsVideoPlaying(playing);
    }, []);

    const saveVideoState = useCallback(
        (
            slug: string,
            currentTime: number,
            muted: boolean,
            wasPlaying: boolean,
        ) => {
            setVideoStates((prev) => ({
                ...prev,
                [slug]: { currentTime, muted, wasPlaying },
            }));

            // Debounced localStorage save to reduce performance impact
            setTimeout(() => {
                try {
                    localStorage.setItem(
                        `video-state-${slug}`,
                        JSON.stringify({
                            currentTime,
                            muted,
                            wasPlaying,
                        }),
                    );
                } catch {
                    // Ignore localStorage errors
                }
            }, 1000);
        },
        [],
    );

    const getVideoState = useCallback(
        (slug: string) => {
            // First check in-memory state
            if (videoStates[slug]) {
                return videoStates[slug];
            }

            // Then check localStorage
            try {
                const stored = localStorage.getItem(`video-state-${slug}`);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch {
                // Ignore localStorage errors
            }

            return null;
        },
        [videoStates],
    );

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
        <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
    );
}

export function useMedia() {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error("useMedia must be used within a MediaProvider");
    }
    return context;
} 