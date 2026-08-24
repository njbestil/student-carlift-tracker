import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { ApiError } from '../../services/api/apiError';
import { authApi } from './auth.api';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const formData = new FormData(event.currentTarget);

    try {
      const result = await authApi.register({
        mobileNumber: String(formData.get('mobileNumber') ?? ''),
        password: String(formData.get('password') ?? ''),
        confirmPassword: String(formData.get('confirmPassword') ?? ''),
      });

      setSession(result.user, result.token);
      navigate('/student/profile/setup', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Registration failed');
    }
  };

  return (
    <section className="auth-panel" aria-labelledby="register-heading">
      <h1 id="register-heading">Create your account</h1>
      <p>Register with your mobile number only. Profile details are collected after login.</p>
      <p className="form-error" role="alert">
        {error}
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="mobileNumber">Mobile number</label>
        <input id="mobileNumber" name="mobileNumber" autoComplete="tel" required placeholder="0501234567" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />

        <button type="submit">Create account</button>
      </form>
      <p>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
};
