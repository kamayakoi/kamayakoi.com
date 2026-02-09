'use client';

import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface YangoButtonProps {
  href: string;
  altText?: string;
  buttonText?: string;
  className?: string;
}

export const YangoButton: React.FC<YangoButtonProps> = ({
  href,
  altText = 'Get a ride with Yango',
  buttonText = 'Yango',
  className = '',
}) => {
  const { button } = useTheme();
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={altText}
      className={`inline-flex items-center justify-center px-4 py-2 h-7 w-15 rounded-sm text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${button.primary} ${button.ring} ${className}`}
    >
      {buttonText}
    </Link>
  );
};
