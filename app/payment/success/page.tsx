import { Suspense } from "react";
import { PaymentSuccessClient } from "./payment-success-client";
import LoadingComponent from "@/components/ui/loader";

interface SearchParamsProps {
  searchParams: Promise<{
    purchase_id?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: SearchParamsProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<LoadingComponent />}>
      <PaymentSuccessClient purchaseId={params.purchase_id} />
    </Suspense>
  );
}
