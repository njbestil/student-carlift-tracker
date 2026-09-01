import { render, screen } from '@testing-library/react';
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

    const photoInputs = container.querySelectorAll('input[type="file"]');
    expect(photoInputs).toHaveLength(2);
    expect(photoInputs[0]?.getAttribute('accept')).toBe('image/png,image/jpeg,image/webp');
    expect(photoInputs[0]?.hasAttribute('capture')).toBe(false);
    expect(photoInputs[1]?.getAttribute('capture')).toBe('user');
    expect(screen.getByRole('button', { name: 'Upload from gallery' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Take a photo' })).toBeTruthy();
  });
});
