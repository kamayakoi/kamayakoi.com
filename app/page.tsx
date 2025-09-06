import type { Metadata } from "next";
import Header from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import BackgroundVideo from "@/components/landing/BackgroundVideo";
import { EventShowcase } from "@/components/landing/event-showcase";
import { FeaturedArticles } from "@/components/landing/featured-articles";
import { MediaShowcase } from "@/components/landing/media-showcase";
import { Footer } from "@/components/landing/footer";
import { getHomepageContent, getLatestEvents, getLatestBlogPosts, getMedia } from "@/lib/sanity/queries";

// Use the general site metadata for the home page
export const metadata: Metadata = {
  title: "Kamayakoi",
  description: "Abidjan Techno Gang",
};

export default async function Home() {
  // Fetch all homepage content server-side
  const [homepageData, events, articles, media] = await Promise.all([
    getHomepageContent(),
    getLatestEvents(6),
    getLatestBlogPosts(6),
    getMedia(10)
  ]);

  // Extract video URLs from homepage data for BackgroundVideo component
  const videoUrls =
    homepageData?.heroContent
      ?.filter((item) => item.isActive && item.type === "video")
      ?.map((item) => {
        if (item.video?.asset?.url) return item.video.asset.url;
        if (item.videoUrl) return item.videoUrl;
        return null;
      })
      ?.filter((url): url is string => url !== null) || [];

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Header />
      {/* Use BackgroundVideo if we have videos, otherwise use HeroSection */}
      {videoUrls.length > 0 ? (
        <BackgroundVideo
          videoUrls={videoUrls}
          height="h-screen"
          className="relative"
        />
      ) : (
        <HeroSection
          sanityHeroItems={homepageData?.heroContent}
        />
      )}
      <EventShowcase events={events} />
      <FeaturedArticles articles={articles} />
      <MediaShowcase media={media} />
      <Footer />
    </div>
  );
}
