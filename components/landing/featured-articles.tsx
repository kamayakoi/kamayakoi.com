"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
  _id: string;
  title: string;
  slug: string;
  color?: string;
}

interface FeaturedArticle {
  _id: string;
  title: string;
  title_fr?: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  excerpt: string;
  excerpt_fr?: string;
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
    _id: string;
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
    bio?: string;
  };
  categories?: Category[];
}

interface FeaturedArticlesProps {
  articles: FeaturedArticle[];
}

function ArticleCard({ article }: { article: FeaturedArticle }) {
  const { currentLanguage } = useTranslation();
  const mainImage = article.mainImage?.asset.url || "/placeholder.webp";
  const hasValidImage = mainImage && mainImage.trim() !== "";

  const title =
    currentLanguage === "fr" && article.title_fr
      ? article.title_fr
      : article.title;

  const excerpt =
    currentLanguage === "fr" && article.excerpt_fr
      ? article.excerpt_fr
      : article.excerpt;

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
          href={`/stories/${article.slug.current}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Read ${title}`}
          prefetch
        >
          {hasValidImage ? (
            <div className="aspect-square relative bg-muted overflow-hidden">
              <Image
                src={mainImage}
                alt={article.mainImage?.alt || title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                quality={100}
                placeholder={
                  article.mainImage?.asset.metadata?.lqip ? "blur" : undefined
                }
                blurDataURL={article.mainImage?.asset.metadata?.lqip}
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
        <Link href={`/stories/${article.slug.current}`} className="block">
          <h3 className="font-medium text-base leading-tight hover:text-primary transition-colors line-clamp-2 break-words overflow-wrap-anywhere">
            {title}
          </h3>
        </Link>

        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words overflow-wrap-anywhere">
            {excerpt}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {article.categories && article.categories.length > 0 && (
              <>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-sm ${getCategoryColor(article.categories[0].color).bg} ${getCategoryColor(article.categories[0].color).text}`}
                >
                  {article.categories[0]?.title || "Category"}
                </span>
                {article.author && <span className="mx-1">·</span>}
              </>
            )}
            {article.author && <span>{article.author.name}</span>}
          </div>
          <Link
            href={`/stories/${article.slug.current}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            {t(currentLanguage, "eventShowcase.articles.readMore")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  const { currentLanguage } = useTranslation();

  const hasArticles = articles && articles.length > 0;

  return (
    <section className="pt-0 md:pt-0 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-1 h-12 bg-white"></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {t(currentLanguage, "eventShowcase.articles.title")}
              <span className="text-white/60 mx-2 align-middle hidden md:inline">
                ·
              </span>
              <span className="text-white/70 font-normal text-xl md:text-2xl block md:inline-block transform -translate-y-0.25">
                {t(currentLanguage, "eventShowcase.articles.subtitle")}
              </span>
            </h2>
          </div>
        </div>

        {hasArticles ? (
          <>
            {/* Articles Grid with Horizontal Scroll */}
            <div
              className={`mb-12 ${articles.length > 4 ? "overflow-x-auto pb-4" : ""}`}
            >
              <div
                className={`grid gap-6 ${articles.length > 4 ? "grid-cols-1 md:grid-cols-4 lg:grid-cols-10" : "grid-cols-1 md:grid-cols-4"} ${articles.length > 4 ? "w-max" : ""}`}
              >
                {articles
                  .slice(0, Math.min(articles.length, 9))
                  .map((article: FeaturedArticle) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}

                {/* Show "View More" card as 10th card when exactly 10 articles, or when more than 10 */}
                {articles.length >= 10 && (
                  <Link
                    href="/stories"
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-sm border-border/40 bg-card p-0 mb-6 block"
                  >
                    <div className="relative rounded-t-sm overflow-hidden">
                      <div className="aspect-square relative bg-gradient-to-br from-teal-900/20 to-teal-800/20 flex items-center justify-center">
                        <div className="text-6xl text-teal-300/60 group-hover:text-teal-300/80 transition-colors duration-300">
                          +
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 pb-4 px-4 space-y-1">
                      <h3 className="font-medium text-base leading-tight text-center hover:text-primary transition-colors">
                        {t(currentLanguage, "eventShowcase.articles.viewAll")}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center leading-relaxed">
                        {articles.length > 10
                          ? currentLanguage === "fr"
                            ? `${articles.length - 9} article${articles.length - 9 > 1 ? "s" : ""} de plus`
                            : `${articles.length - 9} more article${articles.length - 9 > 1 ? "s" : ""}`
                          : currentLanguage === "fr"
                            ? "Tous les articles"
                            : "All articles"}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Coming Soon Message - using translations */
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm p-8 mb-20">
            <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
              {t(currentLanguage, "eventShowcase.articles.comingSoon.title")}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {t(
                currentLanguage,
                "eventShowcase.articles.comingSoon.description",
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
