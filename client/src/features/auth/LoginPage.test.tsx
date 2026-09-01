import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/providers/authContext';
import { authApi } from './auth.api';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('shows a disabled loading action while the login request is pending', () => {
    vi.spyOn(authApi, 'login').mockReturnValue(new Promise(() => undefined));

    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: null,
            token: null,
            setSession: vi.fn(),
            updateUser: vi.fn(),
            logout: vi.fn(),
          }}
        >
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.submit(screen.getByRole('button', { name: 'Log In' }).closest('form')!);

    const loginButton = screen.getByRole('button', { name: 'Logging in...' });
    expect(loginButton.hasAttribute('disabled')).toBe(true);
    expect(authApi.login).toHaveBeenCalledTimes(1);
  });
});
