export const uaeMobileNumberPattern = '05[0-9]{8}';

export const normalizeUaeMobileNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const localNumber = digits.startsWith('971') ? `0${digits.slice(3)}` : digits;

  return localNumber.slice(0, 10);
};

export const isUaeMobileNumber = (value: string) => new RegExp(`^${uaeMobileNumberPattern}$`).test(value);
