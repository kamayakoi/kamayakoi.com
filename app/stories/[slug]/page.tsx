import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlogPostBySlug, getHomepageContent } from '@/lib/sanity/queries';
import StoryPageSkeleton from './story-page-skeleton';
import StorySlugContentClient from './story-slug-content-client';

interface PageProps {
  params: Promise<{ slug: string; locale?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Story not found' };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}

export default function StoryPage({ params }: PageProps) {
  return (
    <Suspense fallback={<StoryPageSkeleton />}>
      <StoryContent params={params} />
    </Suspense>
  );
}

async function StoryContent({ params }: PageProps) {
  const { slug } = await params;
  const [post, homepageData] = await Promise.all([
    getBlogPostBySlug(slug),
    getHomepageContent(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <StorySlugContentClient
      post={post}
      ticketsButtonLocation={homepageData?.ticketsButtonLocation}
      showBlogInNavigation={homepageData?.showBlogInNavigation}
      showArchivesInNavigation={homepageData?.showArchivesInNavigation}
    />
  );
}
