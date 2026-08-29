import { type ChangeEvent, type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { Camera, MapPin, UserRound } from 'lucide-react';
import { GoogleMapsLocatorDialog, type LocationSelection } from '../../../components/GoogleMapsLocatorDialog';
import type { DriverProfilePayload } from '../drivers.api';

type DriverProfileFormValues = DriverProfilePayload & { contactNumber: string };

type DriverProfileFormProps = {
  initialValues: DriverProfileFormValues;
  isSubmitting?: boolean;
  onSubmit: (values: DriverProfileFormValues) => Promise<void>;
  submitLabel: string;
};

const maxPhotoSizeBytes = 1024 * 1024;

export const DriverProfileForm = ({
  initialValues,
  isSubmitting = false,
  onSubmit,
  submitLabel,
}: DriverProfileFormProps) => {
  const [values, setValues] = useState<DriverProfileFormValues>(initialValues);
  const [isLocatorOpen, setIsLocatorOpen] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputId = useId();

  useEffect(() => setValues(initialValues), [initialValues]);

  const updateValue = (key: keyof DriverProfileFormValues, value: string | number) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file.');
      return;
    }
    if (file.size > maxPhotoSizeBytes) {
      setPhotoError('Choose an image smaller than 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateValue('profilePhotoUrl', reader.result);
        setPhotoError('');
      }
    };
    reader.onerror = () => setPhotoError('Unable to read that image. Try another file.');
    reader.readAsDataURL(file);
  };

  const handleLocationSelect = (location: LocationSelection) => {
    setValues((current) => ({
      ...current,
      address: location.address,
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
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-sky-soft text-ink shadow-[0_6px_0_#e6eef7]">
          {values.profilePhotoUrl ? <img className="size-full object-cover" src={values.profilePhotoUrl} alt="Driver profile" /> : <UserRound className="size-11" strokeWidth={2.5} />}
        </div>
        <input ref={fileInputRef} id={photoInputId} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhotoChange} />
        <button className="ui-button-secondary min-h-0 w-auto px-5 py-2 text-base" type="button" onClick={() => fileInputRef.current?.click()}>
          <Camera className="mr-2 size-5" aria-hidden="true" strokeWidth={2.5} />
          Change Photo
        </button>
        <p className="form-error min-h-0" role="alert">{photoError}</p>
      </div>

      <form className="ui-card form-stack mt-5" onSubmit={(event) => void handleSubmit(event)}>
        <div>
          <label className="ui-label" htmlFor="driverFullName">Name</label>
          <input className="ui-field" id="driverFullName" name="driverFullName" value={values.fullName} onChange={(event) => updateValue('fullName', event.target.value)} autoComplete="name" maxLength={120} required />
        </div>
        <div>
          <label className="ui-label" htmlFor="driverAddress">Address</label>
          <div className="relative">
            <input className="ui-field pr-16" id="driverAddress" name="driverAddress" value={values.address} onChange={(event) => updateValue('address', event.target.value)} autoComplete="street-address" maxLength={500} required />
            <button className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-sky-soft text-sky-dark" type="button" aria-label="Find address on Google Maps" onClick={() => setIsLocatorOpen(true)}>
              <MapPin className="size-5" aria-hidden="true" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div>
          <label className="ui-label" htmlFor="driverContactNumber">Contact number</label>
          <input className="ui-field" id="driverContactNumber" name="driverContactNumber" value={values.contactNumber} disabled autoComplete="tel" inputMode="tel" />
        </div>
        <div>
          <label className="ui-label" htmlFor="vehicleType">Vehicle type</label>
          <input className="ui-field" id="vehicleType" name="vehicleType" value={values.vehicleType} onChange={(event) => updateValue('vehicleType', event.target.value)} maxLength={120} required />
        </div>
        <div>
          <label className="ui-label" htmlFor="vehiclePlateNumber">Vehicle plate number</label>
          <input className="ui-field" id="vehiclePlateNumber" name="vehiclePlateNumber" value={values.vehiclePlateNumber} onChange={(event) => updateValue('vehiclePlateNumber', event.target.value)} maxLength={32} required />
        </div>
        <button className="ui-button-primary" type="submit" aria-disabled={isSubmitting ? 'true' : 'false'}>{isSubmitting ? 'Saving...' : submitLabel}</button>
      </form>

      <GoogleMapsLocatorDialog
        initialLocation={values.latitude !== undefined && values.longitude !== undefined
          ? { address: values.address, latitude: values.latitude, longitude: values.longitude }
          : null}
        isOpen={isLocatorOpen}
        onOpenChange={setIsLocatorOpen}
        onSelect={handleLocationSelect}
      />
    </>
  );
};
