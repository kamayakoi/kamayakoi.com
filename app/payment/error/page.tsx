import { Suspense } from 'react';
import { PaymentCancelClient } from './payment-cancel-client';
import LoadingComponent from '@/components/ui/loader';
import { getHomepageContent } from '@/lib/sanity/queries';

interface SearchParamsProps {
  searchParams: Promise<{
    purchase_id?: string;
  }>;
}

export default async function PaymentCancelPage({
  searchParams,
}: SearchParamsProps) {
  const [params, homepageData] = await Promise.all([
    searchParams,
    getHomepageContent(),
  ]);

  return (
    <Suspense fallback={<LoadingComponent />}>
      <PaymentCancelClient
        purchaseId={params.purchase_id}
        ticketsButtonLocation={homepageData?.ticketsButtonLocation}
        showBlogInNavigation={homepageData?.showBlogInNavigation}
        showArchivesInNavigation={homepageData?.showArchivesInNavigation}
      />
    </Suspense>
  );
}
