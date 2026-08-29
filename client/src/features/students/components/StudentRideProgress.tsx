type StudentRideProgressProps = {
  tripOrigin: 'HOME' | 'SCHOOL';
  serviceStatus: 'ABSENT' | 'PICKED_UP' | 'DROPPED_OFF' | 'WAITING';
  pickedUpAt: string | null;
  droppedOffAt: string | null;
};

const formatTime = (timestamp: string | null) => {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

function StudentRideProgress({
  tripOrigin,
  serviceStatus,
  pickedUpAt,
  droppedOffAt,
}: StudentRideProgressProps) {
  const originLabel = tripOrigin === 'HOME' ? 'Home' : 'School';
  const destinationLabel = tripOrigin === 'HOME' ? 'School' : 'Home';
  const pickedUpTime = formatTime(pickedUpAt);
  const droppedOffTime = formatTime(droppedOffAt);
  const isPickedUp = serviceStatus === 'PICKED_UP';
  const isDroppedOff = serviceStatus === 'DROPPED_OFF';
  const originNodeClass = clsx(
    'size-4 rounded-full',
    serviceStatus === 'WAITING' ? 'bg-sky' : 'bg-leaf',
  );
  const originSegmentClass = clsx('h-1 flex-1', serviceStatus === 'WAITING' ? 'bg-line' : 'bg-leaf');
  const pickupNodeClass = clsx(
    'size-5 rounded-full border-4',
    isPickedUp
      ? 'border-leaf bg-white'
      : isDroppedOff
        ? 'border-leaf bg-leaf'
        : 'border-line bg-white',
  );
  const destinationSegmentClass = clsx('h-1 flex-1', isDroppedOff ? 'bg-leaf' : 'bg-line');
  const destinationNodeClass = clsx('size-4 rounded-full', isDroppedOff ? 'bg-sky' : 'bg-line');

  const statusMessage =
    serviceStatus === 'WAITING'
      ? `Waiting for pickup at ${originLabel.toLowerCase()}.`
      : isPickedUp
        ? `Your student was picked up${pickedUpTime ? ` at ${pickedUpTime}` : ''}. On the way to ${destinationLabel.toLowerCase()}.`
        : isDroppedOff
          ? `Your student was dropped off${droppedOffTime ? ` at ${droppedOffTime}` : ''} at ${destinationLabel.toLowerCase()}.`
          : 'Your student is not scheduled for a ride.';

  return (
    <div className="ui-card mb-5 p-4">
      <div className="grid grid-cols-3 items-center text-center text-xs font-extrabold text-muted">
        <span>{originLabel}</span>
        <span className="text-leaf-dark">Picked</span>
        <span>{destinationLabel}</span>
      </div>
      <div className="my-3 flex items-center" aria-hidden="true">
        <span className={originNodeClass} />
        <span className={originSegmentClass} />
        <span className={pickupNodeClass} />
        <span className={destinationSegmentClass} />
        <span className={destinationNodeClass} />
      </div>
      <p className="text-center text-sm leading-5 font-bold text-muted" role="status">
        {statusMessage}
      </p>
    </div>
  );
}

export default StudentRideProgress;
import clsx from 'clsx';
