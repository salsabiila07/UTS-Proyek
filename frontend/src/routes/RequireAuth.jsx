import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export const roleHome = {
  admin: '/admin/dashboard',
  coach: '/coach/dashboard',
  student: '/student/dashboard',
  principal: '/principal/dashboard',
};

export function RequireAuth({ roles, children }) {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <main className="auth-route-state" role="status">Memeriksa sesi…</main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!roles.includes(user.role)) return <Navigate to={roleHome[user.role] || '/login'} replace />;
  return children;
}

export function PublicOnly({ children }) {
  const { user, status } = useAuth();
  if (status === 'loading') return <main className="auth-route-state" role="status">Memeriksa sesi…</main>;
  if (user) return <Navigate to={roleHome[user.role] || '/'} replace />;
  return children;
}
