import { LoaderCircle } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useDelayedLoadingIndicator } from '../../hooks/useDelayedLoadingIndicator';

type LoadingButtonProps = ComponentPropsWithoutRef<'button'> & {
  isLoading: boolean;
  loadingLabel: ReactNode;
  spinnerDelayMs?: number;
};

export const LoadingButton = ({
  isLoading,
  loadingLabel,
  spinnerDelayMs,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) => {
  const isSpinnerVisible = useDelayedLoadingIndicator(isLoading, spinnerDelayMs);

  return (
    <button
      {...props}
      className={className}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : undefined}
    >
      {isSpinnerVisible ? (
        <LoaderCircle className="mr-2 size-5 animate-spin" aria-hidden="true" strokeWidth={3} />
      ) : null}
      {isLoading ? loadingLabel : children}
    </button>
  );
};
