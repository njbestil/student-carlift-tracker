import { LoaderCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

type LoadingOverlayProps = {
  isOpen: boolean;
  message?: string;
  fallbackLabel?: string;
  onFallback?: () => void;
  showDelayMs?: number;
  minimumVisibleMs?: number;
};

export const LoadingOverlay = ({
  isOpen,
  message = 'Loading...',
  fallbackLabel,
  onFallback,
  showDelayMs = 250,
  minimumVisibleMs = 300,
}: LoadingOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    const clearShowTimer = () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };

    const clearHideTimer = () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    if (isOpen) {
      clearHideTimer();

      if (!isVisible) {
        clearShowTimer();
        showTimerRef.current = window.setTimeout(() => {
          shownAtRef.current = Date.now();
          setIsVisible(true);
          showTimerRef.current = null;
        }, showDelayMs);
      }
    } else {
      clearShowTimer();

      if (isVisible) {
        const elapsedMs = shownAtRef.current ? Date.now() - shownAtRef.current : 0;
        const remainingVisibleMs = Math.max(0, minimumVisibleMs - elapsedMs);

        hideTimerRef.current = window.setTimeout(() => {
          setIsVisible(false);
          shownAtRef.current = null;
          hideTimerRef.current = null;
        }, remainingVisibleMs);
      }
    }

    return () => {
      clearShowTimer();
      clearHideTimer();
    };
  }, [isOpen, isVisible, minimumVisibleMs, showDelayMs]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-6 backdrop-blur-sm"
      aria-busy="true"
      aria-label={message}
    >
      <div className="ui-card grid w-full max-w-xs justify-items-center gap-4 text-center">
        <LoaderCircle className="size-12 animate-spin text-sky-dark" aria-hidden="true" strokeWidth={3} />
        <p className="font-display text-xl font-bold text-ink" role="status">
          {message}
        </p>
        {onFallback && fallbackLabel ? (
          <button className="ui-button-secondary" type="button" onClick={onFallback}>
            {fallbackLabel}
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
