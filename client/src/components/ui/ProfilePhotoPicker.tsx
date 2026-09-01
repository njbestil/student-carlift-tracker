import { Camera, Images } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { validateProfilePhoto } from '../../utils/profilePhoto';

type ProfilePhotoPickerProps = {
  onPhotoChange: (photoUrl: string) => void;
};

export const ProfilePhotoPicker = ({ onPhotoChange }: ProfilePhotoPickerProps) => {
  const [error, setError] = useState('');
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputId = useId();
  const cameraInputId = useId();

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    detailsRef.current?.removeAttribute('open');
    if (!file) return;

    const validationError = await validateProfilePhoto(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoChange(reader.result);
        setError('');
      }
    };
    reader.onerror = () => setError('Unable to read that image. Try another file.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid justify-items-center gap-3">
      <input ref={galleryInputRef} id={galleryInputId} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void handlePhotoChange(event)} />
      <input ref={cameraInputRef} id={cameraInputId} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" capture="user" onChange={(event) => void handlePhotoChange(event)} />
      <details ref={detailsRef} className="relative">
        <summary className="ui-button-secondary min-h-0 w-auto list-none px-5 py-2 text-base [&::-webkit-details-marker]:hidden">
          <Camera className="mr-2 size-5" aria-hidden="true" strokeWidth={2.5} />
          Change photo
        </summary>
        <div className="ui-card absolute left-1/2 z-10 mt-2 grid w-64 -translate-x-1/2 gap-3 bg-[#f7fbff] px-5 pb-7">
          <button className="ui-button-secondary min-h-0 border-[#f6c7d7] bg-[#fff0f4] px-4 py-2 text-base text-[#b94f70] shadow-[0_4px_0_#f3d7e1] active:shadow-[0_2px_0_#f3d7e1]" type="button" onClick={() => galleryInputRef.current?.click()}>
            <Images className="mr-2 size-5" aria-hidden="true" strokeWidth={2.5} />
            Upload from gallery
          </button>
          <button className="ui-button-secondary min-h-0 border-[#c6e0fa] bg-[#eaf6ff] px-4 py-2 text-base text-[#3f7fdc] shadow-[0_4px_0_#d6e9fa] active:shadow-[0_2px_0_#d6e9fa]" type="button" onClick={() => cameraInputRef.current?.click()}>
            <Camera className="mr-2 size-5" aria-hidden="true" strokeWidth={2.5} />
            Take a photo
          </button>
        </div>
      </details>
      <p className="form-error min-h-0" role="alert">{error}</p>
    </div>
  );
};
