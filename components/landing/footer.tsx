"use client";

import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { IG } from "@/components/icons/IG";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { Soundcloud } from "@/components/icons/Soundcloud";

export function Footer() {
  const { setTheme, theme } = useTheme();

  return (
    // Card with rounded corners
    <footer className="relative p-4 md:p-6">
      <div className="w-full md:h-[532px] p-4 md:p-11 text-white bg-black dark:bg-[#1a1a1a] rounded-sm flex flex-col justify-between max-md:gap-8">
        <div className="flex flex-col justify-between md:flex-row relative">
          <div className="md:basis-3/4 max-md:w-full max-w-[1200px] h-auto">
            <div className="mb-6 mt-8 md:mb-4 md:mt-0 flex justify-center md:justify-start">
              <Image
                src="/white.svg"
                alt="Kamayakoi"
                width={450}
                height={135}
                className="h-48 md:h-48 w-auto"
              />
            </div>

            <div className="flex gap-2 mb-6 mt-4 md:mt-0 justify-center md:justify-start max-md:hidden">
              {/* Contact/Social Icons (Using custom icons) - Hidden on mobile */}
              <ul className="flex items-center space-x-2 list-none flex-wrap justify-center md:justify-start">
                {/* WhatsApp */}
                <li>
                  <Link
                    href="https://chat.whatsapp.com/I9yf0JkldJKLfu6FCnzQPQ?fbclid=PAZXh0bgNhZW0CMTEAAacIsymPxGAGZe1Y8dd04RKl0SOezf6bvn4z-8xK36S3a5bMDVddkT7DztdndQ_aem_rJkv0dc7xDHqT-vZBriGkg"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-sm text-white/70 transition-colors hover:text-[#25D366]"
                  >
                    <WhatsappIcon className="h-[22px] w-[22px]" />
                  </Link>
                </li>
                {/* Soundcloud */}
                <li>
                  <Link
                    href="https://soundcloud.com/kamayakoi"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Soundcloud"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-sm text-white/70 transition-colors hover:text-[#ff5500]"
                  >
                    <Soundcloud className="h-[20px] w-[20px]" />
                  </Link>
                </li>
                {/* Facebook */}
                <li>
                  <Link
                    href="https://www.facebook.com/Kamayakoi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-sm transition-colors text-white/70 hover:text-[#1877F2]"
                  >
                    <FacebookIcon className="h-[19.5px] w-[19.5px]" />
                  </Link>
                </li>
                {/* Instagram */}
                <li>
                  <Link
                    href="https://www.instagram.com/kamayakoi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-sm transition-colors text-white/70 hover:text-[#E4405F]"
                  >
                    <IG className="h-[23px] w-[23px]" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-md:hidden grid grid-cols-3 gap-8 md:gap-6">
            <div>
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-widest">
                  EXPLORE
                </h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Le Rendez Vous Sauvage
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Stories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Archive
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-widest">
                  CONNECT
                </h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/artists"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Artists
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Archive
                  </Link>
                </li>
                <li>
                  <Link
                    href=""
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-widest">
                  LEGAL
                </h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-white/70 pt-6 relative isolate">
          <div
            className="absolute top-0 left-0 right-0 h-px bg-white/20 z-10"
            style={{ backgroundColor: "rgb(255 255 255 / 0.2)" }}
          ></div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-mono">
              {new Date().getFullYear()}© Kamayakoi
              <span className="hidden md:inline"> — All rights reserved</span>
            </p>
          </div>

          {/* Social Icons and Theme Toggle - Mobile Only */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="https://chat.whatsapp.com/I9yf0JkldJKLfu6FCnzQPQ?fbclid=PAZXh0bgNhZW0CMTEAAacIsymPxGAGZe1Y8dd04RKl0SOezf6bvn4z-8xK36S3a5bMDVddkT7DztdndQ_aem_rJkv0dc7xDHqT-vZBriGkg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-white/70 transition-colors hover:text-[#25D366]"
            >
              <WhatsappIcon className="h-[16px] w-[16px]" />
            </Link>
            <Link
              href="https://soundcloud.com/kamayakoi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Soundcloud"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-white/70 transition-colors hover:text-[#ff5500]"
            >
              <Soundcloud className="h-[15px] w-[15px]" />
            </Link>
            <Link
              href="https://www.facebook.com/Kamayakoi/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm transition-colors text-white/70 hover:text-[#1877F2]"
            >
              <FacebookIcon className="h-[14.5px] w-[14.5px]" />
            </Link>
            <Link
              href="https://www.instagram.com/kamayakoi/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm transition-colors text-white/70 hover:text-[#E4405F]"
            >
              <IG className="h-[17px] w-[17px]" />
            </Link>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="flex items-center justify-center hover:text-white transition-colors cursor-pointer ml-2"
              aria-label="Toggle theme"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
          </div>

          {/* Theme Toggle - Desktop Only */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="flex items-center justify-center hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
