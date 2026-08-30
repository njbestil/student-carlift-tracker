import { useCallback, useEffect, useRef, useState } from 'react';
import { ContactRound, Map, Phone, UserRound, X } from 'lucide-react';
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

const STUDENT_LOCATION_POLL_INTERVAL_MS = 30_000;
const STUDENT_STATUS_POLL_INTERVAL_MS = 20_000;

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
      setProfileError(caughtError instanceof ApiError ? caughtError.message : 'Unable to load ride status.');
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
      setDriverError(caughtError instanceof ApiError ? caughtError.message : 'Unable to load driver details.');
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
      setMapStatus(location ? formatLocationAge(location.recordedAt) : 'Waiting for the driver location.');
    } catch (caughtError) {
      setMapStatus(caughtError instanceof ApiError ? caughtError.message : 'Unable to load the live route.');
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
      <h1 id="student-dashboard-heading" className="sr-only">
        Student Dashboard
      </h1>
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
            {(studentProfile.tripOrigin === "HOME")? "On the way to school" : "Heading home"}
          </p>
          <p className="body-copy">{mapStatus}</p>
        </div>
      </dialog>

      <dialog
        ref={driverDialogRef}
        aria-labelledby="driver-details-heading"
        className="ui-dialog"
      >
        <div className="flex items-center justify-between border-b-2 border-line p-5">
          <h2 id="driver-details-heading" className="section-heading">
            Your driver
          </h2>
          <button
            className="size-11 rounded-full bg-white text-xl font-bold"
            type="button"
            aria-label="Close driver details"
            onClick={() => driverDialogRef.current?.close()}
          >
            <X className="mx-auto size-5" aria-hidden="true" strokeWidth={3} />
          </button>
        </div>
        <div className="px-5 py-7">
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
              <button className="ui-button-secondary" type="button" onClick={() => void loadAssignedDriver()}>
                Try again
              </button>
            </div>
          ) : null}

          {driver && !isLoadingDriver ? (
            <dl className="grid gap-4">
              <div>
                <dt className="ui-label">Name</dt>
                <dd className="body-copy">{driver.name}</dd>
              </div>
              <div>
                <dt className="ui-label">Address</dt>
                <dd className="body-copy">{driver.address ?? 'Not available'}</dd>
              </div>
              <div>
                <dt className="ui-label">Contact number</dt>
                <dd className="body-copy">{driver.contactNumber}</dd>
              </div>
              <div>
                <dt className="ui-label">Vehicle type</dt>
                <dd className="body-copy">{driver.vehicleType ?? 'Not available'}</dd>
              </div>
              <div>
                <dt className="ui-label">Vehicle plate number</dt>
                <dd className="body-copy">{driver.vehiclePlateNumber ?? 'Not available'}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </dialog>
    </section>
  );
};
