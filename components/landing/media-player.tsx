"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink } from "lucide-react";
import Image from "next/image";
import { MediaItem } from "@/lib/sanity/queries";

interface MediaPlayerProps {
  media: MediaItem;
  onPlay?: () => void;
  onPause?: () => void;
}

export function MediaPlayer({ media, onPlay, onPause }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Extract SoundCloud track ID from URL
  const getSoundCloudTrackId = (url: string) => {
    const match = url.match(/soundcloud\.com\/([^/]+)\/([^/?]+)/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return null;
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoading(true);
    onPlay?.();

    // For direct audio/video URLs
    if (
      (media.type === "audio_url" || media.type === "video_url") &&
      audioRef.current
    ) {
      audioRef.current.play().catch(() => {
        setIsLoading(false);
      });
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsLoading(false);
    onPause?.();

    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const getEmbedUrl = () => {
    switch (media.type) {
      case "youtube": {
        const videoId = getYouTubeVideoId(media.url);
        return videoId
          ? `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`
          : null;
      }
      case "soundcloud": {
        const trackId = getSoundCloudTrackId(media.url);
        return trackId
          ? `https://w.soundcloud.com/player/?url=https://soundcloud.com/${trackId}&auto_play=${isPlaying}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`
          : null;
      }
      case "soundcloud_playlist": {
        const trackId = getSoundCloudTrackId(media.url);
        return trackId
          ? `https://w.soundcloud.com/player/?url=https://soundcloud.com/${trackId}/sets&auto_play=${isPlaying}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`
          : null;
      }
      default:
        return null;
    }
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="relative bg-black/20 backdrop-blur-sm rounded-sm overflow-hidden group">
      {/* Thumbnail or Embed */}
      <div className="relative aspect-video">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        ) : media.thumbnail ? (
          <div className="relative w-full h-full">
            <Image
              src={media.thumbnail}
              alt={media.title}
              fill={true}
              className="object-cover"
            />
            {(media.type === "audio_url" || media.type === "video_url") && (
              <>
                <audio
                  ref={audioRef}
                  src={media.url}
                  onPlay={() => {
                    setIsPlaying(true);
                    setIsLoading(false);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onLoadStart={() => setIsLoading(true)}
                  onCanPlay={() => setIsLoading(false)}
                  muted={isMuted}
                  className="hidden"
                />
                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="p-4 bg-white/20 hover:bg-white/30 rounded-sm text-white transition-all duration-200 backdrop-blur-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-sm animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Play className="w-16 h-16 text-white/50" />
          </div>
        )}
      </div>

      {/* Media Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg truncate mb-1">
              {media.title}
            </h3>
            {media.artist && (
              <p className="text-white/70 text-sm truncate">{media.artist}</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 ml-4">
            {(media.type === "audio_url" || media.type === "video_url") && (
              <button
                onClick={toggleMute}
                className="p-2 text-white/70 hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/70 hover:text-white transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-3">
            {media.genre && <span>{media.genre}</span>}
            {media.duration && <span>{media.duration}</span>}
          </div>
          {media.publishedAt && (
            <span>{new Date(media.publishedAt).toLocaleDateString()}</span>
          )}
        </div>

        {media.description && (
          <p className="text-white/70 text-sm mt-2 line-clamp-2">
            {media.description}
          </p>
        )}
      </div>
    </div>
  );
}
