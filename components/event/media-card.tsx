"use client";

import { ChevronRight, Star, Youtube } from "lucide-react";

interface MediaCard {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  genres: string[];
  image: string;
  isLarge?: boolean;
}

interface HorizontalMediaCardsProps {
  title?: string;
  cards: MediaCard[];
  onCardClick?: (card: MediaCard) => void;
}

export default function HorizontalMediaCards({
  title = "Must Watch",
  cards,
  onCardClick,
}: HorizontalMediaCardsProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-white text-lg md:text-xl font-semibold">{title}</h2>
        <ChevronRight className="text-white/60 w-4 h-4 md:w-5 md:h-5" />
      </div>

      {/* Cards Container */}
      <div className="flex gap-4 md:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 md:px-0 md:mx-0">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`
              relative flex-shrink-0 rounded-sm overflow-hidden cursor-pointer
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
              ${
                card.isLarge || index === 0
                  ? "w-[360px] md:w-[480px] h-60 md:h-64"
                  : "w-[340px] md:w-[420px] h-60 md:h-64"
              }
            `}
            onClick={() => onCardClick?.(card)}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${card.image})` }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Top Icons */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 flex gap-1.5 md:gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-black/40 rounded-sm flex items-center justify-center">
                <Star className="w-3 h-3 md:w-4 md:h-4 text-white/80" />
              </div>
              <div className="w-6 h-6 md:w-8 md:h-8 bg-black/40 rounded-sm flex items-center justify-center">
                <Youtube className="w-3 h-3 md:w-4 md:h-4 text-white/80" />
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
              <h3 className="text-white font-semibold text-base md:text-lg mb-1 line-clamp-2">
                {card.title}
              </h3>
              {card.subtitle && (
                <p className="text-white/80 text-xs md:text-sm mb-2 line-clamp-1">
                  {card.subtitle}
                </p>
              )}
              <p className="text-white/60 text-xs md:text-sm mb-2 md:mb-3">
                {card.date} {card.time}
              </p>

              {/* Genre Tags */}
              <div className="flex gap-1.5 md:gap-2 flex-wrap">
                {card.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 md:py-1 bg-white/20 rounded text-white/80 text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
