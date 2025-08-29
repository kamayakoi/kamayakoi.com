import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllArtists, type ArtistData } from "@/lib/sanity/queries";
import LoadingComponent from "@/components/ui/loader";
import ArtistsContentClient from "@/app/artists/artists-content-client";

export const metadata: Metadata = {
  title: "Artists | Kamayakoi",
  description: "Meet the talented artists and creators of Kamayakoi.",
};

async function ArtistsContent() {
  const artists: ArtistData[] = await getAllArtists();

  return <ArtistsContentClient artists={artists} />;
}

export default async function ArtistsPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ArtistsContent />
    </Suspense>
  );
}
