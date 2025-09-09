"use client";

import { useTranslation } from "@/lib/contexts/TranslationContext";
import CheckoutButton, { CheckoutItemData } from "@/components/event/CheckoutButton";

interface CheckoutButtonWrapperProps {
    item: CheckoutItemData;
    eventDetails: {
        id: string;
        title: string;
        dateText?: string;
        timeText?: string;
        venueName?: string;
    };
    globallyTicketsOnSale: boolean;
}

export default function CheckoutButtonWrapper({
    item,
    eventDetails,
    globallyTicketsOnSale,
}: CheckoutButtonWrapperProps) {
    const { currentLanguage } = useTranslation();

    return (
        <CheckoutButton
            item={item}
            eventDetails={eventDetails}
            globallyTicketsOnSale={globallyTicketsOnSale}
            currentLanguage={currentLanguage}
        />
    );
}
