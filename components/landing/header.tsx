"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "../ui/sheet";
import styles from "@/lib/styles/header.module.css";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { CartProvider } from "@/components/merch/cart/cart-context";
import { WishlistProvider } from "@/components/merch/wishlist/wishlist-context";
import CartModal from "@/components/merch/cart/cart-modal";
import WishlistModal from "@/components/merch/wishlist/wishlist-modal";
import MiniAudioPlayer from "@/components/landing/mini-audio-player";

interface NavItem {
  nameKey: string;
  path: string;
  isComingSoon?: boolean;
  isComingSoonBadgeOnly?: boolean;
}

export default function Header() {
  const [isScrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { currentLanguage } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems: NavItem[] = [
    { nameKey: "header.nav.home", path: "/" },
    { nameKey: "header.nav.events", path: "/events" },
    // { nameKey: "header.nav.room", path: "/artists" },
    { nameKey: "header.nav.blog", path: "/stories" },
    { nameKey: "header.nav.shop", path: "/merch" },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      {/* Mini Audio Player - positioned relative to header */}
      <div className="absolute top-[14px] left-[19px] md:top-[12px] md:left-4 z-[60] pointer-events-auto">
        <MiniAudioPlayer />
      </div>

      <div className={styles.headerContent}>
        {/* Empty space for both mobile and desktop - adjusted for MiniAudioPlayer */}
        <div className="flex items-center" style={{ width: "140px" }}></div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item: NavItem) => {
            if (item.isComingSoon) {
              return (
                <span
                  key={item.path}
                  className={`${styles.navLink} ${styles.disabledNavLink}`}
                >
                  {t(currentLanguage, item.nameKey)}
                </span>
              );
            }
            if (item.isComingSoonBadgeOnly) {
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.activeNavLink : ""}`}
                >
                  {t(currentLanguage, item.nameKey)}
                </Link>
              );
            }
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.activeNavLink : ""}`}
              >
                {t(currentLanguage, item.nameKey)}
              </Link>
            );
          })}
        </nav>

        {/* Cart and Wishlist Modals - Desktop */}
        <div className="hidden md:flex items-center ml-4 gap-2">
          <CartProvider>
            <WishlistProvider>
              <CartModal />
              <WishlistModal />
            </WishlistProvider>
          </CartProvider>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className={`${styles.mobileMenuButton} bg-transparent hover:bg-transparent focus:ring-0 border-0 -translate-y-[7px] translate-x-[6px]`}
              >
                <Menu className="h-5 w-5 text-foreground" />
                <span className="sr-only">
                  {t(currentLanguage, "header.mobileMenu.toggle")}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className={`${styles.customSheetContent} bg-background text-foreground h-screen w-screen p-16 duration-200 flex flex-col items-center justify-center`}
            >
              <SheetTitle className="sr-only">
                {t(currentLanguage, "header.mobileMenu.title")}
              </SheetTitle>

              <div className="absolute top-4 right-4">
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-zinc-800 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                    <span className="sr-only">
                      {t(currentLanguage, "header.mobileMenu.close")}
                    </span>
                  </Button>
                </SheetClose>
              </div>

              <div className="flex flex-col gap-8 text-center w-auto">
                {navItems.map((item: NavItem) => {
                  if (item.isComingSoon) {
                    return (
                      <div
                        key={item.path}
                        className={`${styles.mobileNavLink} ${styles.disabledMobileNavLink}`}
                      >
                        {t(currentLanguage, item.nameKey)}
                      </div>
                    );
                  }
                  if (item.isComingSoonBadgeOnly) {
                    return (
                      <SheetClose asChild key={item.path}>
                        <Link
                          href={item.path}
                          className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.activeMobileNavLink : ""} text-3xl font-semibold text-white hover:text-gray-400 border-none`}
                        >
                          {t(currentLanguage, item.nameKey)}
                        </Link>
                      </SheetClose>
                    );
                  }
                  return (
                    <SheetClose asChild key={item.path}>
                      <Link
                        href={item.path}
                        className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.activeMobileNavLink : ""} text-3xl font-semibold text-white hover:text-gray-400 border-none`}
                      >
                        {t(currentLanguage, item.nameKey)}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
