import type { Metadata } from "next";
import { Component as Horizon } from "@/components/landing/horizon";
import Header from "@/components/landing/header";
import MinimalFooter from "@/components/landing/minimal-footer";
import AudioPlayer from "@/components/landing/audio-player";

// Use the general site metadata for the home page
export const metadata: Metadata = {
  title: "Kamayakoi",
  description: "Rendez-vous sauvage pour électrons libres.",
};

export default function Home() {
  return (
    <div className="relative">
      {/* Audio Player for homepage */}
      <div className="hidden md:block fixed top-4 left-4 z-[70]">
        <AudioPlayer />
      </div>
      {/* Header positioned over the horizon */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Horizon component */}
      <Horizon />

      {/* Minimal footer - positioned absolutely, only shows when horizon is fully scrolled */}
      <MinimalFooter />
    </div>
  );
}
