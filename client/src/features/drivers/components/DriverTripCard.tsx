import { useId, useRef, useState } from 'react';
import type { AssignedStudent, DriverTrip } from '../drivers.api';

type DriverTripCardProps = {
  activeTrip: DriverTrip | null;
  students: AssignedStudent[];
  isStarting: boolean;
  onStart: (tripOrigin: DriverTrip['tripOrigin']) => void;
};

const routeLabel = (tripOrigin: DriverTrip['tripOrigin']) => tripOrigin === 'HOME' ? 'Home → School' : 'School → Home';

export const DriverTripCard = ({ activeTrip, students, isStarting, onStart }: DriverTripCardProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [tripOrigin, setTripOrigin] = useState<DriverTrip['tripOrigin']>('HOME');
  const waitingCount = students.filter((student) => student.serviceStatus === 'WAITING').length;
  const onBoardCount = students.filter((student) => student.serviceStatus === 'PICKED_UP').length;
  const completedCount = students.filter((student) => student.serviceStatus === 'DROPPED_OFF').length;
  const absentCount = students.filter((student) => student.serviceStatus === 'ABSENT').length;

  const openConfirmation = (nextTripOrigin: DriverTrip['tripOrigin']) => {
    if (isStarting) return;
    setTripOrigin(nextTripOrigin);
    dialogRef.current?.showModal();
  };

  const confirmStart = () => {
    if (isStarting) return;
    dialogRef.current?.close();
    onStart(tripOrigin);
  };

  if (activeTrip) {
    return (
      <div className="ui-card mb-7 bg-sky-soft">
        <p className="text-sm font-extrabold text-sky-dark">Active trip · {routeLabel(activeTrip.tripOrigin)}</p>
        <p className="mt-1 font-display text-xl font-bold">{waitingCount} waiting · {onBoardCount} on board · {completedCount} dropped off</p>
        {absentCount ? <p className="body-copy mt-1 text-sm">{absentCount} absent</p> : null}
      </div>
    );
  }

  return (
    <>
      <div className="ui-card mb-7 bg-sky-soft">
        <p className="text-sm font-extrabold text-sky-dark">Ready for a trip</p>
        <p className="mt-1 font-display text-xl font-bold">Choose where riders are starting.</p>
        <div className="mt-4 grid gap-3">
          <button className="ui-button-primary" type="button" aria-disabled={isStarting ? 'true' : 'false'} onClick={() => openConfirmation('HOME')}>Start school run</button>
          <button className="ui-button-secondary" type="button" aria-disabled={isStarting ? 'true' : 'false'} onClick={() => openConfirmation('SCHOOL')}>Start return trip</button>
        </div>
      </div>
      <dialog ref={dialogRef} aria-labelledby={titleId} className="ui-dialog">
        <div className="p-5">
          <h2 id={titleId} className="section-heading">Start {routeLabel(tripOrigin)} trip?</h2>
          <p className="body-copy mt-2">{students.length - absentCount} students will be set to Waiting. {absentCount ? `${absentCount} absent students will remain absent.` : ''}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="ui-button-secondary" type="button" onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button className="ui-button-primary" type="button" onClick={confirmStart}>Start trip</button>
          </div>
        </div>
      </dialog>
    </>
  );
};
