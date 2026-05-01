# Functional Requirements Document (FRD)

## 1. Actors
- **Guest** — unauthenticated visitor; can browse and search hotels and read reviews.
- **User** — authenticated end user; can reserve rooms, manage reservations, post reviews, edit profile.
- **Admin** — seeded role only; no dedicated UI in this milestone. Used for data seeding/ops.

## 2. Core Features
- F1. Account: register, login, logout.
- F2. Profile: view and edit own profile; change password.
- F3. Hotel discovery: search by city/keyword; filter by price, star rating, amenities; sort; paginate.
- F4. Hotel details: view hotel info, photos, rooms, average rating, reviews.
- F5. Reservation: pick room, choose check-in / check-out, see total, confirm.
- F6. My reservations: list, cancel an upcoming reservation.
- F7. Reviews: post a 1–5 star rating + comment for a hotel the user has stayed at; list reviews on hotel page.

## 3. User Stories & Acceptance Criteria

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
- AC: `/profile` shows name, email, phone, avatar URL, role, and member-since date. Hydrated via `GET /auth/me` (or `GET /users/me`).

**B2. Edit profile**
- AC: name, email, phone, and avatar URL are editable via `PATCH /users/me`. At least one field must be present in the patch (server returns 422 otherwise). Email change re-checks uniqueness — duplicate → 409 surfaced as a field-level error on the email input. Avatar URL must be a valid URL when present. Empty strings on phone/avatar clear the field. On success the page exits edit mode and shows a "Saved" timestamp; the global auth context user is refreshed so the navbar reflects the new name.

**B3. Change password** _(deferred to Phase 7 polish)_
- AC: requires current password + new password (same complexity rules); on success a toast confirms; old password is rejected with 401.

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
- AC:
  - Inputs: roomId, checkIn (date), checkOut (date), guestCount.
  - Validation: checkOut > checkIn; dates not in the past; guestCount ≤ room capacity.
  - Server checks room availability across the date range; conflict → HTTP 409.
  - On success: HTTP 201 with the reservation; user redirected to `/reservations` with a confirmation toast.

**E2. List my reservations**
- AC: `/reservations` shows upcoming and past reservations; each row shows hotel, room, dates, total price, status.

**E3. Cancel reservation**
- AC: only an `upcoming` reservation can be cancelled; cancellation must be at least 24 hours before check-in (configurable, documented as a constant). Status becomes `cancelled`. Cancelled reservations cannot be re-activated.

### Epic F — Reviews
**F1. Post a review**
- AC: a user can post one review per hotel only if they have a `completed` reservation for that hotel. Fields: rating (1–5), comment (≤ 1000 chars). Posting twice updates the existing review.

**F2. View reviews**
- AC: hotel page shows the most recent reviews (paginated, 10 per page) and the computed average rating + total count.

## 4. Non-functional Requirements
- Responsive layout from 1280px desktop down to 360px mobile (best-effort).
- All write actions show a loading state and a success/error toast.
- All forms validate on blur and on submit.
- All protected pages redirect unauthenticated users to /login with a `returnTo` query param.
- API p95 response time on a seeded dataset should be < 500ms locally.

## 5. Out of Scope (this milestone)
- Payments, refunds, currency conversion.
- Hotel-owner / admin UIs.
- Email verification / password reset flow.
- Social login.
- Map-based search, geolocation.
