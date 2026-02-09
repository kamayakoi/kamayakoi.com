'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '../ui/sheet';
import styles from '@/lib/styles/header.module.css';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { t } from '@/lib/i18n/translations';
import CartModal from '@/components/merch/cart/cart-modal';
import WishlistModal from '@/components/merch/wishlist/wishlist-modal';

interface NavItem {
  nameKey: string;
  path: string;
  isComingSoon?: boolean;
  isComingSoonBadgeOnly?: boolean;
}

interface HeaderProps {
  ticketsButtonLocation?: 'header' | 'hero';
  showBlogInNavigation?: boolean;
  showArchivesInNavigation?: boolean;
}

export default function Header({
  ticketsButtonLocation = 'header',
  showBlogInNavigation = true,
  showArchivesInNavigation = true,
}: HeaderProps) {
  const [isScrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { currentLanguage } = useTranslation();
  const { button } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems: NavItem[] = [
    { nameKey: 'header.nav.home', path: '/' },
    { nameKey: 'header.nav.events', path: '/events' },
    { nameKey: 'header.nav.room', path: '/artists' },
    ...(showBlogInNavigation
      ? [{ nameKey: 'header.nav.blog', path: '/stories' }]
      : []),
    ...(showArchivesInNavigation
      ? [{ nameKey: 'header.nav.gallery', path: '/archives' }]
      : []),
    { nameKey: 'header.nav.shop', path: '/merch' },
  ];

  const showTicketsCta = pathname === '/' && ticketsButtonLocation === 'header';

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerContent}>
        {/* Empty space for both mobile and desktop */}
        <div className="flex items-center" style={{ width: '20px' }}></div>

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
                  className={`${styles.navLink} ${isActive(item.path) ? styles.activeNavLink : ''}`}
                >
                  {t(currentLanguage, item.nameKey)}
                </Link>
              );
            }
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.activeNavLink : ''}`}
              >
                {t(currentLanguage, item.nameKey)}
              </Link>
            );
          })}
        </nav>

        {/* Cart, Wishlist and Tickets CTA - Desktop */}
        <div className="hidden md:flex items-center ml-4 gap-2">
          {showTicketsCta && (
            <Link href="/events">
              <Button
                size="sm"
                className={`rounded-sm px-3 font-semibold tracking-tight ${button.secondaryBorder}`}
              >
                {t(currentLanguage, 'heroSection.getTickets')}
              </Button>
            </Link>
          )}
          <CartModal />
          <WishlistModal />
        </div>

        <div className="flex items-center gap-2 md:hidden -translate-y-[7px]">
          <CartModal />
          <WishlistModal />
          {showTicketsCta && (
            <Link href="/events">
              <Button
                size="sm"
                className={`rounded-sm px-2.5 font-semibold tracking-tight text-xs ${button.secondaryBorder}`}
              >
                {t(currentLanguage, 'heroSection.getTickets')}
              </Button>
            </Link>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className={`${styles.mobileMenuButton} bg-transparent hover:bg-transparent focus:ring-0 border-0 translate-x-[6px]`}
              >
                <Menu className="h-5 w-5 text-foreground" />
                <span className="sr-only">
                  {t(currentLanguage, 'header.mobileMenu.toggle')}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className={`${styles.customSheetContent} bg-background text-foreground h-screen w-screen p-16 duration-200 flex flex-col items-center justify-center`}
            >
              <SheetTitle className="sr-only">
                {t(currentLanguage, 'header.mobileMenu.title')}
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
                      {t(currentLanguage, 'header.mobileMenu.close')}
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
                          className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.activeMobileNavLink : ''} text-3xl font-semibold text-white hover:text-gray-400 border-none`}
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
                        className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.activeMobileNavLink : ''} text-3xl font-semibold text-white hover:text-gray-400 border-none`}
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
