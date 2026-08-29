import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export type ToastVariant = 'error' | 'warning' | 'success';

type ToastNotificationProps = {
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
};

const toastStyles = {
  error: {
    title: 'Error',
    icon: AlertTriangle,
    className: 'border-red-200 bg-red-50 text-red-800 shadow-[0_6px_0_#fecaca]',
    iconClassName: 'bg-red-100 text-red-700',
  },
  warning: {
    title: 'Warning',
    icon: AlertTriangle,
    className: 'border-amber-200 bg-amber-50 text-amber-900 shadow-[0_6px_0_#fde68a]',
    iconClassName: 'bg-amber-100 text-amber-700',
  },
  success: {
    title: 'Success',
    icon: CheckCircle2,
    className: 'border-leaf/30 bg-leaf-soft text-leaf-dark shadow-[0_6px_0_#c8efd9]',
    iconClassName: 'bg-white/80 text-leaf-dark',
  },
} as const;

export const ToastNotification = ({
  message,
  variant = 'success',
  onClose,
}: ToastNotificationProps) => {
  const { title, icon: Icon, className, iconClassName } = toastStyles[variant];
  const role = variant === 'success' ? 'status' : 'alert';

  return createPortal(
    <div className="pointer-events-none absolute top-4 right-4 z-[60] w-[min(calc(100vw-2rem),22rem)]">
      <div
        className={clsx(
          'pointer-events-auto grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-3xl border-2 p-4 transition duration-150',
          className,
          message ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
        )}
        role={role}
      >
        <span
          className={clsx('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full', iconClassName)}
          aria-hidden="true"
        >
          <Icon className="size-5" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-base leading-5 font-bold">{title}</p>
          <p className="mt-1 text-sm leading-5 font-bold">{message}</p>
        </div>
        {onClose ? (
          <button
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/75"
            type="button"
            aria-label="Close notification"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" strokeWidth={3} />
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
