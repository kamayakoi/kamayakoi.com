'use client';

import { notFound } from 'next/navigation';
import { CalendarDays, Clock, MapPin, Users, Check } from 'lucide-react';
import Header from '@/components/landing/header';
import { Separator } from '@/components/ui/separator';
import {
  getEventBySlug,
  getEventsForParallax,
  EventParallaxData,
} from '@/lib/sanity/queries';
import { EventShareButton } from '@/components/event/event-share-button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import CheckoutButtonWrapper from '@/components/event/CheckoutButtonWrapper';
import LoadingComponent from '@/components/ui/loader';
import { EventMediaDisplay } from '@/components/event/event-media-display';
import { Footer } from '@/components/landing/footer';
import ArtistCard from '@/components/event/ArtistCard';
import Link from 'next/link';
import SwipeNavigation from '@/components/event/SwipeNavigation';
import { TranslatedLabel } from '@/components/event/TranslatedLabel';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { t } from '@/lib/i18n/translations';
import { useEffect, useState } from 'react';

// Define specific type for TicketType
interface TicketTypeData {
  _key: string;
  name: string;
  price: number;
  description?: string;
  details?: string;
  stock?: number | null; // Allow null
  maxPerOrder?: number;
  salesStart?: string | null; // Allow null
  salesEnd?: string | null; // Allow null
  active: boolean; // <-- ADDED active field
  productId?: string;
}

// Define specific type for Bundle
interface BundleData {
  _key: string;
  name: string;
  bundleId: { current: string }; // Slug type
  price: number;
  description?: string;
  details?: string;
  stock?: number | null; // Allow null
  active: boolean; // Kept for bundles
  salesStart?: string | null; // Added salesStart for bundles
  salesEnd?: string | null; // Added salesEnd for bundles
  maxPerOrder?: number; // <-- ADDED maxPerOrder field
  productId?: string;
  ticketsIncluded?: number; // Number of tickets included per bundle
}

// Updated EventData type
type EventData = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  date: string; // ISO datetime string
  location?: {
    venueName?: string;
    address?: string;
    googleMapsUrl?: string;
    yangoUrl?: string; // Added Yango URL
  };
  flyer?: { url: string };
  promoVideoUrl?: string;
  description?: string;
  venueDetails?: string;
  hostedBy?: string;
  ticketsAvailable?: boolean; // Master switch
  ticketTypes?: TicketTypeData[];
  bundles?: BundleData[];
  lineup?: {
    _id: string;
    name: string;
    bio?: string;
    description?: string;
    image?: string;
    videoUrl?: string;
    videoCaption?: string;
    socialLink?: string;
    socialHandle?: string;
    isResident?: boolean;
    role?: string;
  }[];

  gallery?: { _key: string; url: string; caption?: string }[];
};

// Helper function for formatting price
const formatPrice = (price: number): string => {
  // Use non-breaking space (\u00A0) for thousands separator
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
};

// Enhanced text renderer for better formatting
const renderFormattedText = (text: string) => {
  return text.split('\n').map((line, index, array) => {
    const trimmedLine = line.trim();

    // Handle empty lines with better spacing
    if (trimmedLine === '') {
      const nextLine = array[index + 1];
      if (nextLine && nextLine.trim() === '') {
        return <div key={index} className="h-4" />; // Larger spacing for multiple breaks
      }
      return <div key={index} className="h-2" />; // Smaller spacing for single breaks
    }

    // Detect headings (all caps, short lines, or lines ending with :)
    const isHeading =
      trimmedLine.length < 60 &&
      (trimmedLine === trimmedLine.toUpperCase() ||
        trimmedLine.endsWith(':') ||
        trimmedLine.match(/^[A-Z][A-Z\s&-]{3,}$/));

    // Detect list items
    const isListItem =
      trimmedLine.match(/^[-•*→]\s/) || trimmedLine.match(/^\d+\.\s/);

    // Detect emphasis (special characters, quotes, warnings)
    const hasEmphasis =
      trimmedLine.includes('**') ||
      trimmedLine.includes('*') ||
      trimmedLine.startsWith('"') ||
      trimmedLine.startsWith('⚠️') ||
      trimmedLine.startsWith('✨') ||
      trimmedLine.startsWith('🎵') ||
      trimmedLine.startsWith('💫') ||
      trimmedLine.startsWith('🔥');

    // Detect important venue info
    const isImportant =
      trimmedLine.startsWith('⚠️') ||
      trimmedLine.startsWith('🅿️') ||
      trimmedLine.startsWith('♿') ||
      trimmedLine.startsWith('📍') ||
      trimmedLine.toLowerCase().includes('parking') ||
      trimmedLine.toLowerCase().includes('entrance') ||
      trimmedLine.toLowerCase().includes('access');

    if (isHeading) {
      return (
        <h4
          key={index}
          className="text-gray-100 font-semibold text-base mt-4 mb-2 tracking-wide"
        >
          {trimmedLine.replace(/[:]*$/, '')}
        </h4>
      );
    }

    if (isListItem) {
      return (
        <p key={index} className="mb-1 ml-4 relative">
          <span className="absolute -ml-4 text-primary">•</span>
          {trimmedLine.replace(/^[-•*→]\s/, '').replace(/^\d+\.\s/, '')}
        </p>
      );
    }

    if (isImportant) {
      return (
        <p key={index} className="mb-1 font-medium text-orange-300">
          {trimmedLine}
        </p>
      );
    }

    if (hasEmphasis) {
      return (
        <p key={index} className="mb-1 font-medium text-gray-200">
          {trimmedLine}
        </p>
      );
    }

    return (
      <p key={index} className="mb-1 text-gray-300">
        {trimmedLine}
      </p>
    );
  });
};

interface EventPageContentProps {
  slug: string;
}

export default function EventPageContent({ slug }: EventPageContentProps) {
  const { currentLanguage } = useTranslation();
  const [event, setEvent] = useState<EventData | null>(null);
  const [allEvents, setAllEvents] = useState<EventParallaxData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventData, eventsData] = await Promise.all([
          getEventBySlug(slug, currentLanguage),
          getEventsForParallax(10),
        ]);

        setEvent(eventData);
        setAllEvents(eventsData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (currentLanguage) {
      fetchData();
    }
  }, [slug, currentLanguage]);

  // Get all events for navigation
  const currentIndex = allEvents.findIndex(e => e.slug === slug);
  // Reverse navigation logic to make chronological sense:
  // Events are sorted newest first, so lower index = newer events, higher index = older events
  const chronologicallyNewerEvent =
    currentIndex > 0 ? allEvents[currentIndex - 1] : null;
  const chronologicallyOlderEvent =
    currentIndex < allEvents.length - 1 ? allEvents[currentIndex + 1] : null;

  if (loading) {
    return <LoadingComponent />;
  }

  if (!event) {
    notFound();
  }

  let mapEmbedSrc = null;
  if (event.location && (event.location.venueName || event.location.address)) {
    const queryParts = [];
    if (
      event.location.venueName &&
      event.location.venueName.trim().length > 2
    ) {
      queryParts.push(event.location.venueName.trim());
    }
    if (event.location.address && event.location.address.trim().length > 2) {
      queryParts.push(event.location.address.trim());
    }

    const saneQuery = queryParts.join(', ');
    if (saneQuery && saneQuery.length > 2) {
      const encodedQuery = encodeURIComponent(saneQuery);
      mapEmbedSrc = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
    }
  }

  // Format Date and Time
  const eventDate = event.date ? new Date(event.date) : null;
  const formattedDate =
    eventDate?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }) || 'Date TBC';
  const formattedTime =
    eventDate?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) || 'Time TBC';

  // Simplified availability check for the main "Get Tickets" section
  const globallyTicketsOnSale =
    event.ticketsAvailable === undefined || event.ticketsAvailable === true;
  const hasDefinedTickets = (event.ticketTypes?.length ?? 0) > 0;
  const hasDefinedBundles = (event.bundles?.length ?? 0) > 0;
  const hasAnyDefinedItems = hasDefinedTickets || hasDefinedBundles;

  return (
    <>
      <Header />
      <div className="relative">
        <div className="relative container mx-auto py-24 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Event Flyer/Video - Enhanced with better shadows and effects */}
            <div className="lg:col-span-2 relative">
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-gradient-to-br from-muted to-muted/50 border border-border/20">
                <EventMediaDisplay
                  flyerUrl={event.flyer?.url}
                  promoVideoUrl={event.promoVideoUrl}
                  eventTitle={event.title}
                  eventSlug={slug}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Event Details - Enhanced typography and spacing */}
            <div className="lg:col-span-3 space-y-8">
              {/* Title Section with better typography */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
                  {event.title}
                </h1>
                {event.subtitle && (
                  <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">
                    {event.subtitle}
                  </p>
                )}
              </div>

              {/* Event Meta Information - Redesigned with cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card/50 backdrop-blur-sm rounded-sm p-4 border border-border/20 hover:bg-card/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-sm">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        <TranslatedLabel translationKey="eventSlugPage.metaInfo.date" />
                      </p>
                      <p className="text-foreground font-semibold">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-sm p-4 border border-border/20 hover:bg-card/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-sm">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        <TranslatedLabel translationKey="eventSlugPage.metaInfo.time" />
                      </p>
                      <p className="text-foreground font-semibold">
                        {formattedTime}
                      </p>
                    </div>
                  </div>
                </div>

                {event.location?.venueName && (
                  <div className="bg-card/50 backdrop-blur-sm rounded-sm p-4 border border-border/20 hover:bg-card/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-sm">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground font-medium">
                          <TranslatedLabel translationKey="eventSlugPage.metaInfo.location" />
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {event.location.googleMapsUrl ? (
                            <a
                              href={event.location.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              <span className="font-semibold text-foreground hover:text-primary transition-colors">
                                {event.location.venueName}
                              </span>
                            </a>
                          ) : (
                            <div>
                              <span className="font-semibold text-foreground">
                                {event.location.venueName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {event.hostedBy && (
                  <div className="bg-card/50 backdrop-blur-sm rounded-sm p-4 border border-border/20 hover:bg-card/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-sm">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          <TranslatedLabel translationKey="eventSlugPage.metaInfo.hostedBy" />
                        </p>
                        <p className="text-foreground font-semibold">
                          {event.hostedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="opacity-30" />

              {/* Tickets Section - Enhanced design */}
              <div className="space-y-6">
                {!globallyTicketsOnSale ? (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-sm backdrop-blur-sm">
                    <p className="font-semibold text-center">
                      <TranslatedLabel translationKey="eventSlugPage.tickets.salesClosedGlobal" />
                    </p>
                  </div>
                ) : !hasAnyDefinedItems ? (
                  <div className="bg-muted/50 border border-border/20 p-6 rounded-sm backdrop-blur-sm text-center">
                    <p className="font-medium text-muted-foreground">
                      <TranslatedLabel translationKey="eventSlugPage.tickets.noItemsListed" />
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-left">
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        <TranslatedLabel translationKey="eventSlugPage.tickets.title" />
                      </h2>
                      <p className="text-muted-foreground">
                        <TranslatedLabel translationKey="eventSlugPage.tickets.selectAndJoin" />
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Ticket Types */}
                      {hasDefinedTickets && (
                        <div className="space-y-3">
                          {event.ticketTypes?.map(ticket => {
                            console.log(
                              'Event page - ticket.productId:',
                              ticket.productId,
                              'for ticket:',
                              ticket.name
                            );
                            return (
                              <Card
                                key={ticket._key}
                                className="border-border/40 bg-card/30 backdrop-blur-sm shadow-lg rounded-sm overflow-hidden hover:bg-card/50 transition-all duration-300 hover:shadow-xl hover:border-primary/30"
                              >
                                <div className="p-6">
                                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <div className="flex-grow space-y-3">
                                      <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="text-foreground font-bold text-xl">
                                          {ticket.name.replace(
                                            /\s*\(\d+(\s*\w+)?\)$/,
                                            ''
                                          )}
                                        </h4>
                                        <div className="h-6 w-px bg-border"></div>
                                        <p className="text-primary font-bold text-2xl">
                                          {formatPrice(ticket.price)}
                                          <TranslatedLabel translationKey="eventSlugPage.tickets.currencySuffix" />
                                        </p>
                                      </div>

                                      {ticket.description && (
                                        <div className="space-y-2">
                                          {ticket.description
                                            .split('\n')
                                            .map((line, index) => {
                                              const trimmedLine = line.trim();
                                              if (trimmedLine === '')
                                                return <br key={index} />;
                                              if (
                                                trimmedLine.startsWith('⚠️')
                                              ) {
                                                return (
                                                  <p
                                                    key={index}
                                                    className="text-amber-400 font-medium text-sm"
                                                  >
                                                    {trimmedLine}
                                                  </p>
                                                );
                                              }
                                              return (
                                                <p
                                                  key={index}
                                                  className="text-muted-foreground text-sm leading-relaxed"
                                                >
                                                  {trimmedLine}
                                                </p>
                                              );
                                            })}
                                        </div>
                                      )}

                                      {ticket.details && (
                                        <div className="space-y-1">
                                          {ticket.details
                                            .split('\n')
                                            .map((line, idx) => {
                                              const trimmedLine = line.trim();
                                              if (trimmedLine === '')
                                                return <br key={idx} />;
                                              const match =
                                                trimmedLine.match(
                                                  /^(✅|✔|•|-|\*)\s*(.*)/
                                                );
                                              if (match && match[2]) {
                                                return (
                                                  <div
                                                    key={idx}
                                                    className="flex items-start gap-2"
                                                  >
                                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-muted-foreground">
                                                      {match[2]}
                                                    </span>
                                                  </div>
                                                );
                                              }
                                              return (
                                                <p
                                                  key={idx}
                                                  className="text-sm text-muted-foreground ml-6"
                                                >
                                                  {trimmedLine}
                                                </p>
                                              );
                                            })}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
                                      <CheckoutButtonWrapper
                                        item={{
                                          id: ticket._key,
                                          name: ticket.name,
                                          price: ticket.price,
                                          isBundle: false,
                                          maxPerOrder: ticket.maxPerOrder,
                                          stock: ticket.stock,
                                          active: ticket.active,
                                          salesStart: ticket.salesStart,
                                          salesEnd: ticket.salesEnd,
                                          productId: ticket.productId,
                                        }}
                                        eventDetails={{
                                          id: event._id,
                                          title: event.title,
                                          dateText: formattedDate,
                                          timeText: formattedTime,
                                          venueName: event.location?.venueName,
                                        }}
                                        globallyTicketsOnSale={
                                          globallyTicketsOnSale
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}

                      {/* Bundles */}
                      {hasDefinedBundles && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg text-center">
                            <TranslatedLabel translationKey="eventSlugPage.bundles.title" />
                          </h3>
                          {event.bundles?.map(bundle => {
                            console.log(
                              'Event page - bundle.productId:',
                              bundle.productId,
                              'for bundle:',
                              bundle.name
                            );
                            return (
                              <Card
                                key={bundle._key}
                                className="border-border/40 bg-card/30 backdrop-blur-sm shadow-lg rounded-sm overflow-hidden hover:bg-card/50 transition-all duration-300 hover:shadow-xl hover:border-primary/30"
                              >
                                <div className="p-6">
                                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <div className="flex-grow space-y-3">
                                      <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="text-foreground font-bold text-xl">
                                          {bundle.name.replace(
                                            /\s*\(\d+(\s*\w+)?\)$/,
                                            ''
                                          )}
                                        </h4>
                                        <div className="h-6 w-px bg-border"></div>
                                        <p className="text-primary font-bold text-2xl">
                                          {formatPrice(bundle.price)}
                                          <TranslatedLabel translationKey="eventSlugPage.tickets.currencySuffix" />
                                        </p>
                                      </div>

                                      {bundle.description && (
                                        <div className="space-y-2">
                                          {bundle.description
                                            .split('\n')
                                            .map((line, index) => {
                                              const trimmedLine = line.trim();
                                              if (trimmedLine === '')
                                                return <br key={index} />;
                                              if (
                                                trimmedLine.startsWith('⚠️')
                                              ) {
                                                return (
                                                  <p
                                                    key={index}
                                                    className="text-amber-400 font-medium text-sm"
                                                  >
                                                    {trimmedLine}
                                                  </p>
                                                );
                                              }
                                              return (
                                                <p
                                                  key={index}
                                                  className="text-muted-foreground text-sm leading-relaxed"
                                                >
                                                  {trimmedLine}
                                                </p>
                                              );
                                            })}
                                        </div>
                                      )}

                                      {bundle.details && (
                                        <div className="space-y-1">
                                          {bundle.details
                                            .split('\n')
                                            .map((line, idx) => {
                                              const trimmedLine = line.trim();
                                              if (trimmedLine === '')
                                                return <br key={idx} />;
                                              const match =
                                                trimmedLine.match(
                                                  /^(✅|✔|•|-|\*)\s*(.*)/
                                                );
                                              if (match && match[2]) {
                                                return (
                                                  <div
                                                    key={idx}
                                                    className="flex items-start gap-2"
                                                  >
                                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-muted-foreground">
                                                      {match[2]}
                                                    </span>
                                                  </div>
                                                );
                                              }
                                              return (
                                                <p
                                                  key={idx}
                                                  className="text-sm text-muted-foreground ml-6"
                                                >
                                                  {trimmedLine}
                                                </p>
                                              );
                                            })}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
                                      <CheckoutButtonWrapper
                                        item={{
                                          id: bundle.bundleId.current,
                                          name: bundle.name,
                                          price: bundle.price,
                                          isBundle: true,
                                          maxPerOrder: bundle.maxPerOrder,
                                          stock: bundle.stock,
                                          active: bundle.active,
                                          salesStart: bundle.salesStart,
                                          salesEnd: bundle.salesEnd,
                                          productId: bundle.productId,
                                          ticketsIncluded:
                                            bundle.ticketsIncluded,
                                        }}
                                        eventDetails={{
                                          id: event._id,
                                          title: event.title,
                                          dateText: formattedDate,
                                          timeText: formattedTime,
                                          venueName: event.location?.venueName,
                                        }}
                                        globallyTicketsOnSale={
                                          globallyTicketsOnSale
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Content Sections - Improved with better spacing */}
          <div className="mt-16 space-y-12">
            {event.description && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    <TranslatedLabel translationKey="eventSlugPage.detailsSection.title" />
                  </h2>
                </div>
                <div className="bg-card/30 backdrop-blur-sm rounded-sm p-8 border border-border/20">
                  <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                    {renderFormattedText(event.description)}
                  </div>
                </div>
              </div>
            )}

            {/* Venue Section - Restored */}
            {(event.location?.venueName ||
              event.location?.address ||
              event.venueDetails) && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    <TranslatedLabel translationKey="eventSlugPage.venueSection.title" />
                  </h2>
                </div>
                <div className="bg-card/30 backdrop-blur-sm rounded-sm p-8 border border-border/20 space-y-6">
                  {event.location?.venueName && (
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {event.location.venueName}
                      </h3>
                      {event.location?.address && (
                        <p className="text-muted-foreground mb-4">
                          {event.location.address}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Embedded Map - Restored */}
                  {mapEmbedSrc && (
                    <div className="relative w-full h-[300px] bg-muted rounded-sm shadow-lg border border-border/20 overflow-hidden">
                      <iframe
                        src={mapEmbedSrc}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map of ${event.location?.venueName || 'event location'}`}
                        className="absolute top-0 left-0 w-full h-full"
                      ></iframe>
                    </div>
                  )}

                  {event.venueDetails && (
                    <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                      {renderFormattedText(event.venueDetails)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Artists/Lineup Section */}
            {event.lineup && event.lineup.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    <TranslatedLabel translationKey="eventSlugPage.lineupSection.title" />
                  </h2>
                </div>
                <div className="bg-card/30 backdrop-blur-sm rounded-sm p-8 border border-border/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {event.lineup.map(artist => (
                      <div key={artist._id} className="flex justify-center">
                        <ArtistCard
                          artist={{
                            _id: artist._id,
                            name: artist.name,
                            bio: artist.bio || artist.description,
                            image: artist.image,
                            socialLink: artist.socialLink,
                            isResident: artist.isResident,
                          }}
                          currentLanguage={currentLanguage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Share Section - Enhanced */}
            <div className="max-w-4xl mx-auto">
              <Separator className="opacity-30 mb-8" />
              <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-card/30 backdrop-blur-sm rounded-sm p-6 border border-border/20 gap-4 md:gap-0">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    <TranslatedLabel translationKey="eventSlugPage.shareSection.title" />
                  </h3>
                  <p className="text-muted-foreground">
                    <TranslatedLabel translationKey="eventSlugPage.shareSection.subtitle" />
                  </p>
                </div>
                <div className="flex justify-center md:justify-end">
                  <EventShareButton
                    eventTitle={event.title}
                    eventSlug={event.slug.current}
                  />
                </div>
              </div>
            </div>

            {/* Previous events - cards like landing event-showcase */}
            {(() => {
              const previousEvents = allEvents.filter(e => e.slug !== slug);
              if (previousEvents.length === 0) return null;
              const getMonthColor = (date: Date) => {
                const month = date.getMonth();
                const colorMap: Record<number, { bg: string; text: string }> = {
                  0: { bg: 'bg-red-600', text: 'text-white' },
                  1: { bg: 'bg-amber-600', text: 'text-white' },
                  2: { bg: 'bg-yellow-600', text: 'text-white' },
                  3: { bg: 'bg-cyan-600', text: 'text-white' },
                  4: { bg: 'bg-teal-600', text: 'text-white' },
                  5: { bg: 'bg-sky-600', text: 'text-white' },
                  6: { bg: 'bg-purple-600', text: 'text-white' },
                  7: { bg: 'bg-pink-600', text: 'text-white' },
                  8: { bg: 'bg-indigo-600', text: 'text-white' },
                  9: { bg: 'bg-orange-600', text: 'text-white' },
                  10: { bg: 'bg-emerald-600', text: 'text-white' },
                  11: { bg: 'bg-green-600', text: 'text-white' },
                };
                return (
                  colorMap[month] || { bg: 'bg-blue-600', text: 'text-white' }
                );
              };
              return (
                <div className="max-w-7xl mx-auto px-4">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">
                      <TranslatedLabel translationKey="eventSlugPage.previousEvents.title" />
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {previousEvents.slice(0, 4).map(ev => {
                      const evDate = ev.date ? new Date(ev.date) : null;
                      const formattedEvDate = evDate?.toLocaleDateString(
                        currentLanguage === 'fr' ? 'fr-FR' : 'en-US',
                        { day: 'numeric', month: 'short' }
                      );
                      const desc =
                        typeof ev.description === 'string'
                          ? ev.description
                          : null;
                      const img = ev.featuredImage || '/placeholder.webp';
                      const hasValidImage =
                        img && img.trim() !== '' && img !== '/placeholder.webp';
                      return (
                        <Card
                          key={ev._id}
                          className="group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-sm border-border/40 bg-card p-0"
                        >
                          <div className="relative rounded-t-sm overflow-hidden">
                            <Link
                              href={`/events/${ev.slug}`}
                              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              aria-label={`View ${ev.title}`}
                              prefetch
                            >
                              <div className="aspect-square relative bg-muted overflow-hidden">
                                <Image
                                  src={
                                    hasValidImage ? img : '/placeholder.webp'
                                  }
                                  alt={ev.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                  quality={100}
                                  placeholder="blur"
                                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                                />
                              </div>
                            </Link>
                          </div>
                          <CardContent className="pt-1 pb-4 px-4 flex flex-col min-h-[120px]">
                            <div className="flex-1 space-y-1">
                              <Link
                                href={`/events/${ev.slug}`}
                                className="block"
                              >
                                <h3 className="font-medium text-base leading-tight hover:text-primary transition-colors line-clamp-2 break-words overflow-wrap-anywhere">
                                  {ev.title}
                                </h3>
                              </Link>
                              {desc && (
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words overflow-wrap-anywhere">
                                  {desc}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {formattedEvDate && evDate && (
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-sm ${getMonthColor(evDate).bg} ${getMonthColor(evDate).text}`}
                                  >
                                    {formattedEvDate}
                                  </span>
                                )}
                              </div>
                              <Link
                                href={`/events/${ev.slug}`}
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                              >
                                {t(
                                  currentLanguage,
                                  'eventShowcase.events.viewEvent'
                                )}
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      <Footer />

      {/* Swipe Navigation Component */}
      <SwipeNavigation
        previousEvent={chronologicallyOlderEvent}
        nextEvent={chronologicallyNewerEvent}
      />
    </>
  );
}
