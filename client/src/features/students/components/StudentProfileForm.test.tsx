import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StudentProfileForm } from './StudentProfileForm';

describe('StudentProfileForm', () => {
  it('allows the mobile browser to offer both the camera and photo library', () => {
    const { container } = render(
      <StudentProfileForm
        initialValues={{
          studentFullName: 'Amina Khan',
          parentFullName: 'Sara Khan',
          completeAddress: 'Example address',
          emergencyNumber: '0507654321',
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
