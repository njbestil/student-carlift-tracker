import { ChevronDown, MapPin } from 'lucide-react';
import { useId, useState } from 'react';
import { PhoneCallAction } from '../../../components/ui/PhoneNumberWithCallButton';
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

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const AssignedStudentCard = ({
  student,
  isTripActive,
  isUpdating,
  onOpenMap,
  onStatusChange,
}: AssignedStudentCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsId = useId();
  const isAbsent = student.serviceStatus === 'ABSENT';
  const canChangeAttendance = student.serviceStatus === 'WAITING' || isAbsent;
  const badgeClass =
    student.serviceStatus === 'PICKED_UP'
      ? 'bg-leaf-soft text-leaf-dark'
      : student.serviceStatus === 'DROPPED_OFF'
        ? 'bg-sky-soft text-sky-dark'
        : student.serviceStatus === 'ABSENT'
          ? 'bg-blush-soft text-[#b94f70]'
          : 'bg-[#fff6d8] text-[#946b00]';

  const handleAbsentToggle = () => {
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

  const primaryActionLabel =
    student.serviceStatus === 'WAITING'
      ? 'Pick up'
      : student.serviceStatus === 'PICKED_UP'
        ? 'Drop off'
        : student.serviceStatus === 'ABSENT'
          ? 'Mark present'
          : null;

  return (
    <div className="ui-card relative p-0">
      <button
        className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-4 pr-20 text-left"
        type="button"
        aria-label={`${student.studentFullName} details`}
        aria-controls={detailsId}
        aria-expanded={isDetailsOpen}
        onClick={() => setIsDetailsOpen((isOpen) => !isOpen)}
      >
        {student.profilePhotoUrl ? (
          <img
            className="size-12 shrink-0 border-gray-200 border-2 rounded-full object-cover"
            src={student.profilePhotoUrl}
            alt={`${student.studentFullName}'s profile`}
          />
        ) : (
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blush-soft font-display text-sm font-bold text-[#b94f70]"
            aria-hidden="true"
          >
            {initialsFor(student.studentFullName)}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <strong className="block font-display text-lg">{student.studentFullName}</strong>
          <span className={`status-pill mt-1 ${badgeClass}`}>
            {statusLabels[student.serviceStatus]}
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-muted transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
          strokeWidth={3}
        />
      </button>
      <button
        className={`student-presence-indicator ${isUpdating || !isTripActive || !canChangeAttendance ? 'opacity-60' : ''}`}
        type="button"
        aria-pressed={isAbsent ? 'false' : 'true'}
        aria-disabled={isUpdating || !isTripActive || !canChangeAttendance ? 'true' : 'false'}
        aria-label={`${student.studentFullName} attendance`}
        onClick={handleAbsentToggle}
      >
        <span className="student-presence-indicator__light" aria-hidden="true" />
      </button>

      <div id={detailsId} hidden={!isDetailsOpen} className="border-t-2 border-line px-4 py-5">
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="font-extrabold text-muted">Parent</dt>
            <dd>{student.parentFullName}</dd>
          </div>
          <div>
            <dt className="font-extrabold text-muted">Contact number</dt>
            <dd>{student.contactNumber}</dd>
          </div>
          <div>
            <dt className="font-extrabold text-muted">Emergency mobile number</dt>
            <dd>{student.emergencyNumber}</dd>
          </div>
          <div>
            <dt className="font-extrabold text-muted">Address</dt>
            <dd>{student.completeAddress}</dd>
          </div>
        </dl>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <PhoneCallAction
            phoneNumber={student.contactNumber}
            label="Call contact"
            ariaLabel={`Call ${student.studentFullName}'s contact number at ${student.contactNumber}`}
            variant="contact"
          />
          <PhoneCallAction
            phoneNumber={student.emergencyNumber}
            label="Emergency"
            ariaLabel={`Call ${student.studentFullName}'s emergency mobile number at ${student.emergencyNumber}`}
            variant="emergency"
          />
        </div>
        <button
          className="ui-button-secondary mt-4 min-h-12 py-2 text-base"
          type="button"
          onClick={() => onOpenMap(student)}
        >
          <MapPin className="mr-2 size-5" aria-hidden="true" strokeWidth={2.5} /> View map
        </button>
        {primaryActionLabel ? (
          <button
            className="ui-button-primary mt-3"
            type="button"
            aria-disabled={isUpdating || !isTripActive ? 'true' : 'false'}
            onClick={advanceRideStatus}
          >
            {primaryActionLabel}
          </button>
        ) : (
          <p className="mt-4 text-center text-sm font-extrabold text-leaf-dark">Completed</p>
        )}
      </div>
    </div>
  );
};
