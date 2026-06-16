import type { ArchiveImageData } from '@/lib/sanity/queries';

export interface ArchiveImage {
  id: number;
  height: string;
  width: string;
  url: string;
  tags?: string[];
  public_id?: string;
  format?: string;
  blurDataUrl?: string;
  title?: string;
}

export function mapArchiveImagesForClient(
  archiveImages: ArchiveImageData[]
): ArchiveImage[] {
  if (!archiveImages || archiveImages.length === 0) {
    return [];
  }

  const items: ArchiveImage[] = archiveImages.map((img, index) => {
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

  return items;
}
