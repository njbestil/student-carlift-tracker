import { Phone } from 'lucide-react';

type PhoneCallActionProps = {
  phoneNumber: string;
  label: string;
  ariaLabel: string;
  variant: 'contact' | 'emergency';
};

const phoneHref = (phoneNumber: string) => `tel:${phoneNumber.replace(/[^\d+]/g, '')}`;

export const PhoneCallAction = ({ phoneNumber, label, ariaLabel, variant }: PhoneCallActionProps) => (
  <a className={`ui-call-action ui-call-action--${variant}`} href={phoneHref(phoneNumber)} aria-label={ariaLabel}>
    <Phone className="size-5" aria-hidden="true" strokeWidth={2.75} /> {label}
  </a>
);
