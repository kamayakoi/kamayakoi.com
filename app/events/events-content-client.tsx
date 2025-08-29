"use client";

import { motion } from "framer-motion";
import Header from "@/components/landing/header";
import MiniAudioPlayer from "@/components/landing/mini-audio-player";
import { Footer } from "@/components/landing/footer";
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
                {/* Mini Audio Player */}
                <div className="fixed top-[13px] md:top-4 left-4 z-[60] pointer-events-auto">
                    <MiniAudioPlayer />
                </div>

                <Header />

                <main>
                    <div className="container mx-auto px-4 py-0 max-w-7xl">
                        {/* Hero Section */}
                        <div className="relative pt-24 md:pt-32 mb-12">
                            <motion.h1
                                className="text-4xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-6"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                Events
                            </motion.h1>
                            <motion.p
                                className="text-zinc-600 dark:text-zinc-200 text-base sm:text-lg md:text-xl leading-relaxed tracking-tight max-w-3xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Discover upcoming Kamayakoi events, shows, and performances.
                                Experience unforgettable nights with our resident artists and special guests.
                            </motion.p>
                        </div>

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
                                There are currently no upcoming events. Check back soon for the latest
                                Kamayakoi shows and performances!
                            </p>
                        </motion.div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mini Audio Player */}
            <div className="fixed top-[13px] md:top-4 left-4 z-[60] pointer-events-auto">
                <MiniAudioPlayer />
            </div>

            <Header />

            <main>
                <div className="container mx-auto px-4 py-0 max-w-7xl">
                    {/* Hero Section */}
                    <div className="relative pt-24 md:pt-32 mb-12">
                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            Events
                        </motion.h1>
                        <motion.p
                            className="text-zinc-600 dark:text-zinc-200 text-base sm:text-lg md:text-xl leading-relaxed tracking-tight max-w-3xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Discover upcoming Kamayakoi events, shows, and performances.
                            Experience unforgettable nights with our resident artists and special guests.
                        </motion.p>
                    </div>

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

            <Footer />
        </div>
    );
}
