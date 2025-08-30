"use client";

import { motion } from "framer-motion";
import Header from "@/components/landing/header";
import ParallaxGallery from "@/components/ui/parallax";
import { type EventParallaxData } from "@/lib/sanity/queries";

interface EventsContentClientProps {
  events: EventParallaxData[];
}

export default function EventsContentClient({
  events,
}: EventsContentClientProps) {
  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main>
          <div className="container mx-auto px-4 py-0 max-w-7xl">
            <motion.div
              className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
                No Events Scheduled
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                There are currently no upcoming events. Check back soon for the
                latest Kamayakoi shows and performances!
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <div className="container mx-auto px-4 py-0 max-w-7xl">
          {/* Events Gallery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ParallaxGallery events={events} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
