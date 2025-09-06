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
  // Fetch homepage content from Sanity
  const homepageData = await getHomepageContent();

  // Transform featured articles to component format
  const transformedArticles =
    homepageData?.featuredArticles?.map((article) => ({
      _id: article._id,
      title: article.title,
      title_fr: article.title_fr,
      slug: article.slug?.current,
      publishedAt: article.publishedAt,
      excerpt: article.excerpt,
      excerpt_fr: article.excerpt_fr,
      image: article.image?.asset?.url || "/placeholder.webp",
      author: {
        _id: article.author?._id,
        name: article.author?.name,
        image: article.author?.image?.asset?.url || "/placeholder.webp",
        bio: article.author?.bio,
      },
    })) || [];

  // Transform featured media to component format
  const transformedMedia =
    homepageData?.featuredMedia?.map((media) => ({
      _id: media._id,
      title: media.title,
      type: media.type,
      url: media.url,
      description: media.description,
      thumbnail: media.thumbnail?.asset?.url || "/placeholder.webp",
      duration: media.duration,
      artist: media.artist,
      genre: media.genre,
      isFeatured: media.isFeatured,
      tags: media.tags,
      publishedAt: media.publishedAt,
    })) || [];

  // Transform showcase events to component format
  const transformedEvents =
    homepageData?.showcaseEvents?.map((event) => ({
      _id: event._id,
      title: event.title,
      slug: event.slug?.current,
      date: event.date,
      time: event.time,
      location: event.location,
      flyer: event.flyer?.asset?.url || "/placeholder.webp",
      ticketsAvailable: event.ticketsAvailable,
      description: event.description,
    })) || [];

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
          highlightedContent={homepageData?.highlightedContentProcessed}
        />
      )}
      <EventShowcase sanityEvents={transformedEvents} />
      <FeaturedArticles articles={transformedArticles} />
      <MediaShowcase media={transformedMedia} />
      <Footer />
    </div>
  );
}
