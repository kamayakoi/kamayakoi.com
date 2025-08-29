"use client";

import { motion } from "framer-motion";
import { type ArtistData } from "@/lib/sanity/queries";
import Header from "@/components/landing/header";
import MiniAudioPlayer from "@/components/landing/mini-audio-player";
import { Footer } from "@/components/landing/footer";
import ArtistCard from "@/components/ui/artist-card";

interface ArtistsContentClientProps {
  artists: ArtistData[];
}

export default function ArtistsContentClient({
  artists,
}: ArtistsContentClientProps) {
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
              Artists
            </motion.h1>
            <motion.p
              className="text-zinc-600 dark:text-zinc-200 text-base sm:text-lg md:text-xl leading-relaxed tracking-tight max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Meet the talented artists, DJs, and creators who bring Kamayakoi
              to life. From resident artists to guest performers, discover the
              creative minds behind our unique sound and vision.
            </motion.p>
          </div>

          {/* Artists Grid */}
          {artists.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 gap-2 md:gap-3 lg:gap-4 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {artists.map((artist, index) => (
                <motion.div
                  key={artist._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <ArtistCard artist={artist} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
                Artists Coming Soon
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                We&apos;re working on bringing you amazing artists and creators.
                Stay tuned!
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
