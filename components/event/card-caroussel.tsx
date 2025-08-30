"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

interface Card {
  id: string | number;
  image: string;
  title?: string;
  description?: string;
}

interface HorizontalCardCarouselProps {
  cards?: Card[];
  cardCount?: number;
  showAddCard?: boolean;
  onAddClick?: () => void;
  className?: string;
}

export default function HorizontalCardCarousel({
  cards,
  // cardCount = 3,
  showAddCard = false, // Changed to false by default since we're removing mock data
  onAddClick,
  className = "",
}: HorizontalCardCarouselProps) {
  const { currentLanguage } = useTranslation();
  const hasCards = cards && cards.length > 0;

  return (
    <div className={`max-w-full ${className}`}>
      {hasCards ? (
        <div className="flex gap-6 overflow-x-auto pb-4 pt-8 mt-4 px-4 scrollbar-hide">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-sm aspect-[3/5] bg-gray-800 flex-shrink-0 w-96 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer transform-gpu will-change-transform"
            >
              <Image
                src={card.image || "/placeholder.svg"}
                alt={card.title || ""}
                className="w-full h-full object-cover"
              />

              {(card.title || card.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  {card.title && (
                    <h3 className="text-white text-2xl font-bold mb-3 text-balance">
                      {card.title}
                    </h3>
                  )}
                  {card.description && (
                    <p className="text-white/90 text-sm leading-relaxed text-pretty">
                      {card.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {showAddCard && (
            <div
              className="relative overflow-hidden rounded-sm aspect-[3/5] bg-gray-700 flex-shrink-0 w-96 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-500 hover:border-gray-400 transform-gpu will-change-transform"
              onClick={onAddClick}
            >
              <div className="text-6xl text-gray-400 hover:text-gray-300 transition-colors">
                +
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Coming Soon Message */
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20">
          <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
            {t(currentLanguage, "cardCarousel.comingSoon.title")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {t(currentLanguage, "cardCarousel.comingSoon.description")}
          </p>
        </div>
      )}
    </div>
  );
}
