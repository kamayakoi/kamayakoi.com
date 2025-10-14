"use client";

import { XCircle, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Header from "@/components/landing/header";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { motion } from "framer-motion";

interface PaymentCancelClientProps {
  purchaseId?: string;
}

export function PaymentCancelClient({ purchaseId }: PaymentCancelClientProps) {
  const { currentLanguage } = useTranslation();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col py-12 px-4">
        <div className="max-w-md mx-auto mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="bg-card/30 backdrop-blur-sm border-border">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-orange-900/30 rounded-sm flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-orange-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-orange-200">
                  {t(currentLanguage, "paymentCancel.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                      <p>{t(currentLanguage, "paymentCancel.description")}</p>
                      {purchaseId && (
                        <p className="text-sm mt-2 font-mono bg-muted/50 p-2 rounded-sm">
                          {t(currentLanguage, "paymentCancel.orderId", {
                            orderId: purchaseId,
                          })}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-orange-900/20 border border-orange-800 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowLeft className="w-5 h-5 text-orange-400" />
                    <h3 className="font-semibold text-orange-200">
                      {t(currentLanguage, "paymentCancel.whatsNext.title")}
                    </h3>
                  </div>
                  <ul className="text-sm text-orange-300 space-y-1">
                    <li>
                      • {t(currentLanguage, "paymentCancel.whatsNext.tryAgain")}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        currentLanguage,
                        "paymentCancel.whatsNext.differentMethod",
                      )}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        currentLanguage,
                        "paymentCancel.whatsNext.contactSupport",
                      )}
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    asChild
                    className="w-full bg-teal-800 hover:bg-teal-700 text-teal-200 border-teal-700"
                  >
                    <Link href="/">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t(currentLanguage, "paymentCancel.buttons.backToEvents")}
                    </Link>
                  </Button>

                  <div className="flex gap-3">
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/archives">
                        {t(
                          currentLanguage,
                          "paymentCancel.buttons.browseGallery",
                        )}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/merch">
                        {t(
                          currentLanguage,
                          "paymentCancel.buttons.backToMerch",
                        )}
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  {t(currentLanguage, "paymentCancel.support")}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
