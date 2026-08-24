import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
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
    <section className="content-panel" aria-labelledby="driver-profile-setup-heading">
      <h1 id="driver-profile-setup-heading">Driver profile setup</h1>
      <p className="form-error" role="alert">
        {error}
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="fullName">Driver full name</label>
        <input id="fullName" name="fullName" required autoComplete="name" />

        <label htmlFor="profilePhotoUrl">Profile photo URL</label>
        <input id="profilePhotoUrl" name="profilePhotoUrl" type="url" />

        <button type="submit">Save profile</button>
      </form>
    </section>
  );
};
