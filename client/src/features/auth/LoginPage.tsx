import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { ApiError } from '../../services/api/apiError';
import { authApi } from './auth.api';

const dashboardByRole = {
  ADMIN: '/student/dashboard',
  DRIVER: '/driver/dashboard',
  STUDENT: '/student/dashboard',
} as const;

const setupRouteByRole = {
  ADMIN: '/student/dashboard',
  DRIVER: '/driver/profile/setup',
  STUDENT: '/student/profile/setup',
} as const;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const formData = new FormData(event.currentTarget);

    try {
      const result = await authApi.login({
        mobileNumber: String(formData.get('mobileNumber') ?? ''),
        password: String(formData.get('password') ?? ''),
      });

      setSession(result.user, result.token);
      navigate(result.user.profileCompleted ? dashboardByRole[result.user.role] : setupRouteByRole[result.user.role], {
        replace: true,
      });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Login failed');
    }
  };

  return (
    <section className="auth-panel" aria-labelledby="login-heading">
      <h1 id="login-heading">Sign in</h1>
      <p className="form-error" role="alert">
        {error}
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="mobileNumber">Mobile number</label>
        <input id="mobileNumber" name="mobileNumber" autoComplete="tel" required placeholder="0501234567" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />

        <button type="submit">Sign in</button>
      </form>
      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p>
        Need an account? <Link to="/register">Register</Link>
      </p>
    </section>
  );
};
