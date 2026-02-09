import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProducts, getHomepageContent } from '@/lib/sanity/queries';
import LoadingComponent from '@/components/ui/loader';
import MerchContentClient from './merch-content-client';

export const metadata: Metadata = {
  title: 'Merch',
  description:
    'Shop exclusive Kamayakoi merchandise, apparel, and collectibles. Support the movement with our unique designs and products.',
};

async function MerchContent() {
  const [products, homepageData] = await Promise.all([
    getAllProducts(),
    getHomepageContent(),
  ]);
  return (
    <MerchContentClient
      products={products || []}
      ticketsButtonLocation={homepageData?.ticketsButtonLocation}
      showBlogInNavigation={homepageData?.showBlogInNavigation}
      showArchivesInNavigation={homepageData?.showArchivesInNavigation}
    />
  );
}

export default async function MerchPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <MerchContent />
    </Suspense>
  );
}
