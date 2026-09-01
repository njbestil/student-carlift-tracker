import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Car,
  Cloud,
  ContactRound,
  Hash,
  Map,
  MapPin,
  Phone,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { ErrorDialog } from '../../components/ui/ErrorDialog';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { GoogleVehicleMap } from '../tracking/GoogleVehicleMap';
import { trackingApi, type VehicleLocation } from '../tracking/tracking.api';
import StudentHeader from './components/StudentHeader';
import StudentRideProgress from './components/StudentRideProgress';
import { formatLocationAge } from './location-time';
import { studentsApi } from './students.api';
import type { AssignedDriver, StudentProfile } from './students.api';
import schoolCar from '../../assets/school-car.svg';

const STUDENT_LOCATION_POLL_INTERVAL_MS = 30_000;
const STUDENT_STATUS_POLL_INTERVAL_MS = 20_000;

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const StudentDashboardPage = () => {
  const mapDialogRef = useRef<HTMLDialogElement>(null);
  const driverDialogRef = useRef<HTMLDialogElement>(null);
  const { token } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [driver, setDriver] = useState<AssignedDriver | null>(null);
  const [profileError, setProfileError] = useState('');
  const [driverError, setDriverError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingDriver, setIsLoadingDriver] = useState(false);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [driverLocation, setDriverLocation] = useState<VehicleLocation | null>(null);
  const [mapStatus, setMapStatus] = useState('Open the map to track the car.');
  const headerStatus =
    studentProfile?.serviceStatus === 'PICKED_UP'
      ? 'picked up'
      : studentProfile?.serviceStatus === 'DROPPED_OFF'
        ? 'dropped off'
        : 'waiting';

  const loadProfile = useCallback(async () => {
    if (!token) {
      setProfileError('You must be signed in to view your ride status.');
      return;
    }

    setIsLoadingProfile(true);
    setProfileError('');

    try {
      const { profile: savedStudentProfile } = await studentsApi.getMe(token);
      setStudentProfile(savedStudentProfile);
    } catch (caughtError) {
      setProfileError(
        caughtError instanceof ApiError ? caughtError.message : 'Unable to load ride status.',
      );
    } finally {
      setIsLoadingProfile(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    let intervalId: number | undefined;

    const startPolling = () => {
      if (intervalId !== undefined) return;

      intervalId = window.setInterval(() => {
        void loadProfile();
      }, STUDENT_STATUS_POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId === undefined) return;

      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadProfile();
        startPolling();
        return;
      }

      stopPolling();
    };

    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadProfile]);

  const loadAssignedDriver = useCallback(async () => {
    if (!token) {
      setDriverError('You must be signed in to view your driver.');
      return;
    }

    setIsLoadingDriver(true);
    setDriverError('');

    try {
      const { driver: assignedDriver } = await studentsApi.getAssignedDriver(token);
      setDriver(assignedDriver);
    } catch (caughtError) {
      setDriver(null);
      setDriverError(
        caughtError instanceof ApiError ? caughtError.message : 'Unable to load driver details.',
      );
    } finally {
      setIsLoadingDriver(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAssignedDriver();
  }, [loadAssignedDriver]);

  const loadDriverLocation = useCallback(async () => {
    if (!token) {
      setMapStatus('You must be signed in to view the live route.');
      return;
    }

    try {
      const { location } = await trackingApi.getMyDriverLatestLocation(token);
      setDriverLocation(location);
      setMapStatus(
        location ? formatLocationAge(location.recordedAt) : 'Waiting for the driver location.',
      );
    } catch (caughtError) {
      setMapStatus(
        caughtError instanceof ApiError ? caughtError.message : 'Unable to load the live route.',
      );
    }
  }, [token]);

  useEffect(() => {
    if (!isMapDialogOpen || document.visibilityState !== 'visible') {
      return undefined;
    }

    void loadDriverLocation();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadDriverLocation();
      }
    }, STUDENT_LOCATION_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isMapDialogOpen, loadDriverLocation]);

  useEffect(() => {
    if (!isMapDialogOpen) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadDriverLocation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMapDialogOpen, loadDriverLocation]);

  const openMapDialog = () => {
    setIsMapDialogOpen(true);
    mapDialogRef.current?.showModal();
  };

  const openDriverDialog = () => {
    driverDialogRef.current?.showModal();

    if (!driver && !isLoadingDriver) {
      void loadAssignedDriver();
    }
  };

  const callDriver = () => {
    if (driver?.contactNumber) {
      window.location.href = `tel:${driver.contactNumber}`;
    }
  };

  if (!studentProfile) {
    return (
      <>
        <LoadingOverlay
          isOpen={isLoadingProfile}
          message="Loading ride status..."
          fallbackLabel="Try again"
          onFallback={() => void loadProfile()}
        />
        <ErrorDialog message={profileError} isBusy={isLoadingProfile} onRetry={loadProfile} />
      </>
    );
  }

  return (
    <section aria-labelledby="student-dashboard-heading">
      <StudentHeader name={studentProfile.studentFullName ?? 'Student'} status={headerStatus} />

      <StudentRideProgress
        tripOrigin={studentProfile.tripOrigin}
        serviceStatus={studentProfile.serviceStatus}
        pickedUpAt={studentProfile.pickedUpAt}
        droppedOffAt={studentProfile.droppedOffAt}
      />

      <div className="grid grid-cols-2 gap-4">
        <button
          className="dashboard-tile bg-sky-soft text-sky-dark"
          type="button"
          onClick={openMapDialog}
        >
          <Map className="size-8 shrink-0" aria-hidden="true" strokeWidth={2.5} />
          <span>
            <strong className="block font-display text-lg">Live Map</strong>
            <small>Track the car</small>
          </span>
        </button>
        <button
          className="dashboard-tile bg-leaf-soft text-leaf-dark"
          type="button"
          onClick={openDriverDialog}
        >
          <ContactRound className="size-8 shrink-0" aria-hidden="true" strokeWidth={2.5} />
          <span>
            <strong className="block font-display text-lg">Driver</strong>
            <small>Your driver details</small>
          </span>
        </button>
        <Link
          className="dashboard-tile bg-blush-soft text-[#c95f7d] no-underline"
          to="/student/profile"
        >
          <UserRound className="size-8 shrink-0" aria-hidden="true" strokeWidth={2.5} />
          <span>
            <strong className="block font-display text-lg">Profile</strong>
            <small>Student details</small>
          </span>
        </Link>
        <button
          className="dashboard-tile bg-[#fff6d8] text-[#a87500]"
          type="button"
          aria-disabled={driver?.contactNumber ? 'false' : 'true'}
          onClick={callDriver}
        >
          <Phone className="size-8 shrink-0" aria-hidden="true" strokeWidth={2.5} />
          <span>
            <strong className="block font-display text-lg">Call Driver</strong>
            <small>Tap to ring</small>
          </span>
        </button>
      </div>

      <dialog
        ref={mapDialogRef}
        aria-labelledby="live-route-heading"
        className="ui-dialog"
        onClose={() => setIsMapDialogOpen(false)}
      >
        <div className="h-96 bg-sky-soft p-5">
          <div className="flex items-center justify-between">
            <h2 id="live-route-heading" className="section-heading">
              Live route
            </h2>
            <button
              className="size-11 rounded-full bg-white text-xl font-bold"
              type="button"
              aria-label="Close map"
              onClick={() => mapDialogRef.current?.close()}
            >
              <X className="mx-auto size-5" aria-hidden="true" strokeWidth={3} />
            </button>
          </div>
          <div className="mt-5">
            <GoogleVehicleMap isActive={isMapDialogOpen} location={driverLocation} />
          </div>
        </div>
        <div className="p-5">
          <p className="font-display text-xl font-bold">
            {studentProfile.tripOrigin === 'HOME' ? 'On the way to school' : 'Heading home'}
          </p>
          <p className="body-copy">{mapStatus}</p>
        </div>
      </dialog>

      <dialog
        ref={driverDialogRef}
        aria-labelledby="driver-details-heading"
        className="ui-dialog driver-id-dialog"
      >
        <h2 id="driver-details-heading" className="sr-only">
          Driver details
        </h2>
        <div className="driver-id-dialog__header" aria-hidden="true">
          <span className="driver-id-dialog__header-label">Driver's Details</span>
          <Cloud
            className="driver-id-dialog__cloud driver-id-dialog__cloud--left"
            fill="currentColor"
          />
          <Cloud
            className="driver-id-dialog__cloud driver-id-dialog__cloud--right"
            fill="currentColor"
          />
          <Star
            className="driver-id-dialog__star driver-id-dialog__star--large"
            fill="currentColor"
          />
          <Star
            className="driver-id-dialog__star driver-id-dialog__star--small"
            fill="currentColor"
          />
          <img className="driver-id-dialog__car" src={schoolCar} alt="" />
        </div>
        <button
          className="driver-id-dialog__close"
          type="button"
          aria-label="Close driver details"
          onClick={() => driverDialogRef.current?.close()}
        >
          <X className="size-6" aria-hidden="true" strokeWidth={3} />
        </button>
        <div className="driver-id-dialog__content">
          <LoadingOverlay
            isOpen={isLoadingDriver}
            message="Loading driver details..."
            fallbackLabel="Close"
            onFallback={() => {
              setIsLoadingDriver(false);
              driverDialogRef.current?.close();
            }}
          />
          <ToastNotification
            message={driverError}
            variant="error"
            onClose={() => setDriverError('')}
          />

          {driverError ? (
            <div className="grid gap-4">
              <button
                className="ui-button-secondary"
                type="button"
                onClick={() => void loadAssignedDriver()}
              >
                Try again
              </button>
            </div>
          ) : null}

          {driver && !isLoadingDriver ? (
            <div className="driver-id-dialog__identity">
              <div
                className="driver-id-dialog__photo"
                aria-hidden={driver.profilePhotoUrl ? undefined : 'true'}
              >
                {driver.profilePhotoUrl ? (
                  <img src={driver.profilePhotoUrl} alt={`${driver.name}'s profile`} />
                ) : (
                  initialsFor(driver.name)
                )}
              </div>
              <h3 className="driver-id-dialog__name">{driver.name}</h3>
              <p className="driver-id-dialog__status">
                <span aria-hidden="true" /> Assigned driver
              </p>
              <dl className="driver-id-dialog__details">
                <div>
                  <dt>
                    <Car aria-hidden="true" strokeWidth={2.5} /> Vehicle type
                  </dt>
                  <dd>{driver.vehicleType ?? 'Not available'}</dd>
                </div>
                <div>
                  <dt>
                    <Hash aria-hidden="true" strokeWidth={2.5} /> Plate number
                  </dt>
                  <dd>{driver.vehiclePlateNumber ?? 'Not available'}</dd>
                </div>
                <div>
                  <dt>
                    <Phone aria-hidden="true" strokeWidth={2.5} /> Contact number
                  </dt>
                  <dd>{driver.contactNumber}</dd>
                </div>
                <div>
                  <dt>
                    <MapPin aria-hidden="true" strokeWidth={2.5} /> Address
                  </dt>
                  <dd>{driver.address ?? 'Not available'}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
        <footer className="driver-id-dialog__footer">
          <span>Driver ID</span>
          <span>Student carlift</span>
        </footer>
      </dialog>
    </section>
  );
};
