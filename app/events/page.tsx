import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getEventsForParallax,
  type EventParallaxData,
} from "@/lib/sanity/queries";
import LoadingComponent from "@/components/ui/loader";
import EventsContentClient from "@/app/events/events-content-client";

export const metadata: Metadata = {
  title: "Rendez-Vous Sauvage | Kamayakoi",
  description:
    "Discover upcoming Kamayakoi events, shows, and performances. Experience unforgettable nights with our resident artists and special guests.",
};

async function EventsContent() {
  const events: EventParallaxData[] = await getEventsForParallax(5);

  return <EventsContentClient events={events} />;
}

export default async function EventsPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <EventsContent />
    </Suspense>
  );
}
