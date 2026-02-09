import { NextResponse } from 'next/server';
import { getArchiveImages } from '@/lib/sanity/queries';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

interface ArchiveImageApiItem {
  id: number;
  height: string;
  width: string;
  url: string;
  tags?: string[];
}

export async function GET() {
  console.log('[API Route /api/gallery-images] Received GET request (Sanity).');

  try {
    const archiveImages = await getArchiveImages();

    if (!archiveImages || archiveImages.length === 0) {
      console.warn('[API Route] No archive images found in Sanity.');
      return NextResponse.json<ArchiveImageApiItem[]>([]);
    }

    const items: ArchiveImageApiItem[] = archiveImages
      .filter(img => !!img.imageUrl)
      .map((img, index) => {
        const width =
          typeof img.width === 'number' && !Number.isNaN(img.width)
            ? img.width.toString()
            : '720';
        const height =
          typeof img.height === 'number' && !Number.isNaN(img.height)
            ? img.height.toString()
            : '480';

        return {
          id: index,
          width,
          height,
          url: img.imageUrl,
          tags: img.category ? [img.category] : [],
        };
      });

    // Keep the same sorting semantics: tagged images first, then by id (recency)
    items.sort((a, b) => {
      const aHasTags = a.tags && a.tags.length > 0;
      const bHasTags = b.tags && b.tags.length > 0;

      if (aHasTags && !bHasTags) return -1;
      if (!aHasTags && bHasTags) return 1;
      return a.id - b.id;
    });

    console.log(
      `[API Route] Returned ${items.length} archive images from Sanity.`
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error(
      '[API Route] Error fetching archive images from Sanity:',
      error
    );
    return NextResponse.json(
      { error: 'Internal Server Error fetching gallery images from Sanity.' },
      { status: 500 }
    );
  }
}
