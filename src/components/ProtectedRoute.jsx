import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (user === undefined) return null;

  if (user === null) return <Navigate to="/admin/login" replace />;

  return children;
}