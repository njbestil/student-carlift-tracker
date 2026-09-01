import { FormEvent, useEffect, useState } from 'react';
import { MapPin, UserRound } from 'lucide-react';
import { GoogleMapsLocatorDialog, type LocationSelection } from '../../../components/GoogleMapsLocatorDialog';
import { LoadingButton } from '../../../components/ui/LoadingButton';
import { ProfilePhotoPicker } from '../../../components/ui/ProfilePhotoPicker';
import { normalizeUaeMobileNumber, uaeMobileNumberPattern } from '../../../utils/uaeMobileNumber';
import type { StudentProfilePayload } from '../students.api';

type StudentProfileFormValues = StudentProfilePayload & { mobileNumber?: string };

type StudentProfileFormProps = {
  initialValues: StudentProfileFormValues;
  includeAccountMobile?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: StudentProfileFormValues) => Promise<void>;
  submitLabel: string;
};

export const StudentProfileForm = ({
  initialValues,
  includeAccountMobile = false,
  isSubmitting = false,
  onSubmit,
  submitLabel,
}: StudentProfileFormProps) => {
  const [values, setValues] = useState<StudentProfileFormValues>(initialValues);
  const [isLocatorOpen, setIsLocatorOpen] = useState(false);

  useEffect(() => setValues(initialValues), [initialValues]);

  const updateValue = (key: keyof StudentProfileFormValues, value: string | number) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleLocationSelect = (location: LocationSelection) => {
    setValues((current) => ({
      ...current,
      completeAddress: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    await onSubmit(values);
  };

  return (
    <>
      <div className="mx-auto mt-5 grid justify-items-center gap-3">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blush-soft text-ink shadow-[0_6px_0_#e6eef7]">
          {values.profilePhotoUrl ? <img className="size-full object-cover" src={values.profilePhotoUrl} alt="Student profile" /> : <UserRound className="size-11" strokeWidth={2.5} />}
        </div>
        <ProfilePhotoPicker onPhotoChange={(photoUrl) => updateValue('profilePhotoUrl', photoUrl)} />
      </div>

      <form className="ui-card form-stack mt-5" onSubmit={(event) => void handleSubmit(event)}>
        {includeAccountMobile ? <div>
          <label className="ui-label" htmlFor="mobileNumber">Account Mobile</label>
          <input className="ui-field" id="mobileNumber" name="mobileNumber" value={values.mobileNumber ?? ''} disabled onChange={(event) => updateValue('mobileNumber', normalizeUaeMobileNumber(event.target.value))} autoComplete="tel" inputMode="tel" pattern={uaeMobileNumberPattern} maxLength={10} required />
        </div> : null}
        <div>
          <label className="ui-label" htmlFor="studentFullName">Student Full Name</label>
          <input className="ui-field" id="studentFullName" name="studentFullName" value={values.studentFullName} onChange={(event) => updateValue('studentFullName', event.target.value)} autoComplete="name" maxLength={120} required />
        </div>
        <div>
          <label className="ui-label" htmlFor="parentFullName">Parent Full Name</label>
          <input className="ui-field" id="parentFullName" name="parentFullName" value={values.parentFullName} onChange={(event) => updateValue('parentFullName', event.target.value)} autoComplete="name" maxLength={120} required />
        </div>
        <div>
          <label className="ui-label" htmlFor="completeAddress">Complete Address</label>
          <div className="relative">
            <input className="ui-field pr-16" id="completeAddress" name="completeAddress" value={values.completeAddress} onChange={(event) => updateValue('completeAddress', event.target.value)} autoComplete="street-address" maxLength={1000} required />
            <button className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-sky-soft text-sky-dark" type="button" aria-label="Find address on Google Maps" onClick={() => setIsLocatorOpen(true)}>
              <MapPin className="size-5" aria-hidden="true" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div>
          <label className="ui-label" htmlFor="emergencyNumber">Emergency Mobile Number</label>
          <input className="ui-field" id="emergencyNumber" name="emergencyNumber" value={values.emergencyNumber} onChange={(event) => updateValue('emergencyNumber', normalizeUaeMobileNumber(event.target.value))} autoComplete="tel" inputMode="tel" pattern={uaeMobileNumberPattern} maxLength={10} placeholder="0501234567" required />
        </div>
        <LoadingButton className="ui-button-primary" type="submit" isLoading={isSubmitting} loadingLabel="Saving...">
          {submitLabel}
        </LoadingButton>
      </form>

      <GoogleMapsLocatorDialog
        initialLocation={values.latitude !== undefined && values.longitude !== undefined
          ? { address: values.completeAddress, latitude: values.latitude, longitude: values.longitude }
          : null}
        isOpen={isLocatorOpen}
        onOpenChange={setIsLocatorOpen}
        onSelect={handleLocationSelect}
      />
    </>
  );
};
