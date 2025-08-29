"use client";

import { motion } from "framer-motion";
import Header from "@/components/landing/header";
import MiniAudioPlayer from "@/components/landing/mini-audio-player";
import { Footer } from "@/components/landing/footer";
import { ProductListContent } from "../../components/merch/product-list-content";
import { ProductGrid } from "../../components/merch/product-grid";
import { ProductCardSkeleton } from "../../components/merch/product-card-skeleton";
import { Suspense } from "react";

interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string } | string;
  productId?: string;
  mainImage?: string;
  price: number;
  stock?: number;
  description?: string;
  images?: Array<{
    url: string;
    metadata?: {
      dimensions?: {
        width: number;
        height: number;
      };
      lqip?: string;
    };
  }>;
}

interface MerchContentClientProps {
  products: SanityProduct[];
}

export default function MerchContentClient({
  products,
}: MerchContentClientProps) {
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
              Merch
            </motion.h1>
            <motion.p
              className="text-zinc-600 dark:text-zinc-200 text-base sm:text-lg md:text-xl leading-relaxed tracking-tight max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Shop exclusive Kamayakoi merchandise, apparel, and collectibles.
              Support the movement with our unique designs and products crafted
              for the wild at heart.
            </motion.p>
          </div>

          {/* Products Section */}
          {products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Suspense
                fallback={
                  <>
                    <div className="grid grid-cols-3 items-center mb-8 w-full px-4 md:px-6 max-md:hidden">
                      <div className="ml-1">
                        <span className="text-sm text-muted-foreground">
                          Shop
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Loading...
                      </p>
                      <div></div>
                    </div>
                    <ProductGrid>
                      {Array.from({ length: 12 }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                      ))}
                    </ProductGrid>
                  </>
                }
              >
                <ProductListContent products={products} />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
                Merch coming soon
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                We&apos;re working on bringing you amazing merchandise and
                collectibles. Stay tuned for exclusive Kamayakoi gear!
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
