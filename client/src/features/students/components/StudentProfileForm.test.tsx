import { render, screen } from '@testing-library/react';
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

    const photoInputs = container.querySelectorAll('input[type="file"]');
    expect(photoInputs).toHaveLength(2);
    expect(photoInputs[0]?.getAttribute('accept')).toBe('image/png,image/jpeg,image/webp');
    expect(photoInputs[0]?.hasAttribute('capture')).toBe(false);
    expect(photoInputs[1]?.getAttribute('capture')).toBe('user');
    expect(screen.getByRole('button', { name: 'Upload from gallery' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Take a photo' })).toBeTruthy();
  });
});
