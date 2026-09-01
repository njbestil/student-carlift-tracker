import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssignedStudentCard } from './AssignedStudentCard';

const student = {
  userId: 'student-id',
  studentFullName: 'Amina Khan',
  parentFullName: 'Sara Khan',
  contactNumber: '0501234567',
  emergencyNumber: '0507654321',
  completeAddress: 'Example address',
  profilePhotoUrl: null,
  latitude: null,
  longitude: null,
  serviceStatus: 'WAITING' as const,
};

describe('AssignedStudentCard', () => {
  it('keeps the attendance control visible beside an independently operable details disclosure', () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <AssignedStudentCard
        student={student}
        isTripActive
        isUpdating={false}
        onOpenMap={vi.fn()}
        onStatusChange={onStatusChange}
      />,
    );
    const detailsControl = screen.getByRole('button', { name: 'Amina Khan details' });
    const attendanceControl = screen.getByRole('button', { name: 'Amina Khan attendance' });

    expect(detailsControl.getAttribute('aria-expanded')).toBe('false');
    expect(attendanceControl.hasAttribute('hidden')).toBe(false);
    expect(attendanceControl.getAttribute('aria-pressed')).toBe('true');
    expect(attendanceControl.classList.contains('student-presence-indicator')).toBe(true);
    fireEvent.click(attendanceControl);
    expect(onStatusChange).toHaveBeenCalledWith(student, 'ABSENT');
    expect(detailsControl.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(detailsControl);
    expect(detailsControl.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('[hidden]')).toBeNull();
  });

  it('provides direct call links for the contact and emergency numbers', () => {
    const { container } = render(
      <AssignedStudentCard
        student={student}
        isTripActive
        isUpdating={false}
        onOpenMap={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    const contactCallLink = container.querySelector('a[href="tel:0501234567"]');
    const emergencyCallLink = container.querySelector('a[href="tel:0507654321"]');
    const viewMapButton = container.querySelector('button.ui-button-secondary');

    expect(contactCallLink?.getAttribute('aria-label')).toBe("Call Amina Khan's contact number at 0501234567");
    expect(emergencyCallLink?.getAttribute('aria-label')).toBe("Call Amina Khan's emergency mobile number at 0507654321");
    expect(contactCallLink?.classList.contains('ui-call-action--contact')).toBe(true);
    expect(emergencyCallLink?.classList.contains('ui-call-action--emergency')).toBe(true);
    expect(contactCallLink?.compareDocumentPosition(viewMapButton!)).toBe(4);
  });
});
