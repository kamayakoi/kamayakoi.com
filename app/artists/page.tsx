import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllArtists, type ArtistData } from "@/lib/sanity/queries";
import Header from "@/components/landing/header";
import { ArtistCard } from "@/components/ui/artist-card";
import LoadingComponent from "@/components/ui/loader";
import MiniAudioPlayer from "@/components/landing/mini-audio-player";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Artists",
  description: "Meet the talented artists and creators of Kamayakoi.",
};

async function ArtistsContent() {
  const artists: ArtistData[] = await getAllArtists();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mini Audio Player */}
      <div className="fixed top-4 left-4 z-[60] pointer-events-auto">
        <MiniAudioPlayer />
      </div>
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto py-32 md:py-26 px-4">
          {/* Artists Grid - 2 cards per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center max-w-5xl mx-auto">
            {artists.map((artist) => (
              <div key={artist._id} className="w-full max-w-md">
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default async function ArtistsPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ArtistsContent />
    </Suspense>
  );
}
