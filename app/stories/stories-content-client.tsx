"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  color?: string;
}

interface Story {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  excerpt?: string;
  mainImage?: {
    asset: {
      url: string;
      metadata?: {
        lqip?: string;
      };
    };
    alt?: string;
  };
  author?: {
    name: string;
  };
  categories?: Category[];
}

interface StoriesContentClientProps {
  allStories: Story[];
}

function StoryCard({ story }: { story: Story }) {
  const mainImage = story.mainImage?.asset.url || "/placeholder.webp";
  const hasValidImage = mainImage && mainImage.trim() !== "";

  // Category color system
  const getCategoryColor = (color?: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      red: { bg: "bg-red-600", text: "text-white" },
      amber: { bg: "bg-amber-600", text: "text-white" },
      yellow: { bg: "bg-yellow-600", text: "text-white" },
      cyan: { bg: "bg-cyan-600", text: "text-white" },
      teal: { bg: "bg-teal-600", text: "text-white" },
      sky: { bg: "bg-sky-600", text: "text-white" },
      purple: { bg: "bg-purple-600", text: "text-white" },
      pink: { bg: "bg-pink-600", text: "text-white" },
      indigo: { bg: "bg-indigo-600", text: "text-white" },
      orange: { bg: "bg-orange-600", text: "text-white" },
      emerald: { bg: "bg-emerald-600", text: "text-white" },
      green: { bg: "bg-green-600", text: "text-white" },
      blue: { bg: "bg-blue-600", text: "text-white" },
    };
    return colorMap[color || "teal"] || colorMap.teal;
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-sm border-border/40 bg-card p-0 mb-6">
      <div className="relative rounded-t-sm overflow-hidden">
        <Link
          href={`/stories/${story.slug.current}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Read ${story.title}`}
          prefetch
        >
          {hasValidImage ? (
            <div className="aspect-square relative bg-muted overflow-hidden">
              <Image
                src={mainImage}
                alt={story.mainImage?.alt || story.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                quality={100}
                placeholder={
                  story.mainImage?.asset.metadata?.lqip ? "blur" : undefined
                }
                blurDataURL={story.mainImage?.asset.metadata?.lqip}
              />
            </div>
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
        </Link>
      </div>

      <CardContent className="pt-1 pb-4 px-4 space-y-1">
        <Link href={`/stories/${story.slug.current}`} className="block">
          <h3 className="font-medium text-base leading-tight hover:text-primary transition-colors line-clamp-2 break-words overflow-wrap-anywhere">
            {story.title}
          </h3>
        </Link>

        {story.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words overflow-wrap-anywhere">
            {story.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {story.categories && story.categories.length > 0 && (
              <>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-sm ${getCategoryColor(story.categories[0].color).bg} ${getCategoryColor(story.categories[0].color).text}`}
                >
                  {story.categories[0].title}
                </span>
                {story.author && <span className="mx-1">·</span>}
              </>
            )}
            {story.author && <span>{story.author.name}</span>}
          </div>
          <Link
            href={`/stories/${story.slug.current}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            Read
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StoriesContentClient({
  allStories,
}: StoriesContentClientProps) {
  const { currentLanguage } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main>
        <div className="container mx-auto px-4 py-0 max-w-7xl">
          {/* Hero Section */}
          <div className="relative pt-24 md:pt-32 mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-white mb-6">
              Stories
            </h1>
            <p className="text-zinc-200 text-base sm:text-lg md:text-xl leading-relaxed tracking-tight max-w-3xl">
              Discover inspiring stories, insights, and narratives from our
              community. Each story captures the essence of Kamayakoi&apos;s
              journey and the people who make it special.
            </p>
          </div>

          {/* Stories Grid */}
          {allStories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {allStories.slice(0, 8).map((story: Story) => (
                <StoryCard key={story._id} story={story} />
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-white">
                {t(currentLanguage, "storyPage.noStories.title")}
              </h2>
              <p className="text-zinc-400 mb-6">
                {t(currentLanguage, "storyPage.noStories.description")}
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <div className="mt-12"></div>
      <Footer />
    </div>
  );
}
