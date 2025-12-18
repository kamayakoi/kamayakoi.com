import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoadingComponent from '@/components/ui/loader';

import { getAllBlogPosts } from '@/lib/sanity/queries';
import StoriesContentClient from './stories-content-client';

interface Story {
  _id: string;
  title: string;
  title_fr?: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  excerpt?: string;
  excerpt_fr?: string;
  mainImage?: {
    asset: {
      url: string;
      metadata?: {
        lqip?: string;
      };
    };
    alt?: string;
  };
  author?: {
    name: string;
  };
  categories?: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
    color?: string;
  }[];
}

export const metadata: Metadata = {
  title: 'Stories',
  description:
    'Discover inspiring stories, insights, and narratives from our community',
};

async function StoriesContent() {
  const allStories: Story[] = await getAllBlogPosts();

  return <StoriesContentClient allStories={allStories} />;
}

export default async function StoriesPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <StoriesContent />
    </Suspense>
  );
}
