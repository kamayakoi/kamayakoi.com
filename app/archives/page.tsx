import Header from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Metadata } from 'next';
import ArchivesClientComponent from './archives-client';
import { getArchiveImages, getHomepageContent } from '@/lib/sanity/queries';
import { mapArchiveImagesForClient } from '@/lib/utils/archive-images';

// Metadata export remains here (this is now a Server Component)
export const metadata: Metadata = {
  title: 'Archives',
  description:
    'Explore our archives of events, performances, and behind-the-scenes moments.',
};

export default async function ArchivesPage() {
  const [homepageData, archiveImages] = await Promise.all([
    getHomepageContent(),
    getArchiveImages(),
  ]);
  const images = mapArchiveImagesForClient(archiveImages);

  return (
    <>
      <Header
        ticketsButtonLocation={homepageData?.ticketsButtonLocation}
        showBlogInNavigation={homepageData?.showBlogInNavigation}
        showArchivesInNavigation={homepageData?.showArchivesInNavigation}
      />
      <ArchivesClientComponent initialImages={images} />
      <Footer />
    </>
  );
}
