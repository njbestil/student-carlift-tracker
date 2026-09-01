import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthScaffold } from '../../components/ui/AuthScaffold';
import { LoadingButton } from '../../components/ui/LoadingButton';
import { ToastNotification, type ToastVariant } from '../../components/ui/ToastNotification';
import { ApiError } from '../../services/api/apiError';
import { authApi } from './auth.api';
import { normalizeUaeMobileNumber, uaeMobileNumberPattern } from '../../utils/uaeMobileNumber';

export const ForgotPasswordPage = () => {
  const [message, setMessage] = useState('');
  const [messageVariant, setMessageVariant] = useState<ToastVariant>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setMessage('');
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const result = await authApi.forgotPassword(String(formData.get('mobileNumber') ?? ''));
      setMessageVariant('info');
      setMessage(result.message);
    } catch (caughtError) {
      setMessageVariant('error');
      setMessage(
        caughtError instanceof ApiError ? caughtError.message : 'Unable to submit reset request',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      headingId="forgot-password-heading"
      title="Find your key"
      subtitle="Enter your mobile number and we'll help you get back in."
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
        <LoadingButton className="ui-button-primary" type="submit" isLoading={isSubmitting} loadingLabel="Requesting reset...">
          Request Reset
        </LoadingButton>
      </form>
      <Link className="ui-button-secondary mt-7" to="/login">
        Back to Log In
      </Link>
    </AuthScaffold>
  );
};
