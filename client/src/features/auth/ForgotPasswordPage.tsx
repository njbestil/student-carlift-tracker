import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../services/api/apiError';
import { authApi } from './auth.api';

export const ForgotPasswordPage = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    const formData = new FormData(event.currentTarget);

    try {
      const result = await authApi.forgotPassword(String(formData.get('mobileNumber') ?? ''));
      setMessage(result.message);
    } catch (caughtError) {
      setMessage(caughtError instanceof ApiError ? caughtError.message : 'Unable to submit reset request');
    }
  };

  return (
    <section className="auth-panel" aria-labelledby="forgot-password-heading">
      <h1 id="forgot-password-heading">Forgot password</h1>
      <p className="form-status" role="status">
        {message}
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="mobileNumber">Mobile number</label>
        <input id="mobileNumber" name="mobileNumber" autoComplete="tel" required placeholder="0501234567" />

        <button type="submit">Request reset</button>
      </form>
      <p>
        <Link to="/login">Back to sign in</Link>
      </p>
    </section>
  );
};
