import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoadingComponent from '@/components/ui/loader';

import { getAllBlogPosts, getHomepageContent } from '@/lib/sanity/queries';
import StoriesContentClient from './stories-content-client';

export const metadata: Metadata = {
  title: 'Stories',
  description:
    'Discover inspiring stories, insights, and narratives from our community',
};

async function StoriesContent() {
  const [allStories, homepageData] = await Promise.all([
    getAllBlogPosts(),
    getHomepageContent(),
  ]);

  return (
    <StoriesContentClient
      allStories={allStories}
      ticketsButtonLocation={homepageData?.ticketsButtonLocation}
      showBlogInNavigation={homepageData?.showBlogInNavigation}
      showArchivesInNavigation={homepageData?.showArchivesInNavigation}
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
