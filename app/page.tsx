import type { Metadata } from 'next';
import Header from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { EventShowcase } from '@/components/landing/event-showcase';
import { FeaturedArticles } from '@/components/landing/featured-articles';
import { MediaShowcase } from '@/components/landing/media-showcase';
import { Footer } from '@/components/landing/footer';
import {
  getHomepageContent,
  getLatestEvents,
  getLatestBlogPosts,
  getMedia,
} from '@/lib/sanity/queries';

// Use the general site metadata for the home page
export const metadata: Metadata = {
  title: 'Kamayakoi',
  description: 'Abidjan Techno Gang',
};

export default async function Home() {
  // Fetch all homepage content server-side
  const [homepageData, events, articles, media] = await Promise.all([
    getHomepageContent(),
    getLatestEvents(36),
    getLatestBlogPosts(6),
    getMedia(10),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Header ticketsButtonLocation={homepageData?.ticketsButtonLocation} />
      {/* Use HeroSection with combined videos and featured events */}
      <HeroSection
        sanityHeroItems={homepageData?.heroContent}
        featuredEvents={homepageData?.featuredEvents}
        ticketsButtonLocation={homepageData?.ticketsButtonLocation}
      />
      <EventShowcase events={events} />
      <MediaShowcase media={media} />
      <FeaturedArticles articles={articles} />
      <Footer />
    </div>
  );
}
