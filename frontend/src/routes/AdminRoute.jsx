import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isStaff } from "@/lib/access";

export function AdminRoute() {
  const { user, bootstrapping } = useAuth();

  // On hard refresh, user is hydrated asynchronously from /auth/me.
  // Avoid redirecting to "/" until bootstrap has completed.
  if (bootstrapping) return null;

  if (!isStaff(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
