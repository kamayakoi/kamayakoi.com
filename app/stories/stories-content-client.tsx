"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/landing/header";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

import AllStories, { Story, Category } from "@/components/blog/all-stories";
import { Footer } from "@/components/landing/footer";

interface StoriesContentClientProps {
  allStories: Story[];
  featuredStory: Story | null;
  featuredStories: Story[];
  remainingStories: Story[];
}

export default function StoriesContentClient({
  allStories,
  featuredStory,
  featuredStories,
  remainingStories,
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

          {/* Stories Section */}
          {allStories.length > 0 ? (
            <>
              {/* Featured Story */}
              {featuredStory && (
                <section className="py-8 md:py-8 -mb-16">
                  <div className="grid grid-cols-1 gap-8">
                    {/* Main Featured Story */}
                    <div className="w-full">
                      <article className="group cursor-pointer bg-[#1a1a1a] rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-zinc-800">
                        <div className="relative h-96 md:h-[36rem] overflow-hidden">
                          <Image
                            src={
                              featuredStory.mainImage?.asset.url ||
                              "/placeholder.webp"
                            }
                            alt={
                              featuredStory.mainImage?.alt ||
                              featuredStory.title
                            }
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            placeholder={
                              featuredStory.mainImage?.asset.metadata?.lqip
                                ? "blur"
                                : undefined
                            }
                            blurDataURL={
                              featuredStory.mainImage?.asset.metadata?.lqip
                            }
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-teal-600 text-teal-100 text-sm font-medium rounded-sm">
                              Featured
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-2xl md:text-3xl font-semibold text-white group-hover:text-primary transition-colors mb-2">
                                {featuredStory.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                {featuredStory.author && (
                                  <span>{featuredStory.author.name}</span>
                                )}
                                {featuredStory.author && (
                                  <span className="mx-1">·</span>
                                )}
                                <span>
                                  {new Date(
                                    featuredStory.publishedAt,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Link
                              href={`/stories/${featuredStory.slug}`}
                              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors -translate-y-1 group-hover:translate-x-1 transform duration-300 shrink-0"
                            >
                              <span>→</span>
                            </Link>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>
                </section>
              )}

              {/* Featured Stories */}
              {featuredStories.length > 0 && (
                <section className="py-16 md:py-20 -mb-24">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Other Featured Stories */}
                    {featuredStories.slice(0, 3).map((story: Story) => (
                      <article
                        key={story._id}
                        className="group cursor-pointer bg-[#1a1a1a] rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-zinc-800"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={
                              story.mainImage?.asset.url || "/placeholder.webp"
                            }
                            alt={story.mainImage?.alt || story.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            placeholder={
                              story.mainImage?.asset.metadata?.lqip
                                ? "blur"
                                : undefined
                            }
                            blurDataURL={story.mainImage?.asset.metadata?.lqip}
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {story.categories
                              ?.slice(0, 2)
                              .map((category: Category, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-zinc-800 text-zinc-400 rounded"
                                >
                                  {category.title}
                                </span>
                              ))}
                          </div>

                          <h4 className="font-semibold mb-2 text-white group-hover:text-primary transition-colors line-clamp-2">
                            {story.title}
                          </h4>

                          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                            {story.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              {story.author && <span>{story.author.name}</span>}
                              {story.author && <span className="mx-1">·</span>}
                              <span>
                                {new Date(story.publishedAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            </div>
                            <Link
                              href={`/stories/${story.slug}`}
                              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                            >
                              Read
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* All Stories */}
              {remainingStories.length > 0 && (
                <AllStories stories={remainingStories} heading="More Stories" />
              )}
            </>
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
