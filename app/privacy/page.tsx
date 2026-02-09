import type { Metadata } from 'next';
import { Suspense } from 'react';
import PrivacyClientPage from './privacy-client';
import LoadingComponent from '@/components/ui/loader';
import { getHomepageContent } from '@/lib/sanity/queries';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Kamayakoi protects and manages your personal information in accordance with our privacy practices.',
};

export default async function Page() {
  const homepageData = await getHomepageContent();

  return (
    <Suspense fallback={<LoadingComponent />}>
      <PrivacyClientPage
        ticketsButtonLocation={homepageData?.ticketsButtonLocation}
        showBlogInNavigation={homepageData?.showBlogInNavigation}
        showArchivesInNavigation={homepageData?.showArchivesInNavigation}
      />
    </Suspense>
  );
}
