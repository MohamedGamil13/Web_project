import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/shared/Layout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";
import { AdminRoute } from "@/routes/AdminRoute";

import NotFoundPage from "@/app/NotFoundPage";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ProfilePage from "@/features/auth/pages/ProfilePage";
import ChangePasswordPage from "@/features/auth/pages/ChangePasswordPage";

import HotelsListPage from "@/features/hotels/pages/HotelsListPage";
import HotelDetailsPage from "@/features/hotels/pages/HotelDetailsPage";
import HotelFormPage from "@/features/hotels/pages/HotelFormPage";

import ReservationsPage from "@/features/reservations/pages/ReservationsPage";
import ReservationsHistoryPage from "@/features/reservations/pages/ReservationsHistoryPage";
import AdminReservationsPage from "@/features/reservations/pages/AdminReservationsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HotelsListPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route path="hotels" element={<HotelsListPage />} />
        <Route path="hotels/:id" element={<HotelDetailsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/password" element={<ChangePasswordPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route
            path="reservations/history"
            element={<ReservationsHistoryPage />}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route path="hotels/new" element={<HotelFormPage />} />
            <Route path="hotels/:id/edit" element={<HotelFormPage />} />
            <Route
              path="admin/reservations"
              element={<AdminReservationsPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
