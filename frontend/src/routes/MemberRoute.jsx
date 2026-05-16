import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isStaff } from "@/lib/access";

// Member-only guard: staff roles are redirected away from user reservation pages.
export function MemberRoute() {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) return null;
  if (isStaff(user?.role)) return <Navigate to="/admin/reservations" replace />;

  return <Outlet />;
}
