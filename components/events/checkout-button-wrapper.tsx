'use client';

import { useTranslation } from '@/lib/contexts/TranslationContext';
import CheckoutButton, {
  CheckoutItemData,
} from '@/components/events/checkout-button';

interface CheckoutButtonWrapperProps {
  item: CheckoutItemData;
  eventDetails: {
    id: string;
    title: string;
    slug?: string;
    dateText?: string;
    timeText?: string;
    venueName?: string;
  };
  globallyTicketsOnSale: boolean;
  compact?: boolean;
}

export default function CheckoutButtonWrapper({
  item,
  eventDetails,
  globallyTicketsOnSale,
  compact = false,
}: CheckoutButtonWrapperProps) {
  const { currentLanguage } = useTranslation();

  return (
    <CheckoutButton
      item={item}
      eventDetails={eventDetails}
      globallyTicketsOnSale={globallyTicketsOnSale}
      currentLanguage={currentLanguage}
      compact={compact}
    />
  );
}
