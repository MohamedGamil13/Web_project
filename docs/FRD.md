# Functional Requirements Document (FRD)

## 1. Core Features
- F1. Account: register, login, logout.
- F2. Profile: view and edit own profile; change password.
- F3. Hotel discovery: search by city/keyword; filter by price, star rating, amenities; sort; paginate.
- F4. Hotel details: view hotel info, photos, rooms, average rating, reviews.
- F5. Reservation: pick room, choose check-in / check-out, see total, confirm.
- F6. My reservations: list, cancel an upcoming reservation.
- F7. Reviews: post a 1–5 star rating + comment for a hotel the user has stayed at; list reviews on hotel page.

## 2. User Stories & Acceptance Criteria

### Epic A — Authentication
**A1. Register**
- *As a* guest *I want* to create an account *so that* I can make reservations.
- AC:
  - Form fields: name (2–80), email, password, confirm password, phone *(optional)*.
  - Email must be unique (case-insensitive, stored lowercase); password min 8 chars with at least one letter and one number; confirm-password must match.
  - On success: account created, JWT issued, user is logged in and redirected to home.
  - On duplicate email: HTTP 409 with `code: "CONFLICT"`, message shown inline next to the email input.
  - On any 422: server-supplied `error.details[]` are projected onto the matching form fields.

**A2. Login**
- *As a* user *I want* to log in *so that* I can access my account.
- AC:
  - Form fields: email, password.
  - On success: JWT stored in `localStorage`, user redirected to the page they tried to access (`returnTo` query param) or home.
  - On wrong credentials *and* unknown email: HTTP 401 with the same generic message — `"Invalid email or password"`. No enumeration, no field-level leak.

**A3. Logout**
- *As a* user *I want* to log out *so that* my session is cleared.
- AC: client calls `POST /auth/logout` (best-effort; stateless on the server) and clears the token from `localStorage`. Protected routes redirect to `/login`. The Navbar swaps from the user menu back to login/register buttons.

**A4. Session persistence**
- AC: on a hard reload while a token is in `localStorage`, the SPA calls `GET /auth/me` to hydrate the current user. Expired/invalid token → API returns 401, the client wipes the token, and the user lands at `/login`. Token expiry default 7d (driven by `JWT_EXPIRES_IN`).

### Epic B — Profile
**B1. View profile**
- AC: `/profile` shows name, email, phone, avatar (image or initials fallback), role, and member-since date. Hydrated via `GET /auth/me` (or `GET /users/me`).

**B2. Edit profile**
- AC: name, email, and phone are editable via `PATCH /users/me`. At least one field must be present in the patch (server returns 422 otherwise). Email change re-checks uniqueness — duplicate → 409 surfaced as a field-level error on the email input. Empty `phone` clears the field. On success the page exits edit mode and shows a "Saved" timestamp; the global auth context user is refreshed so the navbar reflects the new name.

**B2a. Avatar upload**
- AC: avatar is managed independently of the JSON profile patch. The profile page exposes an *Upload photo* button (and *Remove* once one is set). The picker accepts jpg/png/webp/gif up to 5 MB. Uploads go to `POST /users/me/avatar` as `multipart/form-data` (field name `avatar`); the server stores the file under `backend/storage/avatars/<filename>` and returns the refreshed user with `avatarUrl: "/api/v1/users/<id>/avatar"`. *Remove* calls `DELETE /users/me/avatar` and unsets the path. The navbar avatar picture refreshes immediately because `setUser` propagates through `AuthContext`. When no avatar is set, `<UserAvatar>` falls back to colored initials derived deterministically from the user's name.

**B3. Change password** *(shipped — verify + update with re-auth token)*
- AC: a dedicated route at `/profile/password` collects `currentPassword`, `newPassword`, and `confirmNewPassword`. The page first calls `POST /users/me/password/verify` with the current password; on success the server returns a 10-minute `reauthToken` which the FE caches in `localStorage`. The page then enables the *new password* form and calls `PATCH /users/me/password` with `{ newPassword }` plus header `x-reauth-token: <reauthToken>`. Wrong current password → 401. Weak `newPassword` (< 8 chars or missing letter/digit) → 422 with field-level error. Mismatched `confirmNewPassword` is caught client-side via Yup. On success the cached re-auth token is cleared and a confirmation banner shows.

### Epic C — Hotel Search
**C1. Search by city / keyword**
- AC: search input with city or hotel name; submitting fetches `/hotels?q=...`; result list shows name, city, price-from, star rating, thumbnail.

**C2. Filters & sort**
- AC: filters for price range, min star rating, amenities (multi-select), and sort (price asc/desc, rating desc). Filters compose with the search query and pagination.

**C3. Pagination**
- AC: 10 results per page; page controls update the URL query string so that the page is shareable.

**C4. Empty / error states**
- AC: when no results, an empty state is shown; on API error, a non-blocking error banner with retry.

### Epic D — Hotel Details
**D1. View hotel**
- AC: hotel page shows description, gallery, amenities, address, average rating, room list (type, capacity, price/night, available count), and reviews.

**D2. Pick a room**
- AC: clicking *Reserve* on a room with `checkIn` and `checkOut` selected opens the reservation flow; unauthenticated users are redirected to /login with a returnTo.

### Epic E — Reservation
**E1. Create reservation**
- *As a* user *I want* to book a room *so that* I have a confirmed stay.
- AC:
  - Trigger: clicking *Reserve* on a room card on the hotel detail page opens a modal dialog. Unauthenticated users see a "Sign in to reserve" variant of the dialog with a *Sign in* button that preserves `returnTo`.
  - Inputs: `roomId` (pre-filled from the picked room), `checkIn` (date), `checkOut` (date), `guests`.
  - Client-side validation (Yup): `checkIn` not in the past; `checkOut > checkIn`; `guests` integer ≥ 1.
  - Live total: while both dates are picked, the dialog shows `nights × pricePerNight = total`; the *Confirm* button shows the running total.
  - Server-side validation (Joi + service): same as client + `guests ≤ room.capacity` (422 with `{ field: 'guests' }`).
  - Availability: server rejects with HTTP 409 + message `"Room is not available for the selected dates"` when overlapping active bookings ≥ `room.quantity`. The dialog surfaces the conflict in an inline destructive banner so the user can pick different dates without losing the form.
  - On success: HTTP 201, the dialog swaps to a confirmation panel showing hotel, room, dates, nights, guests, and total. The user can close the dialog or click *View my reservations* to navigate to `/reservations`.

**E2. List my reservations**
- AC: `/reservations` calls `GET /reservations/me` and groups results into three sections — *Upcoming*, *Past stays*, *Cancelled*. Each card shows hotel, city/country, room type, check-in → check-out, nights, guest count, total price, and a status badge. Empty state ("No reservations yet") with a *Browse hotels* CTA when the list is empty. Loading skeletons during the fetch; an inline error card with a *Try again* button on failure.

**E3. Cancel reservation**
- AC: only *Upcoming* reservations show a *Cancel* button. Clicking opens a `ConfirmDialog` ("Cancel this reservation?") with the reservation summary and destructive-styled *Yes, cancel* / *Keep reservation* buttons. Confirming calls `PATCH /reservations/:id/cancel`; on success the dashboard refetches and the reservation moves to the *Cancelled* section. Status becomes `cancelled` and `cancelledAt` is recorded; cancelled reservations cannot be re-activated. Cancelling someone else's reservation → 403; cancelling an already-cancelled reservation or one whose check-in has passed → 409, surfaced as a destructive banner under the list.

### Epic F — Reviews
**F1. Post a review**
- AC: a user can post one review per hotel only if they have a `completed` reservation for that hotel. Fields: rating (1–5), comment (≤ 1000 chars). Posting twice updates the existing review.

**F2. View reviews**
- AC: hotel page shows the most recent reviews (paginated, 10 per page) and the computed average rating + total count.

## 3. Non-functional Requirements
- Responsive layout from 1280px desktop down to 360px mobile (best-effort).
- All write actions show a loading state and a success/error toast.
- All forms validate on blur and on submit.
- All protected pages redirect unauthenticated users to /login with a `returnTo` query param.
- API p95 response time on a seeded dataset should be < 500ms locally.

## 4. Out of Scope (this milestone)
- Payments, refunds, currency conversion.
- Hotel-owner / admin UIs.
- Email verification / password reset flow.
- Social login.
- Map-based search, geolocation.
