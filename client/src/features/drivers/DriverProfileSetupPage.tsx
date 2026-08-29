import { FormEvent, useState } from 'react';
import { CircleGauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { driversApi } from './drivers.api';

export const DriverProfileSetupPage = () => {
  const navigate = useNavigate();
  const { token, user, updateUser } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!token || !user) {
      setError('You must be signed in to save your profile.');
      return;
    }

    const formData = new FormData(event.currentTarget);

    try {
      await driversApi.updateMe(
        {
          fullName: String(formData.get('fullName') ?? ''),
          profilePhotoUrl: String(formData.get('profilePhotoUrl') ?? ''),
        },
        token,
      );
      updateUser({ ...user, profileCompleted: true });
      navigate('/driver/dashboard', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to save profile');
    }
  };

  return (
    <section aria-labelledby="driver-profile-setup-heading">
      <div className="text-center">
        <h1 id="driver-profile-setup-heading" className="display-heading">
          Driver Profile
        </h1>
        <p className="body-copy">Your info helps families ride with a smile.</p>
        <div
          className="mx-auto mt-5 flex size-24 items-center justify-center rounded-full bg-sky-soft text-5xl shadow-[0_6px_0_#e6eef7]"
          aria-hidden="true"
        >
          <CircleGauge className="size-11" strokeWidth={2.5} />
        </div>
      </div>

      <ToastNotification message={error} variant="error" onClose={() => setError('')} />
      <form className="ui-card form-stack mt-2" onSubmit={handleSubmit}>
        <div>
          <label className="ui-label" htmlFor="fullName">
            Driver Full Name
          </label>
          <input className="ui-field" id="fullName" name="fullName" required autoComplete="name" />
        </div>
        <div>
          <label className="ui-label" htmlFor="profilePhotoUrl">
            Profile Photo URL <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            className="ui-field"
            id="profilePhotoUrl"
            name="profilePhotoUrl"
            type="url"
            inputMode="url"
          />
        </div>
        <button className="ui-button-primary" type="submit">
          Save Profile
        </button>
      </form>
    </section>
  );
};
