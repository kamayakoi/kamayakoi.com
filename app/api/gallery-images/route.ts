import { NextResponse } from 'next/server';
import { getArchiveImages } from '@/lib/sanity/queries';
import { mapArchiveImagesForClient } from '@/lib/utils/archive-images';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export async function GET() {
  try {
    const archiveImages = await getArchiveImages();
    const items = mapArchiveImagesForClient(archiveImages);

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
