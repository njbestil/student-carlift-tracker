import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../app/providers/useAuth';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { DriverProfileForm } from './components/DriverProfileForm';
import { driversApi, type DriverProfile, type DriverProfilePayload } from './drivers.api';

const emptyProfile: DriverProfilePayload = {
  fullName: '',
  address: '',
  vehicleType: '',
  vehiclePlateNumber: '',
  profilePhotoUrl: '',
};

export const DriverProfilePage = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const { profile: savedProfile } = await driversApi.getMe(token);
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

  const handleSubmit = async (values: DriverProfilePayload) => {
    setError('');
    setMessage('');

    if (!token || !user) {
      setError('You must be signed in to save your profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { profile: savedProfile } = await driversApi.updateMe(values, token);
      setProfile(savedProfile);
      setMessage('Profile saved successfully.');
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const values = profile ?? emptyProfile;

  return (
    <section aria-labelledby="driver-profile-heading" aria-busy={loading}>
      <div className="text-center">
        <h1 id="driver-profile-heading" className="display-heading">
          Driver Profile
        </h1>
        <p className="body-copy">Your info helps families ride with a smile.</p>
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
          <DriverProfileForm
            initialValues={{
              ...values,
              address: values.address ?? '',
              vehicleType: values.vehicleType ?? '',
              vehiclePlateNumber: values.vehiclePlateNumber ?? '',
              profilePhotoUrl: values.profilePhotoUrl ?? '',
              latitude: values.latitude ?? undefined,
              longitude: values.longitude ?? undefined,
              contactNumber: user?.mobileNumber ?? '',
            }}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </>
      ) : null}
    </section>
  );
};
