import { FormEvent, useCallback, useEffect, useState } from 'react';
import { CircleGauge } from 'lucide-react';
import { useAuth } from '../../app/providers/useAuth';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { usersApi } from '../users/users.api';
import { driversApi } from './drivers.api';
import { normalizeUaeMobileNumber, uaeMobileNumberPattern } from '../../utils/uaeMobileNumber';
import type { DriverProfile } from './drivers.api';

export const DriverProfilePage = () => {
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token || !user) {
      setError('You must be signed in to save your profile.');
      return;
    }

    const formData = new FormData(event.currentTarget);

    try {
      const [{ profile: savedProfile }, { user: savedUser }] = await Promise.all([
        driversApi.updateMe(
          {
            fullName: String(formData.get('fullName') ?? ''),
            profilePhotoUrl: String(formData.get('profilePhotoUrl') ?? ''),
          },
          token,
        ),
        usersApi.updateMe(String(formData.get('mobileNumber') ?? ''), token),
      ]);

      setProfile(savedProfile);
      updateUser(savedUser);
      setMessage('Profile saved successfully.');
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to save profile');
    }
  };

  return (
    <section aria-labelledby="driver-profile-heading" aria-busy={loading}>
      <div className="text-center">
        <h1 id="driver-profile-heading" className="display-heading">
          Driver Profile
        </h1>
        <p className="body-copy">Your info helps families ride with a smile.</p>
        <div
          className="mx-auto mt-5 flex size-24 items-center justify-center rounded-full border-4 border-white bg-sky-soft shadow-[0_6px_0_#e6eef7]"
          aria-hidden="true"
        >
          <CircleGauge className="size-11" strokeWidth={2.5} />
        </div>
      </div>

      <LoadingOverlay
        isOpen={loading}
        message="Loading profile..."
        fallbackLabel="Close"
        onFallback={() => setLoading(false)}
      />

      {!loading ? (
        <form className="ui-card form-stack mt-7" onSubmit={handleSubmit}>
          <div>
            <label className="ui-label" htmlFor="mobileNumber">
              Account Mobile
            </label>
            <input
              className="ui-field"
              id="mobileNumber"
              name="mobileNumber"
              defaultValue={user?.mobileNumber}
              autoComplete="tel"
              inputMode="tel"
              pattern={uaeMobileNumberPattern}
              maxLength={10}
              onChange={(event) => {
                event.currentTarget.value = normalizeUaeMobileNumber(event.currentTarget.value);
              }}
              required
            />
          </div>
          <div>
            <label className="ui-label" htmlFor="fullName">
              Driver Full Name
            </label>
            <input
              className="ui-field"
              id="fullName"
              name="fullName"
              defaultValue={profile?.fullName ?? ''}
              autoComplete="name"
              maxLength={120}
              required
            />
          </div>
          <div>
            <label className="ui-label" htmlFor="profilePhotoUrl">
              Profile Photo URL <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              className="ui-field"
              id="profilePhotoUrl"
              name="profilePhotoUrl"
              defaultValue={profile?.profilePhotoUrl ?? ''}
              type="url"
              inputMode="url"
            />
          </div>
          <ToastNotification message={error} variant="error" onClose={() => setError('')} />
          <ToastNotification message={message} variant="success" onClose={() => setMessage('')} />
          <button className="ui-button-primary" type="submit">
            Save Changes
          </button>
        </form>
      ) : null}
    </section>
  );
};
