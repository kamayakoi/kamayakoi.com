'use client';

import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { t } from '@/lib/i18n/translations';
import { ZoomImage } from './zoom-image';
import type { ArchiveImage } from '@/lib/utils/archive-images';

export type { ArchiveImage };

function useColumnCount() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const mq = (n: number) => window.matchMedia(`(min-width: ${n}px)`).matches;
    const update = () => {
      if (mq(1280)) setCols(4);
      else if (mq(1024)) setCols(3);
      else if (mq(640)) setCols(2);
      else setCols(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cols;
}

function SectionArchives({
  sectionTitle,
  sectionImages,
  columnCount,
  toSectionId,
  setZoomedState,
}: {
  sectionTitle: string;
  sectionImages: ArchiveImage[];
  columnCount: number;
  toSectionId: (title: string) => string;
  setZoomedState: (state: {
    sectionTitle: string;
    sectionImages: ArchiveImage[];
    sectionIndex: number;
  }) => void;
}) {
  const columns = useMemo(() => {
    const cols: ArchiveImage[][] = Array.from(
      { length: columnCount },
      () => []
    );
    sectionImages.forEach((img, i) => cols[i % columnCount].push(img));
    return cols;
  }, [sectionImages, columnCount]);

  return (
    <section id={toSectionId(sectionTitle)} className="mb-16 scroll-mt-24">
      <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-8 text-left capitalize">
        {sectionTitle}
      </h2>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col min-w-0">
            {col.map((img, i) => {
              const globalIndex = colIndex + i * columnCount;
              return (
                <ArchiveItem
                  key={`${sectionTitle}-${img.id}-${globalIndex}`}
                  img={img}
                  sectionTitle={sectionTitle}
                  tags={img.tags}
                  onClick={() =>
                    setZoomedState({
                      sectionTitle,
                      sectionImages,
                      sectionIndex: globalIndex,
                    })
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function ArchiveItem({
  img,
  sectionTitle,
  onClick,
  tags,
}: {
  img: ArchiveImage;
  sectionTitle: string;
  onClick: () => void;
  tags?: string[];
}) {
  const numericWidth = parseInt(img.width, 10);
  const numericHeight = parseInt(img.height, 10);
  const hasDimensions = !isNaN(numericWidth) && !isNaN(numericHeight);
  const aspectStyle = hasDimensions
    ? { aspectRatio: `${numericWidth} / ${numericHeight}` }
    : undefined;

  return (
    <figure
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        relative overflow-hidden rounded-sm bg-muted mb-2 cursor-zoom-in
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
        after:content after:pointer-events-none after:absolute after:inset-0 after:rounded-sm after:shadow-highlight
        ${!hasDimensions ? 'aspect-square' : ''}
      `}
      style={aspectStyle}
      aria-label={`Archives photo - ${sectionTitle}`}
    >
      <Image
        src={img.url}
        alt={`Archives photo - ${sectionTitle}`}
        fill
        className="object-cover brightness-90 transition will-change-auto hover:brightness-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      />
      {tags && tags.length > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm shadow-lg z-10">
          {tags[0]}
        </div>
      )}
    </figure>
  );
}

interface ArchivesClientComponentProps {
  initialImages: ArchiveImage[];
}

export default function ArchivesClientComponent({
  initialImages,
}: ArchivesClientComponentProps) {
  const { currentLanguage } = useTranslation();
  const columnCount = useColumnCount();
  const images = initialImages;
  const [zoomedState, setZoomedState] = useState<{
    sectionTitle: string;
    sectionImages: ArchiveImage[];
    sectionIndex: number;
  } | null>(null);

  // Slug for section anchor (safe for URLs)
  const toSectionId = (title: string) =>
    title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  // Memoize filtered and grouped image lists
  const taggedImages = useMemo(
    () => images.filter(img => img.tags && img.tags.length > 0),
    [images]
  );
  const untaggedImages = useMemo(
    () => images.filter(img => !img.tags || img.tags.length === 0),
    [images]
  );

  // Group tagged images by their first tag
  const imagesByTag = useMemo(() => {
    const groups: { [key: string]: ArchiveImage[] } = {};
    taggedImages.forEach(img => {
      if (img.tags && img.tags.length > 0) {
        const tag = img.tags[0];
        if (!groups[tag]) {
          groups[tag] = [];
        }
        groups[tag].push(img);
      }
    });
    return groups;
  }, [taggedImages]);

  // Sections for navigation and zoom (tagged + untagged)
  const sections = useMemo(() => {
    const result: { title: string; images: ArchiveImage[] }[] = [];
    Object.entries(imagesByTag).forEach(([tag, imgs]) =>
      result.push({ title: tag, images: imgs })
    );
    if (untaggedImages.length > 0) {
      result.push({
        title: t(currentLanguage, 'archivesPage.untagged'),
        images: untaggedImages,
      });
    }
    return result;
  }, [imagesByTag, untaggedImages, currentLanguage]);

  const handleCloseModal = () => {
    setZoomedState(null);
  };

  // Return the main archives content and modal
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-0 max-w-7xl">
        {/* Archives Header Section */}
        <div className="relative pt-24 md:pt-32 pb-16">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-6 text-left">
              {t(currentLanguage, 'archivesPage.title')}
            </h1>
            <div className="text-muted-foreground text-lg mt-4 mb-8 max-w-3xl leading-relaxed text-left">
              {t(currentLanguage, 'archivesPage.description')}
            </div>
          </div>

          {/* Section navigation by title */}
          {sections.length > 1 && (
            <nav
              className="flex flex-wrap justify-center gap-2 mt-6"
              aria-label="Archives sections"
            >
              {sections.map(({ title: sectionTitle }) => {
                const sectionId = toSectionId(sectionTitle);
                return (
                  <a
                    key={sectionId}
                    href={`#${sectionId}`}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {sectionTitle}
                  </a>
                );
              })}
            </nav>
          )}
        </div>

        {/* Archives Images Section */}
        <div className="pb-24">
          {images.length === 0 && (
            <motion.div
              className="text-center py-20 bg-muted/30 rounded-sm p-8 mb-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
                {t(currentLanguage, 'archivesPage.noImages')}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                {t(currentLanguage, 'archivesPage.description')}
              </p>
            </motion.div>
          )}

          {/* Sections grouped by tag (or untagged) */}
          {sections.map(({ title: sectionTitle, images: sectionImages }) => (
            <SectionArchives
              key={toSectionId(sectionTitle)}
              sectionTitle={sectionTitle}
              sectionImages={sectionImages}
              columnCount={columnCount}
              toSectionId={toSectionId}
              setZoomedState={setZoomedState}
            />
          ))}
        </div>
      </div>

      {/* Zoomed Image Modal – carousel shows only images from the clicked section */}
      {zoomedState && (
        <ZoomImage
          images={zoomedState.sectionImages}
          initialIndex={zoomedState.sectionIndex}
          sectionTitle={zoomedState.sectionTitle}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
