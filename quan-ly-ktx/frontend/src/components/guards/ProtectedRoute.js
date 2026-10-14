import RoleBasedRoute from './RoleBasedRoute';

export default function ProtectedRoute({ children }) {
  return <RoleBasedRoute>{children}</RoleBasedRoute>;
}
