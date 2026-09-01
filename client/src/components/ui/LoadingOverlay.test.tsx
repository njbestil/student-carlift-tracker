import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays visibility and keeps a visible overlay on screen for the minimum duration', () => {
    const { rerender } = render(<LoadingOverlay isOpen message="Working on it..." />);

    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('status').textContent).toBe('Working on it...');

    rerender(<LoadingOverlay isOpen={false} message="Working on it..." />);

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.getByRole('status').textContent).toBe('Working on it...');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole('status')).toBeNull();
  });
});
