"use client";

import Image from "next/image";

interface Card {
  id: number;
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
  showAddCard = true,
  onAddClick,
  className = "",
}: HorizontalCardCarouselProps) {
  const defaultCards = [
    {
      id: 1,
      image: `/placeholder.svg?height=600&width=400&query=portrait of person with long curly hair in moody lighting`,
      title: "Morning. Radio.",
      description:
        "A new way to ease your way into your day. Broadcasting live musicians, trusted selectors and welcoming hosts every Monday to Thursda...",
    },
    {
      id: 2,
      image: `/placeholder.svg?height=600&width=400&query=portrait of person with dark curly hair looking up`,
      title: "Prime Time. Radio.",
      description:
        "Extended sessions from top tier tastemakers. Broadcasting scene leaders every Monday to Saturday from 8 to 11PM.",
    },
    {
      id: 3,
      image: `/placeholder.svg?height=600&width=400&query=portrait of person on balcony with city background`,
      title: "Afternoon. Radio.",
      description:
        "Warm sounds and good conversations. Broadcasting every Monday to Thursday from 2 to 5PM.",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className={`max-w-full ${className}`}>
      <div className="flex gap-6 overflow-x-auto pb-4 pt-8 mt-4 px-4 scrollbar-hide">
        {displayCards.map((card) => (
          <div
            key={card.id}
            className="relative overflow-hidden rounded-sm aspect-[3/5] bg-gray-800 flex-shrink-0 w-96 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer transform-gpu will-change-transform"
          >
            <Image
              src={card.image || "/placeholder.svg"}
              alt=""
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
    </div>
  );
}
