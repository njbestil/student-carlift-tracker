import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { DriverDashboardPage } from '../features/drivers/DriverDashboardPage';
import { DriverProfilePage } from '../features/drivers/DriverProfilePage';
import { DriverProfileSetupPage } from '../features/drivers/DriverProfileSetupPage';
import { StudentDashboardPage } from '../features/students/StudentDashboardPage';
import { StudentProfilePage } from '../features/students/StudentProfilePage';
import { StudentProfileSetupPage } from '../features/students/StudentProfileSetupPage';
import { ProfileCompletionGuard, ProtectedRoute, PublicOnlyRoute, RoleGuard } from '../routes/RouteGuards';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <ProfileCompletionGuard />,
            children: [
              {
                element: <RoleGuard allowedRoles={['STUDENT']} />,
                children: [
                  { path: '/student/profile/setup', element: <StudentProfileSetupPage /> },
                  { path: '/student/dashboard', element: <StudentDashboardPage /> },
                  { path: '/student/profile', element: <StudentProfilePage /> },
                ],
              },
              {
                element: <RoleGuard allowedRoles={['DRIVER']} />,
                children: [
                  { path: '/driver/profile/setup', element: <DriverProfileSetupPage /> },
                  { path: '/driver/dashboard', element: <DriverDashboardPage /> },
                  { path: '/driver/profile', element: <DriverProfilePage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
