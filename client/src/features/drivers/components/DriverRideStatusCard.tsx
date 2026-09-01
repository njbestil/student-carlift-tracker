type DriverRideStatusCardProps = {
  isOnService: boolean;
  isUpdating: boolean;
  locationMessage: string;
  onToggle: () => void;
};

export const DriverRideStatusCard = ({
  isOnService,
  isUpdating,
  locationMessage,
  onToggle,
}: DriverRideStatusCardProps) => (
  <DriverRideStatusCardContent
    isOnService={isOnService}
    isUpdating={isUpdating}
    locationMessage={locationMessage}
    onToggle={onToggle}
  />
);

const DriverRideStatusCardContent = ({
  isOnService,
  isUpdating,
  locationMessage,
  onToggle,
}: DriverRideStatusCardProps) => {
  const isSpinnerVisible = useDelayedLoadingIndicator(isUpdating);

  return <div className="ui-card mb-7 flex items-center justify-between gap-4 bg-sky-soft">
    <div>
      <p className="text-sm font-extrabold text-muted">Ride Status</p>
      <p className="font-display text-xl font-bold">
        {isOnService ? "You're rolling!" : 'Taking a break'}
      </p>
      <p className="body-copy text-sm" role="status">{locationMessage}</p>
    </div>
    <button
      className={`relative h-12 w-24 rounded-full border-0 p-1 transition-colors ${isOnService ? 'bg-leaf' : 'bg-line'}`}
      type="button"
      disabled={isUpdating}
      aria-pressed={isOnService}
      aria-label={isUpdating ? 'Updating service status' : 'On service'}
      onClick={onToggle}
    >
      {isSpinnerVisible ? (
        <LoaderCircle className="mx-auto size-6 animate-spin text-sky-dark" aria-hidden="true" strokeWidth={3} />
      ) : <span className={`block size-10 rounded-full bg-white shadow-md transition-transform ${isOnService ? 'translate-x-12' : 'translate-x-0'}`} />}
    </button>
  </div>;
};
import { LoaderCircle } from 'lucide-react';
import { useDelayedLoadingIndicator } from '../../../hooks/useDelayedLoadingIndicator';
