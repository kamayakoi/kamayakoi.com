import type { Metadata } from 'next';
import { Suspense } from 'react';
import TermsClientPage from './terms-client';
import LoadingComponent from '@/components/ui/loader';
import { getHomepageContent } from '@/lib/sanity/queries';

export const metadata: Metadata = {
  title: 'Terms',
  description:
    "Understand the Terms and Conditions for engaging with Kamayakoi, Abidjan's pioneering alternative Hip-Hop & Electronic music collective and event organizer.",
};

export default async function Page() {
  const homepageData = await getHomepageContent();

  return (
    <Suspense fallback={<LoadingComponent />}>
      <TermsClientPage
        ticketsButtonLocation={homepageData?.ticketsButtonLocation}
        showBlogInNavigation={homepageData?.showBlogInNavigation}
        showArchivesInNavigation={homepageData?.showArchivesInNavigation}
      />
    </Suspense>
  );
}
