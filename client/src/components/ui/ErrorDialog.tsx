import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

type ErrorDialogProps = {
  message: string;
  isBusy?: boolean;
  onRetry: () => void;
};

export const ErrorDialog = ({ message, isBusy = false, onRetry }: ErrorDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (message && !dialog.open) {
      dialog.showModal();
    }

    if (!message && dialog.open) {
      dialog.close();
    }
  }, [message]);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl border-0 bg-transparent p-0 text-ink shadow-none backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="ui-card grid gap-4 text-center">
        <div>
          <h2 id={titleId} className="section-heading">
            Unable to load your ride
          </h2>
          <p className="body-copy mt-2">{message}</p>
        </div>
        <button
          className="ui-button-primary"
          type="button"
          aria-disabled={isBusy ? 'true' : 'false'}
          onClick={() => {
            if (!isBusy) onRetry();
          }}
        >
          {isBusy ? 'Trying again...' : 'Try again'}
        </button>
      </div>
    </dialog>,
    document.body,
  );
};
