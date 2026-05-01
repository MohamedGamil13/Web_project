# Project Overview

## 1. Summary
A hotel booking web application built as an academic group project. End users can register, search and filter hotels, view hotel and room details, make and cancel reservations, and post reviews. The system has a single React SPA frontend and a Node.js/Express REST backend backed by MongoDB.

## 2. Goals
- Deliver a working, demo-ready hotel booking app within the course timeline.
- Practice realistic full-stack collaboration: planning, API contract, parallel FE/BE work, integration.
- Produce clean, documented code (Swagger for API, README for setup) and a small test suite.

## 3. Non-Goals
- No real payment processing (reservations are confirmed without charging a card).
- **No cloud deployment**: demo target is local-only (FE dev server + BE dev server + local/Atlas Mongo).
- No CI/CD pipelines.
- No admin dashboard, hotel-owner portal, or multi-tenant features.
- No email/SMS notifications, no i18n, no real-time chat.
- No advanced search (no map view, no geosearch radius, no recommendations engine).
- **No refresh tokens / httpOnly cookie auth** this iteration — JWT-only.

## 4. Assumptions
- Hotel and room data is seeded via a script — there is no UI for creating hotels.
- Single user role for the app: `user`. An `admin` role exists in the schema for seeding/data ops only and has no dedicated UI.
- One MongoDB instance (local or Atlas free tier) is sufficient.
- Team works on a single shared GitHub repo with feature branches and PR reviews.
- Browser target: latest Chrome / Firefox / Edge. Desktop-first, mobile responsive as a stretch goal.

## 5. Constraints
- Team size: 5 (FE: 2, BE: 3). Course-length timeline (~6–8 weeks).
- Rubric-driven constraints override preferences:
  - Frontend forms should use **Formik**.
  - Frontend should use a mainstream responsive framework such as **Material-UI or Bootstrap**.
  - Backend remains Node + Express with JWT auth and bcrypt password hashing.
- No paid third-party services beyond free tiers.
- Authentication is JWT (access token only, stored in localStorage for simplicity — documented as an academic trade-off).

## 6. Teams & Roles
- **Frontend (2):** pages, wireframes, component map, routing, API client, form validation.
- **Backend (3):** DB schema, REST APIs, auth, validation, tests, OpenAPI docs.

### Responsibility Mapping
| Member | Area of Ownership |
|--------|-------------------|
| FE1    | Layout, routing, auth, profile |
| FE2    | Search, details, reservations, reviews UI |
| BE1    | Auth, users, JWT, bcrypt |
| BE2    | Hotels, rooms, search, filter |
| BE3    | Reservations, reviews, tests, docs |

## 7. Phases & Milestones (Rubric-Aligned)
| # | Phase | Owner(s) | Exit criteria |
|---|-------|----------|---------------|
| 1 | Planning & Design | All | These 5 docs approved; entities + API contract locked |
| 2 | Project Setup | All | Repos installable; FE renders shell; BE serves `/api/health`; Mongo connects |
| 3 | Auth & Profile | FE1 + BE1 | Register/login/logout works end-to-end; JWT-protected `/me`; profile view + edit (password change deferred to Phase 7) |
| 4 | Hotel Search & Filtering | FE2 + BE2 | Search page hits real `/hotels` API with filters + pagination |
| 5 | Reservations | FE2 + BE3 | User can create + view + cancel reservations against real API |
| 6 | Rubric Alignment Refactor | FE1 + FE2 | Replace RHF/Zod forms with Formik; introduce Bootstrap or MUI usage in key pages/components; update TRD/README accordingly |
| 7 | Reviews & Ratings | FE2 + BE3 | User can post a review for a stayed hotel; average rating shown; reviews endpoints mounted and tested |
| 8 | Testing, Docs & Polish | All | API tests expanded per endpoint; Swagger + API collection published; README finished; **password-change endpoint shipped**; demo run-through |

## 8. Integration Checkpoints (FE mock → real API handoff)
- **CP-0 (end of Phase 1):** Backend publishes the OpenAPI sketch in `API_PLAN.md`. Frontend builds an `apiClient` (axios) plus mock fixtures matching the response envelope.
- **CP-1 (mid Phase 3):** BE1 delivers `/auth/register`, `/auth/login`, `/users/me`. FE1 swaps auth mocks for real calls.
- **CP-2 (mid Phase 4):** BE2 delivers `/hotels` (list + filter + paginate) and `/hotels/:id` (with rooms). FE2 swaps search/details mocks.
- **CP-3 (mid Phase 5):** BE3 delivers `/reservations` (create, list-mine, cancel). FE2 swaps reservation mocks.
- **CP-4 (mid Phase 6):** BE3 delivers `/reviews`. FE2 swaps review mocks.
- **CP-5 (Phase 7):** End-to-end demo run-through; bug bash; freeze.

At each checkpoint the response envelope, error shape, and status codes are verified jointly. Any deviation is fixed on the BE side, never patched only on the FE.

## 9. Risks
- Backend search/filter slipping blocks frontend integration → mitigated by mock fixtures matching the locked contract.
- JWT in localStorage is academic-grade only; documented in TRD as a known trade-off.
- MongoDB schemaless flexibility can hide bugs → Joi validation is mandatory at every write endpoint.
