import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../app/providers/useAuth';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { usersApi } from '../users/users.api';
import { studentsApi } from './students.api';
import type { StudentProfile, StudentProfilePayload } from './students.api';
import { StudentProfileForm } from './components/StudentProfileForm';

const emptyProfile: StudentProfilePayload = {
  studentFullName: '',
  parentFullName: '',
  completeAddress: '',
  emergencyNumber: '',
  profilePhotoUrl: '',
};

export const StudentProfilePage = () => {
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfile = useCallback(async (isActive: () => boolean = () => true) => {
    if (!token) {
      setError('You must be signed in to view your profile.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { profile: savedProfile } = await studentsApi.getMe(token);
      if (isActive()) setProfile(savedProfile);
    } catch (caughtError) {
      if (isActive()) {
        setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to load profile');
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    void loadProfile(() => active);
    return () => {
      active = false;
    };
  }, [loadProfile]);

  const handleSubmit = async (values: Parameters<typeof studentsApi.updateMe>[0] & { mobileNumber?: string }) => {
    setError('');
    setMessage('');

    if (!token || !user) {
      setError('You must be signed in to save your profile.');
      return;
    }

    try {
      const [{ profile: savedProfile }, { user: savedUser }] = await Promise.all([
        studentsApi.updateMe(values, token),
        usersApi.updateMe(values.mobileNumber ?? '', token),
      ]);

      setProfile(savedProfile);
      updateUser(savedUser);
      setMessage('Profile saved successfully.');
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to save profile');
    }
  };

  const values = profile ?? emptyProfile;

  return (
    <section aria-labelledby="student-profile-heading" aria-busy={loading}>
      <div className="text-center mb-5">
        <h1 id="student-profile-heading" className="display-heading">
          Student Profile
        </h1>
        <p className="body-copy">Student and parent details for a smooth ride.</p>
      </div>

      <LoadingOverlay
        isOpen={loading}
        message="Loading profile..."
        fallbackLabel="Close"
        onFallback={() => setLoading(false)}
      />

      {!loading ? (
        <>
          <ToastNotification message={error} variant="error" onClose={() => setError('')} />
          <ToastNotification message={message} variant="success" onClose={() => setMessage('')} />

          <StudentProfileForm
            includeAccountMobile
            initialValues={{
              ...values,
              latitude: values.latitude ?? undefined,
              longitude: values.longitude ?? undefined,
              mobileNumber: user?.mobileNumber ?? '',
              profilePhotoUrl: values.profilePhotoUrl ?? '',
            }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </>
      ) : null}
    </section>
  );
};
