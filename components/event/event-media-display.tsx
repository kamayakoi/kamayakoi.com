"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import { useMusic } from "@/lib/contexts/MusicContext";

interface EventMediaDisplayProps {
    flyerUrl?: string;
    promoVideoUrl?: string;
    eventTitle: string;
}

export function EventMediaDisplay({
    flyerUrl,
    promoVideoUrl,
    eventTitle,
}: EventMediaDisplayProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const { pause: pauseMusic, isPlaying } = useMusic();

    // Prevent music from playing on pages with videos
    useEffect(() => {
        if (promoVideoUrl && isPlaying) {
            pauseMusic();
        }
    }, [promoVideoUrl, isPlaying, pauseMusic]);

    useEffect(() => {
        if (promoVideoUrl && videoRef.current) {
            const video = videoRef.current;
            video.muted = isMuted; // Use state for muted

            // Add event listeners for video play/pause to coordinate with music
            const handlePlay = () => {
                pauseMusic();
            };

            video.addEventListener('play', handlePlay);

            // Cleanup
            return () => {
                video.removeEventListener('play', handlePlay);
            };
        }
    }, [promoVideoUrl, isMuted, pauseMusic]);

    const toggleMute = () => {
        if (videoRef.current) {
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            videoRef.current.muted = newMutedState;
        }
    };

    if (promoVideoUrl) {
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

                {/* Mute/Unmute Button */}
                <button
                    onClick={toggleMute}
                    className="absolute bottom-4 right-4 z-40 p-2 bg-black/20 hover:bg-black/40 rounded-sm text-white focus:outline-none transition-colors duration-200 backdrop-blur-sm"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>
        );
    }

    return (
        <Image
            src={flyerUrl || "/placeholder.webp"}
            alt={eventTitle}
            priority
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
        />
    );
}
