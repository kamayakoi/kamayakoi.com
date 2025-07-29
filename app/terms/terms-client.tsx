"use client";

import Header from "@/components/landing/header";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import MinimalFooter from "@/components/landing/minimal-footer";

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
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
          {/* Header Section */}
          <div className="mb-8 mt-8 md:mb-12 md:mt-12">
            <h1 className="text-4xl font-bold text-primary mb-4 md:text-5xl">
              {t(currentLanguage, "termsPage.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl">
              {t(currentLanguage, "termsPage.subtitle")}
            </p>
            <p className="text-sm text-muted-foreground text-right">
              {t(currentLanguage, "termsPage.lastUpdated", {
                date: formattedDate,
              })}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Introduction */}
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.introduction.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.introduction.p1")}</p>
                <p>{t(currentLanguage, "termsPage.introduction.p2")}</p>
              </div>
            </section>

            {/* Mission */}
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.mission.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.mission.p1")}</p>
                <p>{t(currentLanguage, "termsPage.mission.p2")}</p>
              </div>
            </section>

            {/* Conduct */}
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
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
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
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
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.ip.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.ip.p1")}</p>
                <p>{t(currentLanguage, "termsPage.ip.p2")}</p>
              </div>
            </section>

            {/* User Content */}
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.userContent.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.userContent.p1")}</p>
                <p>{t(currentLanguage, "termsPage.userContent.p2")}</p>
              </div>
            </section>

            {/* Liability */}
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
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
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.indemnification.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.indemnification.p1")}</p>
              </div>
            </section>

            {/* Governing Law */}
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.governingLaw.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.governingLaw.p1")}</p>
              </div>
            </section>

            {/* Changes */}
            <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.changes.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.changes.p1")}</p>
                <p>{t(currentLanguage, "termsPage.changes.p2")}</p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-primary/5 rounded-lg p-6 md:p-8 border border-primary/20">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {t(currentLanguage, "termsPage.contact.title")}
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>{t(currentLanguage, "termsPage.contact.p1")}</p>
                <p className="font-medium">{t(currentLanguage, "termsPage.contact.p2")}</p>
              </div>
            </section>
          </div>
        </article>
      </main>
      <MinimalFooter />
    </div>
  );
}
