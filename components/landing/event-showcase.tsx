"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { Card, CardContent } from "@/components/ui/card";

// Props interface
interface ShowcaseEvent {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  date?: string;
  time?: string;
  location?: string | {
    venueName?: string;
    address?: string;
  };
  flyer: {
    url: string;
  };
  ticketsAvailable: boolean;
  description?: string;
}

interface EventShowcaseProps {
  events: ShowcaseEvent[];
}

function EventCard({ event }: { event: ShowcaseEvent }) {
  const { currentLanguage } = useTranslation();

  const eventDate = event.date ? new Date(event.date) : null;
  const formattedDate = eventDate?.toLocaleDateString(
    currentLanguage === "fr" ? "fr-FR" : "en-US",
    {
      day: "numeric",
      month: "short",
    }
  );

  const mainImage = event.flyer?.url || "/placeholder.webp";
  const hasValidImage = mainImage && mainImage.trim() !== "" && mainImage !== "/placeholder.webp";

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-sm border-border/40 bg-card p-0 mb-6">
      <div className="relative rounded-t-sm overflow-hidden">
        <Link
          href={`/events/${event.slug.current}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View ${event.title}`}
          prefetch
        >
          {hasValidImage ? (
            <div className="aspect-square relative bg-muted overflow-hidden">
              <Image
                src={mainImage}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                quality={100}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
              />
            </div>
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
        </Link>
      </div>

      <CardContent className="pt-1 pb-4 px-4 space-y-1">
        <Link href={`/events/${event.slug.current}`} className="block">
          <h3 className="font-medium text-base leading-tight hover:text-primary transition-colors line-clamp-2 break-words overflow-wrap-anywhere">
            {event.title}
          </h3>
        </Link>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words overflow-wrap-anywhere">
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {formattedDate && (
              <span className="px-2 py-1 text-xs font-medium rounded-sm bg-blue-900 text-blue-200">
                {formattedDate}
              </span>
            )}
          </div>
          <Link
            href={`/events/${event.slug.current}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            View Event
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventShowcase({ events }: EventShowcaseProps) {
  const { currentLanguage } = useTranslation();

  const hasEvents = events && events.length > 0;

  return (
    <section className="pt-16 md:pt-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-1 h-12 bg-white"></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {currentLanguage === "fr" ? "Événements" : "Events"}
              <span className="text-white/60 mx-3">·</span>
              <span className="text-white/70 font-normal text-xl md:text-2xl inline-block transform -translate-y-0.25">
                {currentLanguage === "fr"
                  ? "Découvrez les prochains événements"
                  : "Discover upcoming events"}
              </span>
            </h2>
          </div>
        </div>

        {hasEvents ? (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {events.slice(0, 6).map((event: ShowcaseEvent) => (
                <EventCard key={event._id} event={event} />
              ))}
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
    </section>
  );
}
