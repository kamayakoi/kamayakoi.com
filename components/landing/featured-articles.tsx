"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

interface FeaturedArticle {
  _id: string;
  title: string;
  title_fr?: string;
  slug: string;
  publishedAt: string;
  excerpt: string;
  excerpt_fr?: string;
  image: string;
  author: {
    _id: string;
    name: string;
    image?: string;
    bio?: string;
  };
}

interface FeaturedArticlesProps {
  articles: FeaturedArticle[];
}

export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  const { currentLanguage } = useTranslation();
  const hasArticles = articles && articles.length > 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      currentLanguage === "fr" ? "fr-FR" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-1 h-12 bg-white"></div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              {currentLanguage === "fr" ? "Articles" : "Articles"}
            </h2>
            <p className="text-white/70 text-lg">
              {currentLanguage === "fr"
                ? "Découvrez les dernières actus et insights"
                : "Discover the latest news and insights"}
            </p>
          </div>
        </div>

        {hasArticles ? (
          <>
            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => {
                const title =
                  currentLanguage === "fr" && article.title_fr
                    ? article.title_fr
                    : article.title;
                const excerpt =
                  currentLanguage === "fr" && article.excerpt_fr
                    ? article.excerpt_fr
                    : article.excerpt;

                return (
                  <article
                    key={article._id}
                    className="group bg-black/20 backdrop-blur-sm rounded-sm overflow-hidden hover:bg-black/30 transition-all duration-300"
                  >
                    <Link href={`/stories/${article.slug}`} className="block">
                      {/* Article Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={article.image}
                          alt={title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>

                      {/* Article Content */}
                      <div className="p-6">
                        {/* Meta Information */}
                        <div className="flex items-center gap-4 mb-3 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                          {article.author && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{article.author.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-white/90 transition-colors">
                          {title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                          {excerpt}
                        </p>

                        {/* Read More */}
                        <div className="mt-4 flex items-center text-white font-medium text-sm group-hover:text-white/80 transition-colors">
                          {currentLanguage === "fr"
                            ? "Lire la suite"
                            : "Read More"}
                          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>

            {/* View All Articles Button */}
            <div className="text-center mt-12">
              <Link
                href="/stories"
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-sm transition-all duration-300 backdrop-blur-sm"
              >
                {currentLanguage === "fr"
                  ? "Voir Tous les Articles"
                  : "View All Articles"}
                <span className="ml-2">→</span>
              </Link>
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
