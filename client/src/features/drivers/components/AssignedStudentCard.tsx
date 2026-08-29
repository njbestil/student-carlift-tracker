import { ChevronDown, MapPin } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { AssignedStudent, StudentServiceStatus } from '../drivers.api';

type AssignedStudentCardProps = {
  student: AssignedStudent;
  isTripActive: boolean;
  isUpdating: boolean;
  onOpenMap: (student: AssignedStudent) => void;
  onStatusChange: (student: AssignedStudent, status: StudentServiceStatus) => void;
};

const statusLabels: Record<StudentServiceStatus, string> = {
  ABSENT: 'Absent',
  WAITING: 'Waiting',
  PICKED_UP: 'Picked Up',
  DROPPED_OFF: 'Dropped Off',
};

const initialsFor = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export const AssignedStudentCard = ({ student, isTripActive, isUpdating, onOpenMap, onStatusChange }: AssignedStudentCardProps) => {
  const isAbsent = student.serviceStatus === 'ABSENT';
  const canChangeAttendance = student.serviceStatus === 'WAITING' || isAbsent;
  const badgeClass = student.serviceStatus === 'PICKED_UP'
    ? 'bg-leaf-soft text-leaf-dark'
    : student.serviceStatus === 'DROPPED_OFF'
      ? 'bg-sky-soft text-sky-dark'
      : student.serviceStatus === 'ABSENT'
        ? 'bg-blush-soft text-[#b94f70]'
        : 'bg-[#fff6d8] text-[#946b00]';

  const handleAbsentToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isTripActive || isUpdating || !canChangeAttendance) return;
    onStatusChange(student, isAbsent ? 'WAITING' : 'ABSENT');
  };

  const advanceRideStatus = () => {
    if (!isTripActive || isUpdating) return;
    if (student.serviceStatus === 'WAITING') {
      onStatusChange(student, 'PICKED_UP');
    }
    if (student.serviceStatus === 'PICKED_UP') {
      onStatusChange(student, 'DROPPED_OFF');
    }
    if (isAbsent) {
      onStatusChange(student, 'WAITING');
    }
  };

  const primaryActionLabel = student.serviceStatus === 'WAITING'
    ? 'Pick up'
    : student.serviceStatus === 'PICKED_UP'
      ? 'Drop off'
      : student.serviceStatus === 'ABSENT'
        ? 'Mark present'
        : null;

  return (
    <details className="ui-card group p-0">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
        {student.profilePhotoUrl ? (
          <img className="size-12 shrink-0 border-gray-200 border-2 rounded-full object-cover" src={student.profilePhotoUrl} alt={`${student.studentFullName}'s profile`} />
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blush-soft font-display text-sm font-bold text-[#b94f70]" aria-hidden="true">
            {initialsFor(student.studentFullName)}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <strong className="block font-display text-lg">{student.studentFullName}</strong>
          <span className={`status-pill mt-1 ${badgeClass}`}>{statusLabels[student.serviceStatus]}</span>
        </span>
        <button
          className={`relative h-8 w-16 shrink-0 rounded-full border-0 p-1 transition-colors ${isAbsent ? 'bg-line' : 'bg-leaf'} ${isUpdating || !isTripActive || !canChangeAttendance ? 'opacity-60' : ''}`}
          type="button"
          aria-pressed={isAbsent ? 'false' : 'true'}
          aria-disabled={isUpdating || !isTripActive || !canChangeAttendance ? 'true' : 'false'}
          aria-label={`${student.studentFullName} active`}
          onClick={handleAbsentToggle}
        >
          <span
            className={`block size-6 rounded-full bg-white shadow-md transition-transform ${isAbsent ? 'translate-x-0' : 'translate-x-8'}`}
            aria-hidden="true"
          />
        </button>
        <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" strokeWidth={3} />
      </summary>
      <div className="border-t-2 border-line px-4 py-5">
        <dl className="grid gap-3 text-sm">
          <div><dt className="font-extrabold text-muted">Parent</dt><dd>{student.parentFullName}</dd></div>
          <div><dt className="font-extrabold text-muted">Contact number</dt><dd>{student.contactNumber}</dd></div>
          <div><dt className="font-extrabold text-muted">Emergency mobile number</dt><dd>{student.emergencyNumber}</dd></div>
          <div><dt className="font-extrabold text-muted">Address</dt><dd>{student.completeAddress}</dd></div>
        </dl>
        <button className="ui-button-secondary mt-5 min-h-12 py-2 text-base" type="button" onClick={() => onOpenMap(student)}>
          <MapPin className="mr-2 size-5" aria-hidden="true" strokeWidth={2.5} /> View map
        </button>
        {primaryActionLabel ? (
          <button className="ui-button-primary mt-3" type="button" aria-disabled={isUpdating || !isTripActive ? 'true' : 'false'} onClick={advanceRideStatus}>
            {primaryActionLabel}
          </button>
        ) : <p className="mt-4 text-center text-sm font-extrabold text-leaf-dark">Completed</p>}
      </div>
    </details>
  );
};
