# Project Overview

## 1. Summary
Hotel booking application with a React SPA frontend and a Node.js/Express REST backend backed by MongoDB.

## 2. Goals
- Deliver a stable booking flow with clear API contracts and documented behavior.
- Keep frontend and backend integration consistent through shared payload shapes.
- Maintain operational documentation for setup, testing, and API usage.

## 3. Non-Goals
- Payment processing, refunds, and invoicing.
- Cloud deployment and CI/CD pipelines.
- Hotel-owner portal and multi-tenant architecture.
- Email/SMS notifications, i18n, and real-time chat.
- Map/geospatial search and recommendations.
- Refresh-token and httpOnly cookie auth in this release.

## 4. Runtime Assumptions
- Local runtime: frontend dev server + backend dev server + local/Atlas MongoDB.
- Hotel and room data is seeded through `backend/src/scripts/seed.js`.
- Latest Chrome/Firefox/Edge are primary browser targets.

## 5. Access Control Model
- `guest`: unauthenticated; browse hotels and reviews.
- `user`: authenticated; manage own reservations/reviews/profile.
- `admin`: staff operations (hotel/room/reservation/analytics + user listing).
- `owner`: exactly one account; full permissions including role and permission management.

## 6. Permission Strategy
- Route access is permission-based.
- Role defaults are resolved server-side.
- For admin accounts, owner can apply per-user permission overrides:
  - `allow[]` permissions explicitly granted.
  - `deny[]` permissions explicitly revoked.
- Owner permissions are not overrideable.

## 7. Risks
- JWT in localStorage is a known trade-off; XSS controls must remain strict.
- Schema flexibility in MongoDB requires strict Joi validation on write endpoints.
- Permission sprawl risk is mitigated by central permission constants and owner-only override endpoints.
