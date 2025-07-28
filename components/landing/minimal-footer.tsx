"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { IG } from "@/components/icons/IG";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { Soundcloud } from "@/components/icons/Soundcloud";

export default function MinimalFooter() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const maxScroll = documentHeight - windowHeight;
            const scrollProgress = Math.min(scrollY / maxScroll, 1);

            // Only show footer when scroll progress is at 100% (completely scrolled)
            setIsVisible(scrollProgress >= 0.95);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-12 bg-black/20 backdrop-blur-md border-t border-white/10 z-10">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                {/* Social Icons - Left Side */}
                <ul className="flex items-center space-x-2 list-none">
                    {/* WhatsApp */}
                    <li>
                        <Link
                            href="https://chat.whatsapp.com/I9yf0JkldJKLfu6FCnzQPQ?fbclid=PAZXh0bgNhZW0CMTEAAacIsymPxGAGZe1Y8dd04RKl0SOezf6bvn4z-8xK36S3a5bMDVddkT7DztdndQ_aem_rJkv0dc7xDHqT-vZBriGkg"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="WhatsApp"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-white transition-colors hover:text-[#25D366]"
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
                            className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-white transition-colors hover:text-[#ff5500]"
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
                            className="inline-flex items-center justify-center h-8 w-8 rounded-sm transition-colors text-white hover:text-[#1877F2]"
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
                            className="inline-flex items-center justify-center h-8 w-8 rounded-sm transition-colors text-white hover:text-[#E4405F]"
                        >
                            <IG className="h-[18px] w-[18px]" />
                        </Link>
                    </li>
                </ul>

                {/* Language Switcher - Right Side */}
                <LanguageSwitcher className="text-white/80 hover:text-white" />
            </div>
        </footer>
    );
} 