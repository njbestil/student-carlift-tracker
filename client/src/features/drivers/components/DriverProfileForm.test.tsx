import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DriverProfileForm } from './DriverProfileForm';

describe('DriverProfileForm', () => {
  it('allows the mobile browser to offer both the camera and photo library', () => {
    const { container } = render(
      <DriverProfileForm
        initialValues={{
          fullName: 'Hassan Ali',
          address: 'Example address',
          contactNumber: '0501234567',
          vehicleType: 'Van',
          vehiclePlateNumber: 'A 12345',
        }}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        submitLabel="Save profile"
      />,
    );

    const photoInput = container.querySelector('input[type="file"]');
    expect(photoInput?.getAttribute('accept')).toBe('image/png,image/jpeg,image/webp');
    expect(photoInput?.hasAttribute('capture')).toBe(false);
  });
});
