import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/landing/header";
import MiniAudioPlayer from "@/components/landing/mini-audio-player";
import LoadingComponent from "@/components/ui/loader";
import FeaturedStories from "@/components/blog/featured-stories";
import AllStories from "@/components/blog/all-stories";
import { getAllBlogPosts } from "@/lib/sanity/queries";
import { getMockStories } from "@/lib/mock-stories";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
    title: "Stories | Kamayakoi",
    description: "Discover inspiring stories, insights, and narratives from our community",
};

async function StoriesContent() {
    let allStories = await getAllBlogPosts();

    // If no stories from Sanity, use mock data
    if (!allStories || allStories.length === 0) {
        allStories = getMockStories();
    }

    // Get featured stories (first 4) and all other stories
    const featuredStories = allStories.slice(0, 4);
    const remainingStories = allStories.slice(4);

    return (
        <div className="min-h-screen">
            {/* Mini Audio Player */}
            <div className="fixed top-4 left-4 z-[60]">
                <MiniAudioPlayer />
            </div>

            {/* Header */}
            <Header />

            {/* Main Content */}
            <main>
                <FeaturedStories
                    stories={featuredStories}
                />
                <AllStories
                    stories={remainingStories}
                    heading="All Stories"
                />
            </main>
            <Footer />
        </div>
    );
}

export default async function StoriesPage() {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <StoriesContent />
        </Suspense>
    );
}
