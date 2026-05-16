# Functional Requirements Document (FRD)

## 1. Core Features
- F1. Account: register, login, logout.
- F2. Profile: view and edit own profile; change password.
- F3. Hotel discovery: search by city/keyword; filter by price, star rating, amenities; sort; paginate.
- F4. Hotel details: view hotel info, photos, rooms, average rating, reviews.
- F5. Reservation: pick room, choose check-in / check-out, see pricing breakdown, confirm.
- F6. My reservations: list and cancel upcoming reservations.
- F7. Reviews: create, update, and delete own reviews.
- F8. Access control: owner manages roles and admin permission overrides.

## 2. User Stories & Acceptance Criteria

### Epic A — Authentication
- Register, login, and logout flows are available.
- On successful login/register, JWT is issued and persisted client-side.
- Protected routes require authentication and redirect unauthenticated users to `/login`.

### Epic B — Profile
- User can view and update `name`, `email`, and `phone`.
- User can upload/remove avatar.
- Password change uses verify-then-update flow with short-lived re-auth token.

### Epic C — Hotel Discovery
- List page supports query, filters, sorting, and pagination.
- Hotel details page shows rooms, amenities, media, and reviews.

### Epic D — Reservation Workflow
- User can create reservation with availability checks.
- User can view own reservations and timeline events.
- User can cancel eligible reservations.

### Epic E — Reviews
- User can post one review per hotel.
- User can update/delete only own review.
- Hotel rating aggregate updates after review mutations.

### Epic F — Access Control
- Roles: `owner`, `admin`, `user`.
- Exactly one owner account exists.
- Owner can:
  - Promote/demote users to/from admin.
  - Manage per-admin permission overrides (`allow[]`, `deny[]`).
- Admin can:
  - Manage hotels and rooms.
  - Manage reservations.
  - View analytics.
  - List users.
- User can:
  - Access own profile/reservations/reviews only.

## 3. Non-functional Requirements
- Responsive UI for desktop and mobile.
- Loading/error/success states for write actions.
- Validation on client and server for write operations.
- API p95 response time target under 500ms on seeded local dataset.

## 4. Out of Scope (current release)
- Payments, refunds, and currency conversion.
- Email verification and password reset flows.
- Social login providers.
- Map/geolocation search.
