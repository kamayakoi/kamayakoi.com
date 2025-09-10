"use client";

import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

interface TranslatedLabelProps {
  translationKey: string;
  className?: string;
  values?: Record<string, string | number | undefined>;
}

export function TranslatedLabel({
  translationKey,
  className,
  values,
}: TranslatedLabelProps) {
  const { currentLanguage } = useTranslation();

  return (
    <span className={className}>
      {t(currentLanguage, translationKey, values)}
    </span>
  );
}
