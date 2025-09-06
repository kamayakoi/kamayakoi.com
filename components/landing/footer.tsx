"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, Check, X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { IG } from "@/components/icons/IG";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { Soundcloud } from "@/components/icons/Soundcloud";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { sendEmail } from "@/lib/actions/send-email";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

// Contact Form Component
function ContactForm({ onClose }: { onClose: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const { currentLanguage } = useTranslation();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      const result = await sendEmail(formData);

      if (result.success) {
        toast(result.success);
        onClose();
      } else {
        toast(result.error || t(currentLanguage, "footer.contact.sendError"));
      }
    } catch {
      toast(t(currentLanguage, "footer.contact.sendError"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label
          htmlFor="email"
          className="block text-lg text-gray-300 font-medium"
        >
          {t(currentLanguage, "footer.contact.emailLabel")}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder={t(currentLanguage, "footer.contact.emailPlaceholder")}
          required
          className="w-full bg-[#1a1a1a] rounded-sm p-4 text-base border border-gray-700 focus:ring-2 focus:ring-gray-400 placeholder:text-gray-400 text-white transition-colors focus:bg-[#1a1a1a]"
        />
      </div>

      <div className="space-y-4">
        <label
          htmlFor="message"
          className="block text-lg text-gray-300 font-medium"
        >
          {t(currentLanguage, "footer.contact.messageLabel")}
        </label>
        <textarea
          id="message"
          name="message"
          placeholder={t(currentLanguage, "footer.contact.messagePlaceholder")}
          required
          rows={6}
          className="w-full bg-[#1a1a1a] rounded-sm p-4 text-base border border-gray-700 focus:ring-2 focus:ring-gray-400 placeholder:text-gray-400 text-white transition-colors resize-none focus:bg-[#1a1a1a]"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gray-200 hover:bg-blue-300 text-black px-8 py-4 rounded-sm text-base font-medium inline-flex items-center justify-center gap-2 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:hover:bg-blue-400 min-w-[180px] h-[60px] w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <span>{t(currentLanguage, "footer.contact.sendButton")}</span>
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function Footer() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isNewsletterFocused, setIsNewsletterFocused] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { currentLanguage } = useTranslation();

  return (
    // Card with rounded corners
    <footer className="relative p-4 md:p-6">
      <div className="w-full md:h-[532px] p-4 md:p-11 text-white bg-[#1a1a1a] rounded-sm flex flex-col justify-between max-md:gap-8">
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
                  {t(currentLanguage, "footer.sections.explore")}
                </h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-white/70 hover:text-white transition-colors text-sm font-bold"
                  >
                    {t(currentLanguage, "footer.navigation.events")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stories"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    {t(currentLanguage, "footer.navigation.stories")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/merch"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    {t(currentLanguage, "footer.navigation.merch")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-widest">
                  {t(currentLanguage, "footer.sections.connect")}
                </h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/artists"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    {t(currentLanguage, "footer.navigation.artists")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/archives"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    {t(currentLanguage, "footer.navigation.archive")}
                  </Link>
                </li>
                <li>
                  <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                    <DialogTrigger asChild>
                      <button className="text-white/70 hover:text-white transition-colors text-sm font-light text-left">
                        {t(currentLanguage, "footer.navigation.contact")}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-[#1a1a1a] border-gray-600 rounded-sm p-6 md:p-11">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-normal text-white text-center mb-8">
                          {t(currentLanguage, "footer.contact.title")}
                        </DialogTitle>
                      </DialogHeader>
                      <ContactForm onClose={() => setIsContactOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-widest">
                  {t(currentLanguage, "footer.sections.legal")}
                </h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    {t(currentLanguage, "footer.links.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-white/70 hover:text-white transition-colors text-sm font-light"
                  >
                    {t(currentLanguage, "footer.links.terms")}
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
            <p className="text-[10px] font-mono md:text-xs">
              {t(currentLanguage, "footer.copyright", {
                year: new Date().getFullYear(),
              })}
            </p>
          </div>

          {/* Desktop: Newsletter + Language Switcher, Mobile: Social Icons and Language Switcher */}
          <div className="flex items-center gap-2 translate-x-0 md:translate-x-8">
            <div className="hidden md:block">
              <motion.div
                className="flex items-center"
                animate={{
                  width: isNewsletterFocused ? "180px" : "130px"
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1],
                  type: "tween"
                }}
                style={{ justifyContent: 'flex-end' }}
              >
                <motion.form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const email = formData.get('email') as string;

                    if (!email) return;

                    setNewsletterStatus('loading');

                    const newsletterData = new FormData();
                    newsletterData.append('email', email);
                    newsletterData.append('subject', 'New Newsletter Subscription');
                    newsletterData.append('message', `New person subscribed to newsletter: ${email}`);
                    newsletterData.append('type', 'newsletter');

                    const result = await sendEmail(newsletterData);
                    if (result.success) {
                      setNewsletterStatus('success');
                      (e.target as HTMLFormElement).reset();
                      setIsNewsletterFocused(false);
                      // Reset status after 3 seconds
                      setTimeout(() => setNewsletterStatus('idle'), 3000);
                    } else {
                      setNewsletterStatus('error');
                      // Reset status after 3 seconds
                      setTimeout(() => setNewsletterStatus('idle'), 3000);
                    }
                  }}
                  className="flex"
                >
                  <motion.input
                    type="email"
                    name="email"
                    placeholder={t(currentLanguage, "footer.newsletter.placeholder")}
                    required
                    animate={{
                      x: isNewsletterFocused ? -45 : 0
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.4, 0.0, 0.2, 1],
                      type: "tween"
                    }}
                    onFocus={() => setIsNewsletterFocused(true)}
                    onBlur={() => {
                      // Longer delay to prevent flickering when clicking button
                      setTimeout(() => setIsNewsletterFocused(false), 300);
                    }}
                    className="bg-transparent rounded-sm px-2 py-1 text-xs border border-gray-700 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-400 text-white transition-colors focus:outline-none focus:bg-transparent h-6 w-38"
                  />
                  <motion.button
                    type="submit"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isNewsletterFocused ? 1 : 0,
                      scale: isNewsletterFocused ? 1 : 0.8,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.4, 0.0, 0.2, 1],
                      type: "tween"
                    }}
                    style={{
                      pointerEvents: isNewsletterFocused ? 'auto' : 'none'
                    }}
                    className={`px-2 py-1 rounded-sm text-xs font-medium transition-colors h-6 -ml-8 flex items-center justify-center min-w-[50px] ${isNewsletterFocused ? '' : 'invisible'
                      } ${newsletterStatus === 'success'
                        ? 'bg-green-800 text-green-100'
                        : newsletterStatus === 'error'
                          ? 'bg-red-800 text-red-100'
                          : 'bg-teal-800 hover:bg-teal-700 text-teal-100'
                      }`}
                    disabled={newsletterStatus === 'loading'}
                  >
                    {newsletterStatus === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : newsletterStatus === 'success' ? (
                      <Check className="w-4 h-4" />
                    ) : newsletterStatus === 'error' ? (
                      <X className="w-4 h-4" />
                    ) : (
                      t(currentLanguage, "footer.newsletter.sendButton")
                    )}
                  </motion.button>
                </motion.form>
              </motion.div>
            </div>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="https://chat.whatsapp.com/I9yf0JkldJKLfu6FCnzQPQ?fbclid=PAZXh0bgNhZW0CMTEAAacIsymPxGAGZe1Y8dd04RKl0SOezf6bvn4z-8xK36S3a5bMDVddkT7DztdndQ_aem_rJkv0dc7xDHqT-vZBriGkg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-white/70 transition-colors hover:text-[#25D366] md:hidden"
              >
                <WhatsappIcon className="h-[16px] w-[16px]" />
              </Link>
              <Link
                href="https://soundcloud.com/kamayakoi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Soundcloud"
                className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-white/70 transition-colors hover:text-[#ff5500] md:hidden"
              >
                <Soundcloud className="h-[15px] w-[15px]" />
              </Link>
              <Link
                href="https://www.facebook.com/Kamayakoi/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center justify-center h-6 w-6 rounded-sm transition-colors text-white/70 hover:text-[#1877F2] md:hidden"
              >
                <FacebookIcon className="h-[14.5px] w-[14.5px]" />
              </Link>
              <Link
                href="https://www.instagram.com/kamayakoi/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center h-6 w-6 rounded-sm transition-colors text-white/70 hover:text-[#E4405F] md:hidden"
              >
                <IG className="h-[17px] w-[17px]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
