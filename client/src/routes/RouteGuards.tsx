import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../app/providers/useAuth';
import type { UserRole } from '../services/api/apiTypes';

const setupRouteByRole: Record<UserRole, string> = {
  ADMIN: '/student/dashboard',
  DRIVER: '/driver/profile/setup',
  STUDENT: '/student/profile/setup',
};

const dashboardByRole: Record<UserRole, string> = {
  ADMIN: '/student/dashboard',
  DRIVER: '/driver/dashboard',
  STUDENT: '/student/dashboard',
};

export const PublicOnlyRoute = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.profileCompleted ? dashboardByRole[user.role] : setupRouteByRole[user.role]} replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export const ProfileCompletionGuard = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const setupPath = setupRouteByRole[user.role];
  const isOnSetupPath = location.pathname === setupPath;

  if (!user.profileCompleted && !isOnSetupPath) {
    return <Navigate to={setupPath} replace />;
  }

  if (user.profileCompleted && isOnSetupPath) {
    return <Navigate to={dashboardByRole[user.role]} replace />;
  }

  return <Outlet />;
};

export const RoleGuard = ({ allowedRoles }: { allowedRoles: UserRole[] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardByRole[user.role]} replace />;
  }

  return <Outlet />;
};
