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

export default function PrivacyClientPage() {
    const { currentLanguage } = useTranslation();

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 md:py-16">
                <article className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8 mt-8 md:mb-12 md:mt-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                            {t(currentLanguage, "privacyPage.title")}
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl">
                            {t(currentLanguage, "privacyPage.subtitle")}
                        </p>
                        <p className="text-sm text-muted-foreground text-right">
                            {t(currentLanguage, "privacyPage.lastUpdated", {
                                date: formattedDate,
                            })}
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-12">
                        {/* Introduction */}
                        <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.introduction.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.introduction.p1")}</p>
                                <p>{t(currentLanguage, "privacyPage.introduction.p2")}</p>
                            </div>
                        </section>

                        {/* Data Collection */}
                        <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.dataCollection.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.dataCollection.p1")}</p>
                                <ul className="space-y-3 pl-6">
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataCollection.listItem1")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataCollection.listItem2")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataCollection.listItem3")}
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Data Use */}
                        <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.dataUse.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.dataUse.p1")}</p>
                                <ul className="space-y-3 pl-6">
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataUse.listItem1")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataUse.listItem2")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataUse.listItem3")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataUse.listItem4")}
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Data Sharing */}
                        <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.dataSharing.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.dataSharing.p1")}</p>
                                <ul className="space-y-3 pl-6">
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataSharing.listItem1")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataSharing.listItem2")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.dataSharing.listItem3")}
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Data Protection */}
                        <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.dataProtection.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.dataProtection.p1")}</p>
                                <p>{t(currentLanguage, "privacyPage.dataProtection.p2")}</p>
                            </div>
                        </section>

                        {/* Cookies */}
                        <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.cookies.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.cookies.p1")}</p>
                                <p>{t(currentLanguage, "privacyPage.cookies.p2")}</p>
                            </div>
                        </section>

                        {/* Your Rights */}
                        <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.rights.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.rights.p1")}</p>
                                <ul className="space-y-3 pl-6">
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.rights.listItem1")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.rights.listItem2")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.rights.listItem3")}
                                    </li>
                                    <li className="relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
                                        {t(currentLanguage, "privacyPage.rights.listItem4")}
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Data Retention */}
                        <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.retention.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.retention.p1")}</p>
                            </div>
                        </section>

                        {/* Contact */}
                        <section className="bg-primary/5 rounded-lg p-6 md:p-8 border border-primary/20">
                            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                                {t(currentLanguage, "privacyPage.contact.title")}
                            </h2>
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>{t(currentLanguage, "privacyPage.contact.p1")}</p>
                                <p className="font-medium">{t(currentLanguage, "privacyPage.contact.p2")}</p>
                            </div>
                        </section>
                    </div>
                </article>
            </main>
            <MinimalFooter />
        </div>
    );
}