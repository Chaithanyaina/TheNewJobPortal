import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();

  if (user === undefined) return <div className="h-screen"><Spinner /></div>; // Still checking auth state

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" state={{ from: location }} replace />; // Or a custom 'Unauthorized' page
  }
  return children;
};
export default ProtectedRoute;