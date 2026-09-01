import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadingButton } from './LoadingButton';

describe('LoadingButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('disables immediately, updates its label, and delays its spinner', () => {
    const { container } = render(
      <LoadingButton className="ui-button-primary" type="button" isLoading loadingLabel="Saving...">
        Save changes
      </LoadingButton>,
    );

    const button = screen.getByRole('button', { name: 'Saving...' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(container.querySelector('svg')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
