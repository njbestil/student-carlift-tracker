import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { DriverProfileForm } from './components/DriverProfileForm';
import { driversApi, type DriverProfilePayload } from './drivers.api';

const emptyProfile: DriverProfilePayload = {
  fullName: '',
  address: '',
  vehicleType: '',
  vehiclePlateNumber: '',
  profilePhotoUrl: '',
};

export const DriverProfileSetupPage = () => {
  const navigate = useNavigate();
  const { token, user, updateUser } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DriverProfilePayload) => {
    if (isSubmitting) return;

    setError('');

    if (!token || !user) {
      setError('You must be signed in to save your profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      await driversApi.updateMe(values, token);
      updateUser({ ...user, profileCompleted: true });
      navigate('/driver/dashboard', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="driver-profile-setup-heading">
      <div className="text-center">
        <h1 id="driver-profile-setup-heading" className="display-heading">
          Driver Profile
        </h1>
        <p className="body-copy">Your info helps families ride with a smile.</p>
      </div>

      <ToastNotification message={error} variant="error" onClose={() => setError('')} />
      <DriverProfileForm
        initialValues={{ ...emptyProfile, contactNumber: user?.mobileNumber ?? '' }}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        submitLabel="Save Profile"
      />
    </section>
  );
};
