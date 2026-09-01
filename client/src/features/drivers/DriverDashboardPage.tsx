import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../app/providers/useAuth';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { driversApi } from './drivers.api';
import { useDriverLocationPublisher } from '../tracking/useDriverLocationPublisher';
import { AssignedStudentCard } from './components/AssignedStudentCard';
import { DriverRideStatusCard } from './components/DriverRideStatusCard';
import { DriverTripCard } from './components/DriverTripCard';
import { StudentLocationDialog } from './components/StudentLocationDialog';
import type { AssignedStudent, DriverDashboard, StudentServiceStatus } from './drivers.api';

export const DriverDashboardPage = () => {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [isStartingTrip, setIsStartingTrip] = useState(false);
  const [isCancellingTrip, setIsCancellingTrip] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null);
  const onService = dashboard?.profile?.isOnService ?? false;
  const locationPublisher = useDriverLocationPublisher(token, onService);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setError('You must be signed in to view the dashboard.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      setDashboard(await driversApi.getDashboard(token));
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to load driver details.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const toggleService = async () => {
    if (!token || isUpdatingService || !dashboard?.profile) return;

    setIsUpdatingService(true);
    setError('');
    try {
      const { profile } = await driversApi.updateServiceStatus(!onService, token);
      setDashboard((current) => current ? { ...current, profile } : current);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to update service status.');
    } finally {
      setIsUpdatingService(false);
    }
  };

  const updateStudentStatus = async (student: AssignedStudent, serviceStatus: StudentServiceStatus) => {
    if (!token || updatingStudentId) return;

    setUpdatingStudentId(student.userId);
    setError('');
    try {
      const result = await driversApi.updateStudentServiceStatus(student.userId, serviceStatus, token);
      setDashboard((current) => current ? {
        ...current,
        activeTrip: result.trip.status === 'IN_PROGRESS' ? result.trip : null,
        students: current.students.map((rider) => rider.userId === student.userId ? { ...rider, serviceStatus } : rider),
      } : current);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to update student status.');
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const startTrip = async (tripOrigin: 'HOME' | 'SCHOOL') => {
    if (!token || isStartingTrip) return;

    setIsStartingTrip(true);
    setError('');
    try {
      await driversApi.startTrip(tripOrigin, token);
      await loadDashboard();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to start the trip.');
    } finally {
      setIsStartingTrip(false);
    }
  };

  const cancelActiveTrip = async () => {
    if (!token || isCancellingTrip) return;

    setIsCancellingTrip(true);
    setError('');
    try {
      await driversApi.cancelActiveTrip(token);
      setDashboard((current) => current ? { ...current, activeTrip: null } : current);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to cancel the trip.');
    } finally {
      setIsCancellingTrip(false);
    }
  };

  const students = dashboard?.students ?? [];
  const onBoardCount = students.filter((student) => student.serviceStatus === 'PICKED_UP').length;
  const driverName = dashboard?.profile?.fullName ?? 'Driver';

  return (
    <section aria-labelledby="driver-dashboard-heading" aria-busy={isLoading ? 'true' : 'false'}>
      <ToastNotification
        message={error}
        variant="error"
        onClose={() => setError('')}
      />
      <LoadingOverlay isOpen={isLoading} message="Loading your riders..." fallbackLabel="Try again" onFallback={() => void loadDashboard()} />

      {!isLoading && dashboard ? <>
        <div className="mb-5">
          <h1 id="driver-dashboard-heading" className="display-heading">Hi, {driverName? driverName.split(" ")[0] : 'Driver'}!</h1>
          <p className="body-copy">{onBoardCount} {onBoardCount === 1 ? 'student' : 'students'} on board &middot; {students.length} total</p>
        </div>
        <DriverRideStatusCard isOnService={onService} isUpdating={isUpdatingService} locationMessage={locationPublisher.message} onToggle={toggleService} />
        <DriverTripCard
          activeTrip={dashboard.activeTrip}
          students={students}
          isStarting={isStartingTrip}
          isCancelling={isCancellingTrip}
          onStart={startTrip}
          onCancel={cancelActiveTrip}
        />
        <h2 className="section-heading mb-4">Today's Riders</h2>
        {students.length ? <div className="grid gap-4">
          {students.map((student) => <AssignedStudentCard key={student.userId} student={student} isTripActive={dashboard.activeTrip !== null} isUpdating={updatingStudentId === student.userId} onOpenMap={setSelectedStudent} onStatusChange={(nextStudent, status) => void updateStudentStatus(nextStudent, status)} />)}
        </div> : <p className="ui-card body-copy">No students are assigned to you yet.</p>}
      </> : null}
      <StudentLocationDialog student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </section>
  );
};
