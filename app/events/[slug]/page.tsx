import { Suspense } from 'react';
import EventPageContent from '@/components/event/EventPageContent';
import LoadingComponent from '@/components/ui/loader';
import { getHomepageContent } from '@/lib/sanity/queries';

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
  const params = await paramsPromise;
  const { slug } = params;
  const homepageData = await getHomepageContent();

  return (
    <Suspense fallback={<LoadingComponent />}>
      <EventPageContent
        slug={slug}
        ticketsButtonLocation={homepageData?.ticketsButtonLocation}
        showBlogInNavigation={homepageData?.showBlogInNavigation}
        showArchivesInNavigation={homepageData?.showArchivesInNavigation}
      />
    </Suspense>
  );
}
