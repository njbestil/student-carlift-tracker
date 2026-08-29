import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { studentsApi } from './students.api';
import { StudentProfileForm } from './components/StudentProfileForm';

export const StudentProfileSetupPage = () => {
  const navigate = useNavigate();
  const { token, user, updateUser } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (values: Parameters<typeof studentsApi.updateMe>[0]) => {
    setError('');

    if (!token || !user) {
      setError('You must be signed in to save your profile.');
      return;
    }

    try {
      await studentsApi.updateMe(values, token);
      updateUser({ ...user, profileCompleted: true });
      navigate('/student/dashboard', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to save profile');
    }
  };

  return (
    <section aria-labelledby="student-profile-setup-heading">
      <div className="text-center">
        <h1 id="student-profile-setup-heading" className="display-heading">
          Tell us about your rider
        </h1>
        <p className="body-copy">A few details help every pickup feel safe and familiar.</p>
      </div>
      <ToastNotification message={error} variant="error" onClose={() => setError('')} />
      <StudentProfileForm
        initialValues={{ studentFullName: '', parentFullName: '', completeAddress: '', emergencyNumber: '', profilePhotoUrl: '' }}
        onSubmit={handleSubmit}
        submitLabel="Save Profile"
      />
    </section>
  );
};
