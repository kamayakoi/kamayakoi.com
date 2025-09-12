"use client";

import { motion } from "framer-motion";
import Header from "@/components/landing/header";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { Footer } from "@/components/landing/footer";

const lastUpdatedDate = new Date("2025-09-04");
const formattedDate = lastUpdatedDate.toLocaleDateString("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function TermsClientPage() {
  const { currentLanguage } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <article className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="relative pt-24 md:pt-32 mb-12">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t(currentLanguage, "termsPage.title")}
            </motion.h1>
            <motion.p
              className="text-zinc-600 dark:text-zinc-200 text-base sm:text-lg md:text-xl leading-relaxed tracking-tight max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t(currentLanguage, "termsPage.subtitle")}
            </motion.p>
            <p className="text-sm text-muted-foreground text-right mt-4">
              {t(currentLanguage, "termsPage.lastUpdated", {
                date: formattedDate,
              })}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Introduction */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.introduction.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.introduction.p1")}</p>
                <p>{t(currentLanguage, "termsPage.introduction.p2")}</p>
              </div>
            </section>

            {/* Mission */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.mission.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.mission.p1")}</p>
                <p>{t(currentLanguage, "termsPage.mission.p2")}</p>
              </div>
            </section>

            {/* Conduct */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.conduct.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.conduct.p1")}</p>
                <ul className="space-y-3 pl-6">
                  <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                    {t(currentLanguage, "termsPage.conduct.listItem1")}
                  </li>
                  <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                    {t(currentLanguage, "termsPage.conduct.listItem2")}
                  </li>
                  <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                    {t(currentLanguage, "termsPage.conduct.listItem3")}
                  </li>
                </ul>
                <p>{t(currentLanguage, "termsPage.conduct.p2")}</p>
              </div>
            </section>

            {/* Tickets */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.tickets.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.tickets.p1")}</p>
                <p>{t(currentLanguage, "termsPage.tickets.p2")}</p>
                <p>{t(currentLanguage, "termsPage.tickets.p3")}</p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.ip.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.ip.p1")}</p>
                <p>{t(currentLanguage, "termsPage.ip.p2")}</p>
              </div>
            </section>

            {/* User Content */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.userContent.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.userContent.p1")}</p>
                <p>{t(currentLanguage, "termsPage.userContent.p2")}</p>
              </div>
            </section>

            {/* Liability */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.liability.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.liability.p1")}</p>
                <p>{t(currentLanguage, "termsPage.liability.p2")}</p>
                <p>{t(currentLanguage, "termsPage.liability.p3")}</p>
              </div>
            </section>

            {/* Indemnification */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.indemnification.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.indemnification.p1")}</p>
              </div>
            </section>

            {/* Governing Law */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.governingLaw.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.governingLaw.p1")}</p>
              </div>
            </section>

            {/* Changes */}
            <section className="bg-card rounded-sm p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.changes.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.changes.p1")}</p>
                <p>{t(currentLanguage, "termsPage.changes.p2")}</p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-primary/5 rounded-sm p-6 md:p-8 border border-primary/20">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.contact.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.contact.p1")}</p>
                <p className="font-medium">
                  {t(currentLanguage, "termsPage.contact.p2")}
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
