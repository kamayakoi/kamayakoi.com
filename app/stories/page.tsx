import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingComponent from "@/components/ui/loader";

import { Story } from "@/components/blog/all-stories";
import { getAllBlogPosts, getFeaturedPost } from "@/lib/sanity/queries";
import StoriesContentClient from "./stories-content-client";

export const metadata: Metadata = {
  title: "Stories | Kamayakoi",
  description:
    "Discover inspiring stories, insights, and narratives from our community",
};




async function StoriesContent() {
  const allStories: Story[] = await getAllBlogPosts();
  const featuredStory = await getFeaturedPost();

  // Get other stories (excluding featured if it's in the list)
  const otherStories = featuredStory
    ? allStories.filter(story => story._id !== featuredStory._id)
    : allStories;

  // Get featured stories (first 3 from remaining stories)
  const featuredStories = otherStories.slice(0, 3);
  const remainingStories = otherStories.slice(3);

  return (
    <StoriesContentClient
      allStories={allStories}
      featuredStory={featuredStory}
      featuredStories={featuredStories}
      remainingStories={remainingStories}
    />
  );
}

export default async function StoriesPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <StoriesContent />
    </Suspense>
  );
}
