'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  Ticket,
  AlertCircle,
  QrCode,
  Tag,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { t } from '@/lib/i18n/translations';

interface TicketData {
  purchase_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  event_id: string;
  event_title: string;
  event_date_text: string;
  event_time_text: string;
  event_venue_name: string;
  ticket_type_id: string;
  ticket_name: string;
  quantity: number;
  price_per_ticket: number;
  total_amount: number;
  currency_code: string;
  status: string;
  is_used: boolean;
  used_at?: string;
  verified_by?: string;
  use_count?: number; // How many times a legacy ticket has been used
  total_quantity?: number; // The total number of admissions on a legacy ticket
  remaining_tickets?: number; // Calculated remaining admissions
}

const PIN_CACHE_KEY = 'staff_verification_pin';
const PIN_CACHE_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

const DUPLICATE_SCAN_WINDOW = 5000; // 5 seconds - matches server-side duplicate window
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // 1 second

// Track last scanned tickets to prevent rapid duplicates (ticket-specific)
// eslint-disable-next-line prefer-const
let lastScannedTickets: Map<string, number> = new Map();

// Track tickets currently being processed to prevent duplicate API calls
const inFlightTickets: Set<string> = new Set();

// Clean up old scan records to prevent memory leaks
const cleanupOldScanRecords = () => {
  const now = Date.now();
  const cutoffTime = now - DUPLICATE_SCAN_WINDOW * 2; // Keep records for 2x the window

  for (const [ticketId, timestamp] of lastScannedTickets.entries()) {
    if (timestamp < cutoffTime) {
      lastScannedTickets.delete(ticketId);
    }
  }
};

// Audio feedback for scanning
const playSuccessSound = () => {
  try {
    const audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Higher pitch for success
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch {
    // Silent fail if audio not supported
  }
};

const playErrorSound = () => {
  try {
    const audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200; // Lower pitch for error
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch {
    // Silent fail if audio not supported
  }
};

// Enhanced storage with fallbacks for mobile compatibility
interface StaffCache {
  [key: string]: unknown;
}

declare global {
  interface Window {
    __staffCache?: StaffCache;
  }
}

const storage = {
  set: (key: string, value: unknown): boolean => {
    const data = JSON.stringify(value);
    try {
      // Try localStorage first (persists across browser sessions)
      localStorage.setItem(key, data);
      return true;
    } catch {
      try {
        // Fallback to sessionStorage
        sessionStorage.setItem(key, data);
        return true;
      } catch {
        // If both fail, store in memory (less reliable but better than nothing)
        window.__staffCache = window.__staffCache || {};
        window.__staffCache[key] = value;
        return true;
      }
    }
  },
  get: (key: string): unknown => {
    try {
      // Try localStorage first
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore parse errors
    }

    try {
      // Try sessionStorage
      const data = sessionStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore parse errors
    }

    try {
      // Try memory cache
      return window.__staffCache?.[key] || null;
    } catch {
      // Ignore access errors
    }

    return null;
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
    try {
      if (window.__staffCache) {
        delete window.__staffCache[key];
      }
    } catch {
      // Ignore errors
    }
  },
};

interface VerifyClientProps {
  ticketId?: string;
}

// Retry helper with exponential backoff
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY_MS
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;

    // Check if it's a network error (worth retrying)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError =
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection');

    if (!isNetworkError) {
      // Don't retry validation errors like TICKET_NOT_FOUND
      throw error;
    }

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 1.5); // Exponential backoff
  }
};

export function VerifyClient({ ticketId }: VerifyClientProps) {
  const { currentLanguage } = useTranslation();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null); // Track error type for UI differentiation
  const [isVerified, setIsVerified] = useState(false);
  const [wasJustAdmitted, setWasJustAdmitted] = useState(false);
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);

  // Check for cached PIN on component mount
  useEffect(() => {
    const checkCachedPin = () => {
      try {
        const cached = storage.get(PIN_CACHE_KEY) as {
          timestamp: number;
        } | null;
        if (cached && cached.timestamp) {
          const now = Date.now();

          // Check if cached PIN is still valid (within duration)
          if (now - cached.timestamp < PIN_CACHE_DURATION) {
            setIsVerified(true);
            return;
          } else {
            // Clear expired cache
            storage.remove(PIN_CACHE_KEY);
          }
        }
      } catch {
        // If there's any error reading cache, just ignore it
        storage.remove(PIN_CACHE_KEY);
      }
    };

    checkCachedPin();
  }, []);

  // Reset state when ticketId changes (for continuous scanning workflow)
  useEffect(() => {
    if (ticketId) {
      setError(null);
      setErrorCode(null);
      setTicketData(null);
      setWasJustAdmitted(false);
    }
  }, [ticketId]);

  // Auto-verify ticket when page loads with ID and user is verified
  useEffect(() => {
    if (ticketId && isVerified && !ticketData) {
      verifyTicket(ticketId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, isVerified, ticketData]);

  // Helper to parse error codes from database exceptions
  const parseErrorMessage = (
    errorMessage: string
  ): { code: string; message: string } => {
    const match = errorMessage.match(/^([A-Z_]+):\s*(.+)$/);
    if (match) {
      return { code: match[1], message: match[2] };
    }
    return { code: 'UNKNOWN_ERROR', message: errorMessage };
  };

  // Helper to get user-friendly error message
  const getUserFriendlyError = useCallback(
    (errorCode: string, defaultMessage: string): string => {
      const errorMap: Record<string, string> = {
        TICKET_NOT_FOUND: t(
          currentLanguage,
          'ticketVerification.errors.ticketNotFound'
        ),
        INVALID_INPUT: t(
          currentLanguage,
          'ticketVerification.errors.ticketNotFound'
        ),
        VERIFICATION_FAILED: 'Ticket verification failed. Please try again.',
        PROCESSING: 'This ticket is currently being processed. Please wait.',
        ORPHANED_TICKET: 'Ticket data is incomplete. Please contact support.',
        ALREADY_USED: t(
          currentLanguage,
          'ticketVerification.warnings.alreadyUsed'
        ),
        DUPLICATE_SCAN: 'Please wait a moment before scanning again.',
        ADMISSION_FAILED:
          'Ticket verified but admission failed. Please try again.',
        INTERNAL_ERROR: 'System error. Please contact support.',
      };
      return errorMap[errorCode] || defaultMessage;
    },
    [currentLanguage]
  );

  const verifyTicket = useCallback(
    async (ticketIdentifier: string, isRefreshCall: boolean = false) => {
      setIsLoading(true);

      // Don't clear error/success state if this is a refresh call after successful admission
      if (!isRefreshCall) {
        setError(null);
        setErrorCode(null);
        setTicketData(null);
      }

      const trimmedId = ticketIdentifier.trim();

      // Check for duplicate scan (only for initial scans, not refresh calls)
      if (!isRefreshCall) {
        const now = Date.now();
        const lastScanTime = lastScannedTickets.get(trimmedId);

        if (lastScanTime && now - lastScanTime < DUPLICATE_SCAN_WINDOW) {
          setError(
            'This ticket was just scanned. Please wait before scanning again.'
          );
          setErrorCode('DUPLICATE_SCAN');
          setIsLoading(false);
          return;
        }

        // Prevent duplicate in-flight requests for the same ticket
        if (inFlightTickets.has(trimmedId)) {
          setError('This ticket is currently being processed. Please wait.');
          setErrorCode('DUPLICATE_SCAN');
          setIsLoading(false);
          return;
        }

        inFlightTickets.add(trimmedId);
      }

      try {
        const result = await retryWithBackoff(async () => {
          // Call the edge function for atomic verification and admission
          const { data: response, error: edgeError } =
            await supabase.functions.invoke('verify-ticket', {
              body: {
                ticket_identifier: trimmedId,
                verified_by: 'staff_portal',
                auto_admit: true, // Always auto-admit valid tickets
              },
            });

          if (edgeError) {
            throw new Error(`Edge function error: ${edgeError.message}`);
          }

          if (!response || typeof response !== 'object') {
            throw new Error('Invalid response from verification service');
          }

          return response;
        });

        // Type the result from retryWithBackoff
        const typedResult = result as {
          success: boolean;
          ticket_data?: TicketData;
          error_code?: string;
          error_message?: string;
          admitted?: boolean;
        };

        if (typedResult.ticket_data) {
          setTicketData(typedResult.ticket_data);

          // Update last scanned ticket (only for initial scans)
          if (!isRefreshCall) {
            lastScannedTickets.set(trimmedId, Date.now());
            // Clean up old records periodically
            if (lastScannedTickets.size > 100) {
              cleanupOldScanRecords();
            }
          }
        }

        if (!typedResult.success) {
          // Handle verification failure
          const errorCode = typedResult.error_code || 'UNKNOWN_ERROR';
          const errorMessage =
            typedResult.error_message || 'Verification failed';

          const friendlyMessage = getUserFriendlyError(errorCode, errorMessage);
          setError(friendlyMessage);
          setErrorCode(errorCode);

          // Error feedback - use orange flash for ALREADY_USED, red for other errors
          if (errorCode === 'ALREADY_USED') {
            setFlashColor('red'); // Still flash to get attention
          } else {
            playErrorSound();
            setFlashColor('red');
          }
          setTimeout(() => setFlashColor(null), 500);
          return;
        }

        // Check if admission failed even if verification was successful (e.g., already used)
        if (
          typedResult.success &&
          !typedResult.admitted &&
          typedResult.error_code
        ) {
          const errorCode = typedResult.error_code;
          const errorMessage = typedResult.error_message || 'Admission failed';

          const friendlyMessage = getUserFriendlyError(errorCode, errorMessage);
          setError(friendlyMessage);
          setErrorCode(errorCode);

          if (errorCode === 'ALREADY_USED' || errorCode === 'DUPLICATE_SCAN') {
            // For already used / duplicate scan, show as orange/warning
            setFlashColor('red');
          } else {
            playErrorSound();
            setFlashColor('red');
          }
          setTimeout(() => setFlashColor(null), 500);
          return;
        }

        // Verification successful and admission successful (or not needed)
        if (typedResult.success && typedResult.admitted) {
          setWasJustAdmitted(true);
          setError(null);
          setErrorCode(null);

          if (!isRefreshCall) {
            playSuccessSound();
            setFlashColor('green');
            setTimeout(() => setFlashColor(null), 300);
          }
        }
      } catch (err) {
        // Skip logging timeout/abort errors to avoid noisy DOMException output
        const isTimeoutOrAbort =
          (err instanceof Error &&
            (err.name === 'TimeoutError' ||
              err.name === 'AbortError' ||
              err.message.includes('timeout') ||
              err.message.includes('aborted'))) ||
          (typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            (err as { code: number }).code === 23);
        if (!isTimeoutOrAbort) {
          console.error('Verification error:', err);
        }
        // Only set error if this is not a refresh call or if wasJustAdmitted is not true
        if (!isRefreshCall || !wasJustAdmitted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Verification failed';
          const { code, message } = parseErrorMessage(errorMessage);
          const friendlyMessage = getUserFriendlyError(code, message);
          setError(friendlyMessage);
          setErrorCode(code);

          playErrorSound();
          setFlashColor('red');
          setTimeout(() => setFlashColor(null), 500);
        }
      } finally {
        setIsLoading(false);
        // Remove from in-flight set
        inFlightTickets.delete(trimmedId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentLanguage,
      setIsLoading,
      setError,
      setTicketData,
      getUserFriendlyError,
      wasJustAdmitted,
    ]
  );

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call RPC function to verify PIN
      const { data: isValidPin, error: pinError } = await supabase.rpc(
        'verify_staff_pin',
        {
          p_pin: pin,
        }
      );

      if (pinError) {
        throw new Error(pinError.message);
      }

      if (isValidPin) {
        // Cache the PIN for future use with enhanced storage
        try {
          const cacheData = {
            timestamp: Date.now(),
          };
          storage.set(PIN_CACHE_KEY, cacheData);
        } catch {
          // If storage fails, continue anyway
          console.warn('Failed to cache PIN, but continuing...');
        }

        setIsVerified(true);
        setError(null);
        setPin('');
      } else {
        setError(t(currentLanguage, 'ticketVerification.errors.invalidPin'));
        setPin('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN verification failed');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  // markTicketAsUsed is now handled by the edge function automatically
  // No separate admission function needed

  // Auto-admission is now handled by the edge function
  // No separate useEffect needed - verification includes admission

  // Get status colors and icons based on ticket state
  const getTicketStatus = () => {
    // ALREADY_USED: Show as GREEN/VERIFIED (customer paid, let them in)
    // Backend still logs everything for audit trail
    if (error && errorCode === 'ALREADY_USED') {
      return {
        bgColor: 'bg-emerald-500/10 backdrop-blur-sm',
        borderColor: 'border-emerald-500/50',
        textColor: 'text-emerald-200',
        icon: <CheckCircle className="h-8 w-8 text-emerald-400" />,
        badgeVariant: 'default' as const,
        badgeText: t(currentLanguage, 'ticketVerification.badges.welcome'),
        statusText: t(currentLanguage, 'ticketVerification.status.welcome'),
      };
    }

    // DUPLICATE_SCAN: Keep as orange warning (timing issue, wait a moment)
    if (error && errorCode === 'DUPLICATE_SCAN') {
      return {
        bgColor: 'bg-orange-500/10 backdrop-blur-sm',
        borderColor: 'border-orange-500/50',
        textColor: 'text-orange-200',
        icon: <AlertCircle className="h-8 w-8 text-orange-400" />,
        badgeVariant: 'secondary' as const,
        badgeText: t(currentLanguage, 'ticketVerification.badges.alreadyUsed'),
        statusText: error,
      };
    }

    // Show red styling for actual errors (ticket not found, invalid, unpaid, etc.)
    if (error) {
      return {
        bgColor: 'bg-red-500/10 backdrop-blur-sm',
        borderColor: 'border-red-500/50',
        textColor: 'text-red-200',
        icon: <XCircle className="h-8 w-8 text-red-400" />,
        badgeVariant: 'destructive' as const,
        badgeText: t(currentLanguage, 'ticketVerification.badges.invalid'),
        statusText: t(currentLanguage, 'ticketVerification.status.invalid'),
      };
    }

    if (ticketData?.remaining_tickets === 0) {
      return {
        bgColor: 'bg-orange-500/10 backdrop-blur-sm',
        borderColor: 'border-orange-500/50',
        textColor: 'text-orange-200',
        icon: <AlertCircle className="h-8 w-8 text-orange-400" />,
        badgeVariant: 'secondary' as const,
        badgeText: t(currentLanguage, 'ticketVerification.badges.fullyUsed'),
        statusText: t(currentLanguage, 'ticketVerification.status.fullyUsed'),
      };
    }

    if (ticketData?.use_count !== undefined && ticketData.total_quantity) {
      const remaining = ticketData.total_quantity - ticketData.use_count;
      if (remaining <= 0) {
        // Fallback for logic consistency
        return {
          bgColor: 'bg-orange-500/10 backdrop-blur-sm',
          borderColor: 'border-orange-500/50',
          textColor: 'text-orange-200',
          icon: <AlertCircle className="h-8 w-8 text-orange-400" />,
          badgeVariant: 'secondary' as const,
          badgeText: t(currentLanguage, 'ticketVerification.badges.fullyUsed'),
          statusText: t(currentLanguage, 'ticketVerification.status.fullyUsed'),
        };
      }
    } else if (ticketData?.is_used) {
      // Fallback for legacy / simple tickets
      return {
        bgColor: 'bg-orange-500/10 backdrop-blur-sm',
        borderColor: 'border-orange-500/50',
        textColor: 'text-orange-200',
        icon: <AlertCircle className="h-8 w-8 text-orange-400" />,
        badgeVariant: 'secondary' as const,
        badgeText: t(currentLanguage, 'ticketVerification.badges.alreadyUsed'),
        statusText: t(currentLanguage, 'ticketVerification.status.alreadyUsed'),
      };
    }

    if (ticketData) {
      return {
        bgColor: 'bg-emerald-500/10 backdrop-blur-sm',
        borderColor: 'border-emerald-500/50',
        textColor: 'text-emerald-200',
        icon: <CheckCircle className="h-8 w-8 text-emerald-400" />,
        badgeVariant: 'default' as const,
        badgeText: t(currentLanguage, 'ticketVerification.badges.valid'),
        statusText: t(currentLanguage, 'ticketVerification.status.valid'),
      };
    }

    return null;
  };

  // If no ticket ID in URL, show manual entry with improved design
  if (!ticketId) {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card className="rounded-sm border-slate-700 bg-card/30 backdrop-blur-sm shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                  <QrCode className="w-8 h-8 text-slate-200" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {t(currentLanguage, 'ticketVerification.pageTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center text-gray-300">
                  <p className="text-sm">
                    {t(
                      currentLanguage,
                      'ticketVerification.noTicketId.description'
                    )}
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-slate-200">
                      {t(
                        currentLanguage,
                        'ticketVerification.noTicketId.howToVerify.title'
                      )}
                    </h3>
                  </div>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>
                      •{' '}
                      {t(
                        currentLanguage,
                        'ticketVerification.noTicketId.howToVerify.scanQr'
                      )}
                    </li>
                    <li>
                      •{' '}
                      {t(
                        currentLanguage,
                        'ticketVerification.noTicketId.howToVerify.enterPin'
                      )}
                    </li>
                    <li>
                      •{' '}
                      {t(
                        currentLanguage,
                        'ticketVerification.noTicketId.howToVerify.reviewDetails'
                      )}
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    asChild
                    className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-sm"
                  >
                    <Link href="/">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t(
                        currentLanguage,
                        'ticketVerification.noTicketId.backToEvents'
                      )}
                    </Link>
                  </Button>
                </div>

                <div className="text-center text-xs text-slate-500">
                  {t(currentLanguage, 'ticketVerification.noTicketId.needHelp')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Show PIN entry if not verified yet
  if (!isVerified) {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card className="rounded-sm border-slate-700 bg-card/30 backdrop-blur-sm shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                  <Shield className="w-8 h-8 text-slate-200" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {t(currentLanguage, 'ticketVerification.staffVerification')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center text-gray-300">
                  <p className="text-lg mb-2">
                    {t(
                      currentLanguage,
                      'ticketVerification.pinEntry.description'
                    )}
                  </p>
                  <p className="text-sm font-mono bg-gray-800 p-2 rounded-sm">
                    {t(
                      currentLanguage,
                      'ticketVerification.pinEntry.ticketIdLabel'
                    )}{' '}
                    {ticketId.substring(0, 8)}...
                  </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <Input
                    type="password"
                    placeholder={t(
                      currentLanguage,
                      'ticketVerification.pinEntry.pinPlaceholder'
                    )}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    maxLength={4}
                    className="text-center text-2xl tracking-widest h-12 rounded-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500/20"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 text-base bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-sm"
                    disabled={isLoading || pin.length < 4}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t(
                          currentLanguage,
                          'ticketVerification.pinEntry.verifying'
                        )}
                      </>
                    ) : (
                      t(
                        currentLanguage,
                        'ticketVerification.pinEntry.verifyButton'
                      )
                    )}
                  </Button>
                </form>

                {error && (
                  <div className="bg-red-50/30 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-sm p-4">
                    <div className="text-center text-red-600 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  </div>
                )}

                <div className="text-center text-xs text-slate-500">
                  {t(currentLanguage, 'ticketVerification.pinEntry.staffOnly')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const status = getTicketStatus();

  // Show ticket details after PIN verification
  return (
    <>
      {/* Flash Feedback Overlay */}
      {flashColor && (
        <div
          className={`fixed inset-0 pointer-events-none z-50 ${
            flashColor === 'green' ? 'bg-green-500/30' : 'bg-red-500/30'
          }`}
          style={{ animation: 'flash 0.4s ease-out' }}
        />
      )}

      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Loading State */}
          {isLoading && !ticketData && (
            <Card className="rounded-sm border-slate-700 bg-card/30 backdrop-blur-sm">
              <CardContent className="pt-6 text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
                <p>
                  {t(
                    currentLanguage,
                    'ticketVerification.loading.ticketDetails'
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Status Header with Customer Name and Ticket Type */}
          {status && (
            <Card
              className={`border-2 ${status.borderColor} ${status.bgColor} rounded-sm`}
            >
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center space-y-4">
                  {status.icon}
                  <h2 className={`text-xl font-bold ${status.textColor}`}>
                    {status.statusText}
                  </h2>
                  {ticketData && (
                    <div className="text-center space-y-3">
                      {/* Prominent Ticket Type Badge */}
                      <div className="flex justify-center">
                        <div className="bg-slate-900/60 border border-slate-700 rounded-sm px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                          <Tag className="h-4 w-4 text-slate-400" />
                          <span className="text-lg font-bold text-white">
                            {ticketData.ticket_name}
                          </span>
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {ticketData.customer_name}
                        </p>
                        <p className="text-sm text-slate-300">
                          {ticketData.remaining_tickets !== undefined ? (
                            <span>
                              {ticketData.remaining_tickets}{' '}
                              {t(
                                currentLanguage,
                                'ticketVerification.quantity.remaining'
                              )}
                              <span className="mx-2">/</span>
                              {ticketData.total_quantity || 1}{' '}
                              {t(
                                currentLanguage,
                                'ticketVerification.quantity.people'
                              )}
                            </span>
                          ) : /* Fallback older logic */
                          ticketData.use_count !== undefined &&
                            ticketData.total_quantity ? (
                            <span>
                              {ticketData.use_count} /{' '}
                              {ticketData.total_quantity}{' '}
                              {t(
                                currentLanguage,
                                'ticketVerification.quantity.scanned'
                              )}
                            </span>
                          ) : (
                            <span>
                              {ticketData.quantity}{' '}
                              {ticketData.quantity > 1
                                ? t(
                                    currentLanguage,
                                    'ticketVerification.quantity.people'
                                  )
                                : t(
                                    currentLanguage,
                                    'ticketVerification.quantity.person'
                                  )}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <p className="text-red-700 dark:text-red-300 mt-2">
                      {error}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Details Card */}
          {ticketData && (
            <Card className="rounded-sm border-slate-700 bg-card/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-slate-200">
                  <Ticket className="h-5 w-5" />
                  <CardTitle className="text-lg font-semibold">
                    {t(currentLanguage, 'ticketVerification.eventDetails')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Simplified event details for quick scanning */}
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Tag className="h-3 w-3" />
                    <span>Ticket Type & Purchase Details</span>
                  </div>
                  <p className="font-bold text-xl uppercase tracking-wide text-white">
                    {ticketData.ticket_name} - {ticketData.event_title}
                  </p>
                  <div className="flex justify-between mt-2 pt-2 border-t border-slate-700 text-sm text-slate-300">
                    <span className="text-slate-400">
                      Quantity: {ticketData.total_quantity || 1} ticket
                      {(ticketData.total_quantity || 1) > 1 ? 's' : ''}
                    </span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('fr-FR').format(
                        ticketData.price_per_ticket
                      )}{' '}
                      {ticketData.currency_code} each
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span className="text-slate-400">
                      ID: {ticketId.substring(0, 12)}
                    </span>
                    <span className="font-bold">
                      Total{' '}
                      {new Intl.NumberFormat('fr-FR').format(
                        ticketData.total_amount
                      )}{' '}
                      {ticketData.currency_code}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setErrorCode(null);
                setTicketData(null);
                setWasJustAdmitted(false);
              }}
              className="w-full h-12 text-base bg-slate-900/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Scan New Ticket
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
