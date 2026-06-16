import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getDashboardPath } from '../utils/authRoutes';

const HomeRedirect = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user)} replace />;
};

export default HomeRedirect;
