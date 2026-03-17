'use client';

import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import LoadingComponent from '@/components/ui/loader';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { t } from '@/lib/i18n/translations';
import { ZoomImage } from './zoom-image';

// Local type for archive images fetched from Sanity via the API route
export interface ArchiveImage {
  id: number;
  height: string;
  width: string;
  url: string;
  tags?: string[]; // First tag is treated as the category for grouping
  // Optional fields to align with shared gallery image shape
  public_id?: string;
  format?: string;
  blurDataUrl?: string;
  title?: string;
}

export default function ArchivesClientComponent() {
  const { currentLanguage } = useTranslation();
  const [images, setImages] = useState<ArchiveImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch images from the API route
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      console.log('[Archives Client] Fetching images from API route...');
      try {
        const response = await fetch('/api/gallery-images'); // Call the API route

        if (!response.ok) {
          // Try to parse error message from API response body
          let errorMsg = `API Error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMsg = errorData.error;
            }
          } catch (parseError) {
            // Ignore if response body is not JSON or empty
            console.error(
              '[Archives Client] Failed to parse error response:',
              parseError
            );
          }
          throw new Error(errorMsg);
        }

        const fetchedImages: ArchiveImage[] = await response.json();

        // Validate fetched data structure (optional but recommended)
        if (!Array.isArray(fetchedImages)) {
          console.error(
            '[Archives Client] API response is not an array:',
            fetchedImages
          );
          throw new Error('Invalid data format received from server.');
        }

        console.log(
          `[Archives Client] Successfully fetched ${fetchedImages.length} images.`
        );
        setImages(fetchedImages); // Update state with fetched images
      } catch (err) {
        console.error('[Archives Client] Error fetching images from API:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown fetch error occurred'
        );
        setImages([]); // Ensure images array is empty on error
      } finally {
        setIsLoading(false);
        console.log('[Archives Client] Image fetch attempt complete.');
      }
    };

    fetchImages();
  }, []); // Fetch only once on component mount

  // --- Render Logic ---
  if (isLoading) {
    // Render only the spinner, Header/Footer are in the parent page
    return <LoadingComponent />;
  }

  if (error) {
    // Render error message, Header/Footer are in the parent page
    return (
      <div className="flex justify-center items-center h-screen text-red-500 pt-20">
        Error loading archives: {error}
      </div>
    );
  }

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
          {/* Display error inline if needed, without blocking archives */}
          {error && (
            <p className="text-center text-red-500 mb-4">
              Error loading images: {error}
            </p>
          )}
          {images.length === 0 && !isLoading && !error && (
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
            <section
              key={toSectionId(sectionTitle)}
              id={toSectionId(sectionTitle)}
              className="mb-16 scroll-mt-24"
            >
              {/* Section Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-8 text-left capitalize">
                {sectionTitle}
              </h2>

              {/* Images Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {sectionImages.map(({ id, url, width, height }, index) => {
                  const numericWidth = parseInt(width, 10);
                  const numericHeight = parseInt(height, 10);
                  return (
                    <div
                      key={`${sectionTitle}-${id}`}
                      onClick={() =>
                        setZoomedState({
                          sectionTitle,
                          sectionImages,
                          sectionIndex: index,
                        })
                      }
                      className={`
                                        relative
                                        mb-5 block w-full cursor-zoom-in
                                        after:content after:pointer-events-none after:absolute after:inset-0 after:rounded-sm after:shadow-highlight
                                    `}
                    >
                      <Image
                        alt={`Archives photo - ${sectionTitle}`}
                        className="transform rounded-sm brightness-90 transition will-change-auto group-hover:brightness-110"
                        style={{ transform: 'translate3d(0, 0, 0)' }}
                        src={url}
                        width={!isNaN(numericWidth) ? numericWidth : 720}
                        height={!isNaN(numericHeight) ? numericHeight : 480}
                        sizes="(max-width: 640px) 100vw,
                                          (max-width: 1280px) 50vw,
                                          (max-width: 1536px) 33vw,
                                          25vw"
                        priority={index < 3}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
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
