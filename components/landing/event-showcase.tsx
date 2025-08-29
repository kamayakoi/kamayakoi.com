"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import HorizontalMediaCards from "@/components/event/media-card";

const showcaseEvents = [
  {
    title: "TINASHE + FRIENDS",
    description:
      "Buckle up! This summer saw a very special KK debut from super-starlet, Tinashe.",
    image: "/placeholder.webp",
    date: "Summer 2024",
  },
  {
    title: "NEPAL",
    description:
      "The third stop of our South Asia tour with Dialled In: Nepal. Channeling the free-spirited hill gatherings of Kathmandu's early 00s psytrance scene...",
    image: "/placeholder.webp",
    date: "March 2024",
  },
  {
    title: "PAKISTAN",
    description:
      "The third stop of our South Asia tour with Dialled In: Lahore, Pakistan. For our debut in Lahore, we showcased the city's off-grid party underground...",
    image: "/placeholder.webp",
    date: "February 2024",
  },
  {
    title: "SRI LANKA",
    description:
      "The second stop of our South Asia tour with Dialled In: Colombo, Sri Lanka. Our first time in Sri Lanka, KK's debut in Colombo took place at the city's...",
    image: "/placeholder.webp",
    date: "January 2024",
  },
  {
    title: "KENYA",
    description:
      "Our first East African adventure brought us to Nairobi where we connected with the vibrant underground music scene.",
    image: "/placeholder.webp",
    date: "December 2023",
  },
  {
    title: "INDIA",
    description:
      "From Mumbai's bustling streets to Delhi's historic venues, our Indian tour showcased the diversity of South Asian music culture.",
    image: "/placeholder.webp",
    date: "November 2023",
  },
];

const mediaCards = [
  {
    id: "1",
    title: "Tinashe Live Session",
    subtitle: "Exclusive backstage footage",
    date: "Aug 15",
    time: "8:00 PM",
    genres: ["Pop", "R&B"],
    image: "/placeholder.webp",
    isLarge: true,
  },
  {
    id: "2",
    title: "Nepal Tour Highlights",
    subtitle: "Behind the scenes",
    date: "Mar 20",
    time: "7:30 PM",
    genres: ["Electronic", "Psytrance"],
    image: "/placeholder.webp",
  },
  {
    id: "3",
    title: "Pakistan Underground",
    subtitle: "Documentary series",
    date: "Feb 28",
    time: "9:00 PM",
    genres: ["Electronic", "Underground"],
    image: "/placeholder.webp",
  },
  {
    id: "4",
    title: "Sri Lanka Nights",
    subtitle: "Concert recording",
    date: "Jan 18",
    time: "8:30 PM",
    genres: ["Electronic", "Live"],
    image: "/placeholder.webp",
  },
];

export function EventShowcase() {
  return (
    <section className="py-20 md:py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-1 h-12 bg-white"></div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Featured
              </h2>
              <p className="text-white/70 text-lg">
                Exclusive content and behind-the-scenes
              </p>
            </div>
          </div>
          <HorizontalMediaCards
            title=""
            cards={mediaCards}
            onCardClick={(card) => {
              console.log("Media card clicked:", card);
            }}
          />
        </div>
        <div>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-1 h-12 bg-white"></div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Events
              </h2>
              <p className="text-white/70 text-lg">
                Past performances and highlights
              </p>
            </div>
          </div>

          {/* Header with arrow for carousel */}
          <div className="flex items-center justify-between mb-4 mt-8">
            <div></div> {/* Empty space for left side */}
            <ChevronRight className="text-white/60 w-4 h-4 md:w-5 md:h-5" />
          </div>

          <div className="max-w-full">
            <div className="flex gap-6 overflow-x-auto pb-2 pt-8 mt-4 px-4 scrollbar-hide">
              {showcaseEvents.map((event, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-sm aspect-[3/5] bg-gray-800 flex-shrink-0 w-[330px] md:w-80 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer transform-gpu will-change-transform"
                >
                  <Image
                    src={event.image || "/placeholder.webp"}
                    alt={event.title}
                    fill
                    className="w-full h-full object-cover"
                    quality={90}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6">
                    <h3 className="text-white text-2xl font-bold mb-3 text-balance">
                      {event.title}
                    </h3>
                    <p className="text-white/90 text-sm leading-relaxed mb-4 text-pretty">
                      {event.description.split(".")[0] + "."}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs font-medium uppercase tracking-wide">
                        {event.date}
                      </span>
                      <span className="text-white font-bold text-sm tracking-wider uppercase hover:text-white/80 transition-colors cursor-pointer">
                        VIEW EVENT →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
