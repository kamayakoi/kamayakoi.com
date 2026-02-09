export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch (error) {
    // Skip logging timeout/abort to avoid noisy DOMException output
    const isTimeoutOrAbort =
      error instanceof Error &&
      (error.name === 'TimeoutError' ||
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('aborted'));
    if (!isTimeoutOrAbort) {
      console.error(`Error getting item ${key} from localStorage`, error);
    }
    return null;
  }
};

export const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Skip logging timeout/abort to avoid noisy DOMException output
    const isTimeoutOrAbort =
      error instanceof Error &&
      (error.name === 'TimeoutError' ||
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('aborted'));
    if (!isTimeoutOrAbort) {
      console.error(`Error setting item ${key} in localStorage`, error);
    }
  }
};
