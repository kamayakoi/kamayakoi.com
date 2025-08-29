import type { Metadata } from "next";
import Header from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { EventShowcase } from "@/components/landing/event-showcase";
import { Footer } from "@/components/landing/footer";
import MiniAudioPlayer from "@/components/landing/mini-audio-player";

// Use the general site metadata for the home page
export const metadata: Metadata = {
  title: "Kamayakoi",
  description: "Rendez-vous sauvage pour électrons libres.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Header />
      <HeroSection />
      <EventShowcase />
      <Footer />

      {/* Mini Audio Player - positioned as floating element */}
      <div className="fixed top-4 left-4 z-[60]">
        <MiniAudioPlayer />
      </div>
    </div>
  );
}
