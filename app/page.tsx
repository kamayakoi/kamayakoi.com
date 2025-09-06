import type { Metadata } from "next";
import Header from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import BackgroundVideo from "@/components/landing/BackgroundVideo";
import { EventShowcase } from "@/components/landing/event-showcase";
import { FeaturedArticles } from "@/components/landing/featured-articles";
import { MediaShowcase } from "@/components/landing/media-showcase";
import { Footer } from "@/components/landing/footer";
import { getHomepageContent } from "@/lib/sanity/queries";

// Use the general site metadata for the home page
export const metadata: Metadata = {
  title: "Kamayakoi",
  description: "Rendez-vous sauvage pour électrons libres.",
};

export default async function Home() {
  // Fetch homepage content from Sanity for hero section
  const homepageData = await getHomepageContent();

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
      <EventShowcase limit={6} />
      <FeaturedArticles limit={6} />
      <MediaShowcase limit={10} />
      <Footer />
    </div>
  );
}
