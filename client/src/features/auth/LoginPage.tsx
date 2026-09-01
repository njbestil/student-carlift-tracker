import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { AuthScaffold } from '../../components/ui/AuthScaffold';
import { LoadingButton } from '../../components/ui/LoadingButton';
import { ToastNotification } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { authApi } from './auth.api';
import { normalizeUaeMobileNumber, uaeMobileNumberPattern } from '../../utils/uaeMobileNumber';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const result = await authApi.login({
        mobileNumber: String(formData.get('mobileNumber') ?? ''),
        password: String(formData.get('password') ?? ''),
      });

      setSession(result.user, result.token);
      navigate(
        result.user.profileCompleted
          ? dashboardByRole[result.user.role]
          : setupRouteByRole[result.user.role],
        {
          replace: true,
        },
      );
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      headingId="login-heading"
      title={
        <>
          Welcome back! 🚗
        </>
      }
      subtitle="Let's get your little one safely on the way."
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
            autoComplete="current-password"
            required
            placeholder="Your secret word"
          />
        </div>
        <Link
          className="-mt-2 text-right text-sm font-extrabold text-sky-dark no-underline"
          to="/forgot-password"
        >
          Forgot Password?
        </Link>
        <LoadingButton
          className="ui-button-primary disabled:cursor-wait disabled:opacity-70 disabled:shadow-[0_4px_0_#3f7fdc]"
          type="submit"
          isLoading={isSubmitting}
          loadingLabel="Logging in..."
        >
          Log In
        </LoadingButton>
      </form>
      <p className="mt-7 text-center text-sm text-muted">new here?</p>
      <Link className="ui-button-secondary mt-3" to="/register">
        Create an Account
      </Link>
    </AuthScaffold>
  );
};
