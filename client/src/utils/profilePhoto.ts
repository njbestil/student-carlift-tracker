const supportedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const maxProfilePhotoSizeBytes = 1024 * 1024;
export const maxProfilePhotoDimension = 1280;

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve({ width: image.naturalWidth, height: image.naturalHeight });
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Unable to read image dimensions'));
  };
  image.src = objectUrl;
});

export const validateProfilePhoto = async (file: File): Promise<string | null> => {
  if (!supportedPhotoTypes.has(file.type)) {
    return 'Choose a JPEG, PNG, or WebP image.';
  }

  if (file.size > maxProfilePhotoSizeBytes) {
    return 'Choose an image smaller than 1 MB.';
  }

  try {
    const { width, height } = await getImageDimensions(file);

    if (width > maxProfilePhotoDimension || height > maxProfilePhotoDimension) {
      return 'Choose a photo no larger than 1280 × 1280 pixels.';
    }
  } catch {
    return 'Unable to read that image. Try another file.';
  }

  return null;
};
