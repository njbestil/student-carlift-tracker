import { useEffect, useState } from 'react';

export const useDelayedLoadingIndicator = (isLoading: boolean, delayMs = 250) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsVisible(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setIsVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, isLoading]);

  return isVisible;
};
