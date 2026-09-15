import { Suspense } from 'react';
import { PaymentCancelClient } from '@/components/payment/payment-cancel-client';
import LoadingComponent from '@/components/ui/loader';
import { getHomepageContent } from '@/lib/sanity/queries';

interface SearchParamsProps {
  searchParams: Promise<{
    purchase_id?: string;
    purchase_ids?: string;
    flow?: string;
    event_slug?: string;
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
        purchaseId={params.purchase_id || params.purchase_ids}
        flow={params.flow}
        eventSlug={params.event_slug}
        ticketsButtonLocation={homepageData?.ticketsButtonLocation}
        showBlogInNavigation={homepageData?.showBlogInNavigation}
        showArchivesInNavigation={homepageData?.showArchivesInNavigation}
      />
    </Suspense>
  );
}
