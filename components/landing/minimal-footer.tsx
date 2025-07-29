"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { IG } from "@/components/icons/IG";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { Soundcloud } from "@/components/icons/Soundcloud";
// import { useTranslation } from "@/lib/contexts/TranslationContext";
// import { t } from "@/lib/i18n/translations";

export default function MinimalFooter() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  // const { currentLanguage } = useTranslation();

  // Pages where footer should appear as regular footer (not fixed)
  const staticFooterPages = ["/artists", "/terms", "/privacy"];
  const isStaticFooter = staticFooterPages.some((page) =>
    pathname?.includes(page),
  );

  useEffect(() => {
    // For static footer pages, always show
    if (isStaticFooter) {
      setIsVisible(true);
      return;
    }

    // For other pages, use scroll-based visibility
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const scrollProgress = Math.min(scrollY / maxScroll, 1);

      // Show footer when scroll progress is at 85% to appear earlier
      setIsVisible(scrollProgress >= 0.85);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isStaticFooter]);

  if (!isVisible) {
    return null;
  }

  const footerContent = (
    <div className="container mx-auto px-4 h-full flex items-center justify-between">
      {/* Left Side - Logo and Desktop Social Icons */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link href="/" aria-label="Kamayakoi">
          <Image
            src="/white.svg"
            alt="Kamayakoi Logo"
            width={40}
            height={40}
            priority
          />
        </Link>

        {/* Vertical separator - Desktop only */}
        <div className="hidden md:block h-6 w-px bg-white/30"></div>

        {/* Social Icons - Desktop only */}
        <ul className="hidden md:flex items-center space-x-2 list-none">
          {/* WhatsApp */}
          <li>
            <Link
              href="https://chat.whatsapp.com/I9yf0JkldJKLfu6FCnzQPQ?fbclid=PAZXh0bgNhZW0CMTEAAacIsymPxGAGZe1Y8dd04RKl0SOezf6bvn4z-8xK36S3a5bMDVddkT7DztdndQ_aem_rJkv0dc7xDHqT-vZBriGkg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-white transition-colors hover:text-[#25D366]"
            >
              <WhatsappIcon className="h-[18px] w-[18px]" />
            </Link>
          </li>
          {/* Soundcloud */}
          <li>
            <Link
              href="https://soundcloud.com/kamayakoi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Soundcloud"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-white transition-colors hover:text-[#ff5500]"
            >
              <Soundcloud className="h-[16px] w-[16px]" />
            </Link>
          </li>
          {/* Facebook */}
          <li>
            <Link
              href="https://www.facebook.com/Kamayakoi/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm transition-colors text-white hover:text-[#1877F2]"
            >
              <FacebookIcon className="h-[16px] w-[16px]" />
            </Link>
          </li>
          {/* Instagram */}
          <li>
            <Link
              href="https://www.instagram.com/kamayakoi/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm transition-colors text-white hover:text-[#E4405F]"
            >
              <IG className="h-[18px] w-[18px]" />
            </Link>
          </li>
        </ul>

        {/* Open Source Link - Desktop Only */}
        {/* <Link
                      href="https://github.com/kamayakoi/kamayakoi.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/60 hover:text-white/80 transition-colors hidden lg:block ml-4"
                  >
                      {t(currentLanguage, "barcode.opensource")}
                  </Link> */}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Social Icons - Mobile only */}
        <ul className="flex md:hidden items-center space-x-2 list-none">
          {/* WhatsApp */}
          <li>
            <Link
              href="https://chat.whatsapp.com/I9yf0JkldJKLfu6FCnzQPQ?fbclid=PAZXh0bgNhZW0CMTEAAacIsymPxGAGZe1Y8dd04RKl0SOezf6bvn4z-8xK36S3a5bMDVddkT7DztdndQ_aem_rJkv0dc7xDHqT-vZBriGkg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-white transition-colors hover:text-[#25D366]"
            >
              <WhatsappIcon className="h-[18px] w-[18px]" />
            </Link>
          </li>
          {/* Soundcloud */}
          <li>
            <Link
              href="https://soundcloud.com/kamayakoi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Soundcloud"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-white transition-colors hover:text-[#ff5500]"
            >
              <Soundcloud className="h-[16px] w-[16px]" />
            </Link>
          </li>
          {/* Facebook */}
          <li>
            <Link
              href="https://www.facebook.com/Kamayakoi/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm transition-colors text-white hover:text-[#1877F2]"
            >
              <FacebookIcon className="h-[16px] w-[16px]" />
            </Link>
          </li>
          {/* Instagram */}
          <li>
            <Link
              href="https://www.instagram.com/kamayakoi/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center h-6 w-6 rounded-sm transition-colors text-white hover:text-[#E4405F]"
            >
              <IG className="h-[18px] w-[18px]" />
            </Link>
          </li>
        </ul>

        {/* Desktop: Language Switcher */}
        <LanguageSwitcher className="hidden md:block text-white/80 hover:text-white" />
      </div>
    </div>
  );

  // Render as regular footer for specific pages
  if (isStaticFooter) {
    return (
      <footer className="h-12 bg-black/20 backdrop-blur-md border-t border-white/10 mt-8">
        {footerContent}
      </footer>
    );
  }

  // Render as fixed footer for other pages
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-12 bg-black/20 backdrop-blur-md border-t border-white/10 z-10">
      {footerContent}
    </footer>
  );
}
