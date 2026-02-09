import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllArtists, getHomepageContent } from '@/lib/sanity/queries';
import LoadingComponent from '@/components/ui/loader';
import ArtistsContentClient from '@/app/artists/artists-content-client';

export const metadata: Metadata = {
  title: 'Artists',
  description: 'Meet the talented artists and creators of Kamayakoi.',
};

async function ArtistsContent() {
  const [artists, homepageData] = await Promise.all([
    getAllArtists(),
    getHomepageContent(),
  ]);

  return (
    <ArtistsContentClient
      artists={artists}
      ticketsButtonLocation={homepageData?.ticketsButtonLocation}
      showBlogInNavigation={homepageData?.showBlogInNavigation}
      showArchivesInNavigation={homepageData?.showArchivesInNavigation}
    />
  );
}

export default async function ArtistsPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ArtistsContent />
    </Suspense>
  );
}
