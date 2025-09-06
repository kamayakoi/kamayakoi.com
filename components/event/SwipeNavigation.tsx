"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SwipeNavigationProps {
    previousEvent: { slug: string | { current: string } } | null;
    nextEvent: { slug: string | { current: string } } | null;
}

export default function SwipeNavigation({
    previousEvent,
    nextEvent
}: SwipeNavigationProps) {
    const router = useRouter();
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const minSwipeDistance = 50;

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartX.current || !touchStartY.current) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchStartX.current - touchEndX;
            const deltaY = touchStartY.current - touchEndY;

            // Only trigger if horizontal swipe is greater than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Swipe left (next event)
                if (deltaX > minSwipeDistance && nextEvent) {
                    const slug = typeof nextEvent.slug === 'string' ? nextEvent.slug : nextEvent.slug.current;
                    router.push(`/events/${slug}`);
                }
                // Swipe right (previous event)
                else if (deltaX < -minSwipeDistance && previousEvent) {
                    const slug = typeof previousEvent.slug === 'string' ? previousEvent.slug : previousEvent.slug.current;
                    router.push(`/events/${slug}`);
                }
            }

            touchStartX.current = null;
            touchStartY.current = null;
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [router, nextEvent, previousEvent]);

    return null; // This component doesn't render anything
}
