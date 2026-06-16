import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDashboardPath } from '../utils/authRoutes';

// Supports optional role-based access via `allowedRoles` prop.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map((role) => role.toLowerCase());

  if (allowedRoles && Array.isArray(allowedRoles) && !normalizedAllowedRoles.includes(normalizedRole)) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return children;
};

export default ProtectedRoute;
