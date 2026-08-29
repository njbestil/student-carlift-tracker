import { useEffect, useRef } from 'react';
import { Home, LogOut, UserRound } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const dashboardRoute = user?.role === 'DRIVER' ? '/driver/dashboard' : '/student/dashboard';
  const profileRoute = user?.role === 'DRIVER' ? '/driver/profile' : '/student/profile';

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="app-canvas">
        <div className="phone-shell">
          <main
            id="main-content"
            className={user ? 'screen-scroll' : 'min-h-0 flex-1 overflow-y-auto'}
            tabIndex={-1}
            ref={mainRef}
          >
            <Outlet />
          </main>
          {user ? (
            <nav className="bottom-nav" aria-label="Primary">
              <NavLink className="bottom-nav__item" to={dashboardRoute}>
                <Home className="bottom-nav__icon" aria-hidden="true" strokeWidth={2.5} />
                Home
              </NavLink>
              <NavLink className="bottom-nav__item" to={profileRoute}>
                <UserRound className="bottom-nav__icon" aria-hidden="true" strokeWidth={2.5} />
                Profile
              </NavLink>
              <button className="bottom-nav__item" type="button" onClick={logout}>
                <LogOut className="bottom-nav__icon" aria-hidden="true" strokeWidth={2.5} />
                Exit
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </>
  );
};
