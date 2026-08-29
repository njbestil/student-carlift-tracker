import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { AuthScaffold } from '../../components/ui/AuthScaffold';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { authApi } from './auth.api';
import { normalizeUaeMobileNumber, uaeMobileNumberPattern } from '../../utils/uaeMobileNumber';

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
    <AuthScaffold
      headingId="register-heading"
      title="Join the ride!"
      subtitle="Create a parent account, then tell us about your student."
    >
      <ToastNotification message={error} variant="error" onClose={() => setError('')} />
      <form className="form-stack" onSubmit={handleSubmit}>
        <div>
          <label className="ui-label" htmlFor="mobileNumber">
            Mobile Number
          </label>
          <input
            className="ui-field"
            id="mobileNumber"
            name="mobileNumber"
            autoComplete="tel"
            inputMode="tel"
            pattern={uaeMobileNumberPattern}
            maxLength={10}
            onChange={(event) => {
              event.currentTarget.value = normalizeUaeMobileNumber(event.currentTarget.value);
            }}
            required
            placeholder="0501234567"
          />
        </div>
        <div>
          <label className="ui-label" htmlFor="password">
            Password
          </label>
          <input
            className="ui-field"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="ui-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="ui-field"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        <button className="ui-button-success" type="submit">
          Create Account
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-muted">
        Already registered?{' '}
        <Link className="font-extrabold text-sky-dark" to="/login">
          Log In
        </Link>
      </p>
    </AuthScaffold>
  );
};
