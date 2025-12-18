import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getEventsForParallax } from '@/lib/sanity/queries';

export const metadata: Metadata = {
  title: 'RENDEZ-VOUS SAUVAGE',
  description:
    'Discover upcoming Kamayakoi events, shows, and performances. Experience unforgettable nights with our resident artists and special guests.',
};

export default async function EventsPage() {
  const events = await getEventsForParallax(5);

  if (events && events.length > 0) {
    // Redirect to the latest event (first in the array, assuming they're sorted by date)
    redirect(`/events/${events[0].slug}`);
  }

  // If no events, redirect to home or show a message
  redirect('/');
}
