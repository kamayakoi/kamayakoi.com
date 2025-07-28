import type { Metadata } from "next";
import { Suspense } from "react";
import ParallaxGallery from "@/components/ui/parallax";
import {
  getEventsForParallax,
  type EventParallaxData,
} from "@/lib/sanity/queries";
import Header from "@/components/landing/header";
import { t } from "@/lib/i18n/translations";
import LoadingComponent from "@/components/ui/loader";

const getPageLocale = (params?: { locale?: string }): string => {
  return params?.locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en";
};

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise;
  const currentLanguage = getPageLocale(params);
  return {
    title: t(currentLanguage, "eventsPage.metadata.title"),
    description: t(currentLanguage, "eventsPage.metadata.description"),
  };
}

async function EventsContent() {
  const events: EventParallaxData[] = await getEventsForParallax(5);

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-20 px-4 flex-grow">
          {/* Removed title and no events message */}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <ParallaxGallery events={events} />
      </main>
    </div>
  );
}

export default async function EventsPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <EventsContent />
    </Suspense>
  );
}
