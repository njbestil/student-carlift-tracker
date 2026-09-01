import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthScaffold } from '../../components/ui/AuthScaffold';
import { LoadingButton } from '../../components/ui/LoadingButton';
import { ToastNotification, type ToastVariant } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { authApi } from './auth.api';
import { normalizeUaeMobileNumber, uaeMobileNumberPattern } from '../../utils/uaeMobileNumber';

export const ResetPasswordPage = () => {
  const resetToken = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '';
  const [message, setMessage] = useState('');
  const [messageVariant, setMessageVariant] = useState<ToastVariant>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    setMessage('');
    setIsSubmitting(true);
    const formData = new FormData(form);

    try {
      const result = await authApi.resetPassword({
        mobileNumber: String(formData.get('mobileNumber') ?? ''),
        newPassword: String(formData.get('newPassword') ?? ''),
        confirmPassword: String(formData.get('confirmPassword') ?? ''),
        resetToken,
      });
      setMessageVariant('success');
      setMessage(result.message);
      form.reset();
    } catch (caughtError) {
      setMessageVariant('error');
      setMessage(caughtError instanceof ApiError ? caughtError.message : 'Unable to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      headingId="reset-password-heading"
      title="Choose a new key"
      subtitle="Set a new password for your account."
    >
      <ToastNotification
        message={message}
        variant={messageVariant}
        onClose={() => setMessage('')}
      />
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
          <label className="ui-label" htmlFor="newPassword">
            New Password
          </label>
          <input
            className="ui-field"
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
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
            minLength={8}
            required
          />
        </div>
        <LoadingButton className="ui-button-success" type="submit" isLoading={isSubmitting} loadingLabel="Resetting password...">
          Reset Password
        </LoadingButton>
      </form>
      <Link className="ui-button-secondary mt-7" to="/login">
        Back to Log In
      </Link>
    </AuthScaffold>
  );
};
