import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AdminRoute() {
  const { user, bootstrapping } = useAuth();

  // On hard refresh, user is hydrated asynchronously from /auth/me.
  // Avoid redirecting to "/" until bootstrap has completed.
  if (bootstrapping) return null;

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
