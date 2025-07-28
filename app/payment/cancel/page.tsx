import { Suspense } from "react";
import { PaymentCancelClient } from "./payment-cancel-client";
import LoadingComponent from "@/components/ui/loader";

interface SearchParamsProps {
  searchParams: Promise<{
    purchase_id?: string;
  }>;
}

export default async function PaymentCancelPage({
  searchParams,
}: SearchParamsProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<LoadingComponent />}>
      <PaymentCancelClient purchaseId={params.purchase_id} />
    </Suspense>
  );
}
