import type { Metadata } from "next";
import { getAllArtists, type ArtistData } from "@/lib/sanity/queries";
import Header from "@/components/landing/header";
import { ArtistCard } from "@/components/ui/artist-card";

export const metadata: Metadata = {
  title: "Artists",
  description: "Meet the talented artists and creators of Kamayakoi.",
};

export default async function ArtistsPage() {
  const artists: ArtistData[] = await getAllArtists();

  // Remove the empty state - always show the page structure

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto py-26 px-4">
          {/* Artists Grid - 2 cards per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center max-w-4xl mx-auto">
            {artists.map((artist) => (
              <div key={artist._id} className="w-full max-w-sm">
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
