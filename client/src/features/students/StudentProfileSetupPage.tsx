import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { ApiError } from '../../services/api/apiError';
import { studentsApi } from './students.api';

export const StudentProfileSetupPage = () => {
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
      await studentsApi.updateMe(
        {
          studentFullName: String(formData.get('studentFullName') ?? ''),
          parentFullName: String(formData.get('parentFullName') ?? ''),
          completeAddress: String(formData.get('completeAddress') ?? ''),
          emergencyNumber: String(formData.get('emergencyNumber') ?? ''),
          profilePhotoUrl: String(formData.get('profilePhotoUrl') ?? ''),
        },
        token,
      );
      updateUser({ ...user, profileCompleted: true });
      navigate('/student/dashboard', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to save profile');
    }
  };

  return (
    <section className="content-panel" aria-labelledby="student-profile-setup-heading">
      <h1 id="student-profile-setup-heading">Student profile setup</h1>
      <p>Primary mobile number: {user?.mobileNumber}</p>
      <p className="form-error" role="alert">
        {error}
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="studentFullName">Student full name</label>
        <input id="studentFullName" name="studentFullName" required autoComplete="name" />

        <label htmlFor="parentFullName">Parent full name</label>
        <input id="parentFullName" name="parentFullName" required autoComplete="name" />

        <label htmlFor="completeAddress">Complete address</label>
        <textarea id="completeAddress" name="completeAddress" required rows={4} autoComplete="street-address" />

        <label htmlFor="emergencyNumber">Emergency mobile number</label>
        <input id="emergencyNumber" name="emergencyNumber" required autoComplete="tel" placeholder="0501234567" />

        <label htmlFor="profilePhotoUrl">Profile photo URL</label>
        <input id="profilePhotoUrl" name="profilePhotoUrl" type="url" />

        <button type="submit">Save profile</button>
      </form>
    </section>
  );
};
