import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <span className="brand">Student Carlift Tracker</span>
          {user ? (
            <nav aria-label="Primary">
              <NavLink to={user.role === 'DRIVER' ? '/driver/dashboard' : '/student/dashboard'}>Dashboard</NavLink>
              <NavLink to={user.role === 'DRIVER' ? '/driver/profile' : '/student/profile'}>Profile</NavLink>
              <button type="button" onClick={logout}>
                Sign out
              </button>
            </nav>
          ) : null}
        </div>
      </header>
      <main id="main-content" className="page-shell" tabIndex={-1} ref={mainRef}>
        <Outlet />
      </main>
    </>
  );
};
