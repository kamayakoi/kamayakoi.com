import { NextResponse } from 'next/server';
import { getArchiveImages } from '@/lib/sanity/queries';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

interface ArchiveImageApiItem {
  id: number;
  height: string;
  width: string;
  url: string;
  tags?: string[]; // First tag = category (gallery title) for section heading
}

export async function GET() {
  try {
    const archiveImages = await getArchiveImages();

    if (!archiveImages || archiveImages.length === 0) {
      return NextResponse.json<ArchiveImageApiItem[]>([]);
    }

    const items: ArchiveImageApiItem[] = archiveImages.map((img, index) => {
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

    items.sort((a, b) => {
      const aHasTags = a.tags && a.tags.length > 0;
      const bHasTags = b.tags && b.tags.length > 0;
      if (aHasTags && !bHasTags) return -1;
      if (!aHasTags && bHasTags) return 1;
      return a.id - b.id;
    });

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
