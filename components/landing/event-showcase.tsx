"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { useEffect, useState } from "react";
import { getLatestEvents } from "@/lib/sanity/queries";

// Props interface
interface ShowcaseEvent {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  date?: string;
  time?: string;
  location?: string;
  flyer: {
    url: string;
  };
  ticketsAvailable: boolean;
  description?: string;
}

interface EventShowcaseProps {
  limit?: number;
}

export function EventShowcase({ limit = 6 }: EventShowcaseProps = {}) {
  const { currentLanguage } = useTranslation();
  const [events, setEvents] = useState<ShowcaseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getLatestEvents(limit);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [limit]);

  const hasEvents = events && events.length > 0;

  return (
    <section className="py-20 md:py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-1 h-12 bg-white"></div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                {t(currentLanguage, "eventShowcase.events.title")}
              </h2>
              <p className="text-white/70 text-lg">
                {t(currentLanguage, "eventShowcase.events.subtitle")}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="text-white/70">Loading events...</div>
            </div>
          ) : hasEvents ? (
            <>
              <div className="max-w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 mt-4 px-4">
                  {events.map((event) => {
                    const eventData = {
                      title: event.title,
                      description:
                        typeof event.description === "string"
                          ? event.description
                          : "",
                      image: event.flyer?.url || "/placeholder.webp",
                      date: event.date
                        ? new Date(event.date).toLocaleDateString(
                          currentLanguage === "fr" ? "fr-FR" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                          },
                        )
                        : "TBD",
                      slug: event.slug.current,
                    };

                    return (
                      <Link
                        key={event._id}
                        href={`/events/${eventData.slug}`}
                        className="block"
                      >
                        <div className="relative overflow-hidden rounded-sm aspect-[3/5] bg-gray-800 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer transform-gpu will-change-transform">
                          <Image
                            src={eventData.image}
                            alt={eventData.title}
                            fill
                            className="w-full h-full object-cover"
                            quality={90}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6">
                            <h3 className="text-white text-2xl font-bold mb-3 text-balance">
                              {eventData.title}
                            </h3>
                            <p className="text-white/90 text-sm leading-relaxed mb-4 text-pretty">
                              {eventData.description
                                ? eventData.description.split(".")[0] + "."
                                : ""}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-white/70 text-xs font-medium uppercase tracking-wide">
                                {eventData.date}
                              </span>
                              <span className="text-white font-bold text-sm tracking-wider uppercase hover:text-white/80 transition-colors cursor-pointer">
                                {t(
                                  currentLanguage,
                                  "eventShowcase.events.viewEvent",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Coming Soon Message - using translations */
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
                {t(currentLanguage, "eventShowcase.events.comingSoon.title")}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                {t(
                  currentLanguage,
                  "eventShowcase.events.comingSoon.description",
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
