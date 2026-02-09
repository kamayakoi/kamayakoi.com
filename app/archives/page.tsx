// Removed "use client"

// Keep only necessary imports for the page structure and metadata
import Header from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Metadata } from 'next';
import ArchivesClientComponent from './archives-client'; // Import the new client component
import { getHomepageContent } from '@/lib/sanity/queries';

// Metadata export remains here (this is now a Server Component)
export const metadata: Metadata = {
  title: 'Archives',
  description:
    'Explore our archives of events, performances, and behind-the-scenes moments.',
};

// This is now a simple Server Component
export default async function ArchivesPage() {
  // Removed state, effects, handlers, and complex rendering logic
  const homepageData = await getHomepageContent();

  // Render the page structure with the client component inside
  return (
    <>
      <Header
        ticketsButtonLocation={homepageData?.ticketsButtonLocation}
        showBlogInNavigation={homepageData?.showBlogInNavigation}
        showArchivesInNavigation={homepageData?.showArchivesInNavigation}
      />
      {/* Render the client component which handles fetching and display */}
      <ArchivesClientComponent />
      <Footer />
    </>
  );
}

// Removed original async function Archives and export default Archives
