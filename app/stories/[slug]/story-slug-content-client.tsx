'use client';

import Header from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { portableTextRenderers } from '@/components/blog/portable-text-renderers';
import { BackButton } from './back-button.tsx';
import { t } from '@/lib/i18n/translations';
import { useTranslation } from '@/lib/contexts/TranslationContext';

type PortableTextContent = Array<{
  _type: string;
  children?: Array<{
    _type: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    [key: string]: unknown;
  }>;
}>;

export interface StoryPost {
  _id: string;
  title: string;
  title_fr?: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  excerpt?: string;
  excerpt_fr?: string;
  body?: PortableTextContent;
  body_fr?: PortableTextContent;
  mainImage?: {
    asset: {
      url: string;
      metadata?: {
        lqip?: string;
      };
    };
    alt?: string;
    caption?: string;
  };
  author?: {
    _id: string;
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
    role?: string;
    bio?: string;
  };
  categories?: Array<{
    _id: string;
    title: string;
    color?: string;
  }>;
}

interface StorySlugContentClientProps {
  post: StoryPost;
  ticketsButtonLocation?: 'header' | 'hero';
  showBlogInNavigation?: boolean;
  showArchivesInNavigation?: boolean;
}

export default function StorySlugContentClient({
  post,
  ticketsButtonLocation,
  showBlogInNavigation,
  showArchivesInNavigation,
}: StorySlugContentClientProps) {
  const { currentLanguage } = useTranslation();

  const title =
    currentLanguage === 'fr' && post.title_fr && post.title_fr.trim() !== ''
      ? post.title_fr
      : post.title;
  const excerpt =
    currentLanguage === 'fr' && post.excerpt_fr && post.excerpt_fr.trim() !== ''
      ? post.excerpt_fr
      : post.excerpt;
  const body =
    currentLanguage === 'fr' && post.body_fr && post.body_fr.length > 0
      ? post.body_fr
      : post.body;

  return (
    <div className="min-h-screen">
      <Header
        ticketsButtonLocation={ticketsButtonLocation}
        showBlogInNavigation={showBlogInNavigation}
        showArchivesInNavigation={showArchivesInNavigation}
      />

      <main>
        <div className="container mx-auto px-4 py-0 max-w-7xl">
          <div className="mb-8 pt-24 md:pt-32">
            <div className="flex flex-col md:flex-row md:items-start mb-6">
              <div className="md:w-[175px] shrink-0 mb-6 md:mb-0 flex flex-col gap-4">
                <BackButton className="self-center" />
              </div>
              <div className="flex-1 max-w-2xl md:max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white leading-tight mb-4 break-words overflow-wrap-anywhere">
                  {title}
                </h1>
                {excerpt && (
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed break-words overflow-wrap-anywhere">
                    {excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>

          <article className="max-w-3xl sm:max-w-4xl mx-auto pb-10">
            <header className="mb-6">
              <div className="flex flex-wrap items-center text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                {post.author && (
                  <div className="flex items-center mb-2">
                    {post.author.image && (
                      <Image
                        src={
                          post.author.image?.asset?.url || '/placeholder.webp'
                        }
                        alt={post.author.name}
                        width={48}
                        height={48}
                        className="rounded-sm mr-3 object-cover"
                        style={{ objectFit: 'fill' }}
                      />
                    )}
                    <span className="mr-2">·</span>
                    <span>{post.author.name}</span>
                    {post.author.role && (
                      <span className="text-zinc-500 dark:text-zinc-400 ml-1">
                        ({post.author.role})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {post.mainImage && (
                <div className="rounded-sm overflow-hidden mb-6 shadow-md">
                  <div className="aspect-[16/9] md:aspect-[16/9] relative">
                    <Image
                      src={post.mainImage?.asset?.url || '/placeholder.webp'}
                      alt={post.mainImage.alt || title}
                      fill
                      priority
                      className="object-cover"
                      placeholder={
                        post.mainImage.asset.metadata?.lqip ? 'blur' : undefined
                      }
                      blurDataURL={post.mainImage.asset.metadata?.lqip}
                    />
                  </div>
                  {post.mainImage.caption && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 italic px-2 md:text-right text-right">
                      {post.mainImage.caption}
                    </div>
                  )}
                </div>
              )}
            </header>

            <div className="prose prose-zinc dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h1:font-semibold prose-h1:mb-6 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-normal prose-h3:mt-6 prose-h3:mb-3 prose-h4:text-lg prose-h4:font-normal prose-h4:mt-4 prose-h4:mb-2 prose-p:text-base prose-p:leading-relaxed prose-p:my-4 prose-ul:my-4 prose-ul:list-disc prose-ul:pl-5 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-2 prose-li:pl-1 prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-300 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-sm prose-img:shadow-md prose-img:max-w-full prose-img:mx-auto prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-white prose-em:italic prose-code:bg-zinc-100 prose-code:text-zinc-800 dark:prose-code:bg-zinc-800 dark:prose-code:text-zinc-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800 prose-pre:p-4 prose-pre:rounded-sm prose-pre:overflow-x-auto max-w-none mx-auto px-0 break-words overflow-wrap-anywhere">
              {body ? (
                <PortableText value={body} components={portableTextRenderers} />
              ) : excerpt ? (
                <div className="space-y-6">
                  <p className="text-zinc-800 dark:text-zinc-300 leading-relaxed text-lg break-words overflow-wrap-anywhere">
                    {excerpt}
                  </p>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed break-words overflow-wrap-anywhere">
                    {t(currentLanguage, 'storyPage.placeholderContent.excerpt')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed break-words overflow-wrap-anywhere">
                    {t(
                      currentLanguage,
                      'storyPage.placeholderContent.fallback'
                    )}
                  </p>
                </div>
              )}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
