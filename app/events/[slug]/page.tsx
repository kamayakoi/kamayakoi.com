import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import EventPageContent from '@/components/event/EventPageContent';
import EventPageSkeleton from '@/components/event/event-page-skeleton';
import {
  getEventPageData,
  getEventsForParallax,
  getHomepageContent,
} from '@/lib/sanity/queries';

// Helper to get locale (consistent with other page)
const getPageLocale = (params?: { slug?: string; locale?: string }): string => {
  return params?.locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
};

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  const params = await paramsPromise;
  const currentLanguage = getPageLocale(params);
  const { slug } = params;
  const { getEventBySlug } = await import('@/lib/sanity/queries');
  const event = await getEventBySlug(slug, currentLanguage);

  if (!event) {
    return {
      title: 'Event not found',
    };
  }

  return {
    title: `${event.title}`,
    description: event.subtitle || event.description,
  };
}

export default async function EventPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  return (
    <Suspense fallback={<EventPageSkeleton />}>
      <EventContent params={paramsPromise} />
    </Suspense>
  );
}

async function EventContent({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  const { slug } = await paramsPromise;
  const [event, allEvents, homepageData] = await Promise.all([
    getEventPageData(slug),
    getEventsForParallax(10),
    getHomepageContent(),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <EventPageContent
      event={event}
      allEvents={allEvents}
      ticketsButtonLocation={homepageData?.ticketsButtonLocation}
      showBlogInNavigation={homepageData?.showBlogInNavigation}
      showArchivesInNavigation={homepageData?.showArchivesInNavigation}
    />
  );
}
