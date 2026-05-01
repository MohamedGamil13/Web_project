import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Redirect already-authenticated users away from public-only pages such as
// /login and /register. Honors a `?returnTo=...` query param so a deep link
// like /login?returnTo=/profile bounces straight back to the original target.
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  if (isAuthenticated) {
    const returnTo = params.get("returnTo");
    return (
      <Navigate to={returnTo ? decodeURIComponent(returnTo) : "/"} replace />
    );
  }
  return <Outlet />;
}
