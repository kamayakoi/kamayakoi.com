import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllArtists, type ArtistData } from "@/lib/sanity/queries";
import Header from "@/components/landing/header";

import LoadingComponent from "@/components/ui/loader";
import MiniAudioPlayer from "@/components/landing/mini-audio-player";
import { Footer } from "@/components/landing/footer";
import ArtistCard from "@/components/ui/artist-card";
import ArtistsContentClient from "./artists-content-client";

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
