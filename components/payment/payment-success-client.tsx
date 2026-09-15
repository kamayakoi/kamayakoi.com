'use client';

import { useEffect } from 'react';
import { CheckCircle, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Header from '@/components/landing/header';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { t } from '@/lib/i18n/translations';
import { motion } from 'framer-motion';
import { clearCheckoutForm } from '@/lib/utils/checkout-form-storage';

interface PaymentSuccessClientProps {
  purchaseId?: string;
  flow?: string;
  eventSlug?: string;
  ticketsButtonLocation?: 'header' | 'hero';
  showBlogInNavigation?: boolean;
  showArchivesInNavigation?: boolean;
}

export function PaymentSuccessClient({
  purchaseId,
  flow,
  eventSlug,
  ticketsButtonLocation = 'header',
  showBlogInNavigation = true,
  showArchivesInNavigation = true,
}: PaymentSuccessClientProps) {
  const { currentLanguage } = useTranslation();
  const { button } = useTheme();
  const isMerch = flow === 'merch';
  const returnHref = isMerch
    ? '/merch'
    : eventSlug
      ? `/events/${eventSlug}`
      : '/events';
  const whatsappHref = purchaseId
    ? `https://wa.me/?text=${encodeURIComponent(
        t(currentLanguage, 'paymentSuccess.whatsAppText', {
          orderId: purchaseId,
        })
      )}`
    : null;

  useEffect(() => {
    clearCheckoutForm();
  }, []);

  return (
    <>
      <Header
        ticketsButtonLocation={ticketsButtonLocation}
        showBlogInNavigation={showBlogInNavigation}
        showArchivesInNavigation={showArchivesInNavigation}
      />
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col py-12 px-4">
        <div className="max-w-md mx-auto mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Card className="bg-card/30 backdrop-blur-sm border-border">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-900/30 rounded-sm flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-200">
                  {t(currentLanguage, 'paymentSuccess.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                      <p>
                        {t(
                          currentLanguage,
                          isMerch
                            ? 'paymentSuccess.descriptionMerch'
                            : 'paymentSuccess.descriptionTicket'
                        )}
                      </p>
                      <p className="text-sm mt-2">
                        {t(currentLanguage, 'paymentSuccess.emailDelay')}
                      </p>
                      {purchaseId && (
                        <div className="mt-4 p-3 rounded-sm bg-green-900/20 border border-green-800/50">
                          <p className="text-xs uppercase tracking-wide text-green-400 mb-1">
                            {t(
                              currentLanguage,
                              'paymentSuccess.orderReference'
                            )}
                          </p>
                          <p className="text-sm font-mono text-green-200 break-all">
                            {purchaseId}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-green-900/20 border border-green-800 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-green-200">
                      {t(currentLanguage, 'paymentSuccess.whatsNext.title')}
                    </h3>
                  </div>
                  <ul className="text-sm text-green-300 space-y-1">
                    {isMerch ? (
                      <>
                        <li>
                          •{' '}
                          {t(
                            currentLanguage,
                            'paymentSuccess.whatsNext.merchCheckEmail'
                          )}
                        </li>
                        <li>
                          •{' '}
                          {t(
                            currentLanguage,
                            'paymentSuccess.whatsNext.merchWait'
                          )}
                        </li>
                        <li>
                          •{' '}
                          {t(
                            currentLanguage,
                            'paymentSuccess.whatsNext.merchKeepId'
                          )}
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          •{' '}
                          {t(
                            currentLanguage,
                            'paymentSuccess.whatsNext.checkEmail'
                          )}
                        </li>
                        <li>
                          •{' '}
                          {t(
                            currentLanguage,
                            'paymentSuccess.whatsNext.presentTicket'
                          )}
                        </li>
                        <li>
                          •{' '}
                          {t(
                            currentLanguage,
                            'paymentSuccess.whatsNext.arriveEarly'
                          )}
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    asChild
                    className={`w-full ${button.secondaryBorder}`}
                  >
                    <Link href={returnHref}>
                      {isMerch ? (
                        <Package className="w-4 h-4 mr-2" />
                      ) : (
                        <Calendar className="w-4 h-4 mr-2" />
                      )}
                      {isMerch
                        ? t(
                            currentLanguage,
                            'paymentSuccess.buttons.backToMerch'
                          )
                        : eventSlug
                          ? t(
                              currentLanguage,
                              'paymentSuccess.buttons.backToEvent'
                            )
                          : t(
                              currentLanguage,
                              'paymentSuccess.buttons.backToEvents'
                            )}
                    </Link>
                  </Button>
                  {whatsappHref && (
                    <Button variant="outline" asChild className="w-full">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t(currentLanguage, 'paymentSuccess.shareWhatsApp')}
                      </a>
                    </Button>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/archives">
                        {t(
                          currentLanguage,
                          'paymentSuccess.buttons.browseGallery'
                        )}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/merch">
                        {t(
                          currentLanguage,
                          'paymentSuccess.buttons.backToMerch'
                        )}
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  {t(currentLanguage, 'paymentSuccess.support')}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
