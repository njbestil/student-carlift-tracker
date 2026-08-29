const pluralize = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`;

export const formatLocationAge = (recordedAt: string, now = Date.now()) => {
  const recordedAtTime = new Date(recordedAt).getTime();

  if (Number.isNaN(recordedAtTime)) {
    return 'Last updated time unavailable.';
  }

  const ageInSeconds = Math.max(0, Math.round((now - recordedAtTime) / 1000));

  if (ageInSeconds < 45) {
    return 'updated just now';
  }

  const ageInMinutes = Math.round(ageInSeconds / 60);

  if (ageInMinutes < 60) {
    return `updated ${pluralize(ageInMinutes, 'minute')} ago`;
  }

  const hours = Math.floor(ageInMinutes / 60);
  const minutes = ageInMinutes % 60;
  const duration =
    minutes === 0
      ? pluralize(hours, 'hour')
      : `${pluralize(hours, 'hour')} ${pluralize(minutes, 'minute')}`;

  return `updated ${duration} ago`;
};
