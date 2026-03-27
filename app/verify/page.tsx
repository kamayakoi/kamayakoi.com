import { Suspense } from 'react';
import { VerifyClient } from './verify-client';
import LoadingComponent from '@/components/ui/loader';

interface SearchParamsProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function VerifyTicketPage({
  searchParams,
}: SearchParamsProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<LoadingComponent />}>
      <VerifyClient key={params.id ?? 'no-id'} ticketId={params.id} />
    </Suspense>
  );
}
