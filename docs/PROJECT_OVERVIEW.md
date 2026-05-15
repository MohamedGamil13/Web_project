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
- Rubric-driven constraints override preferences:
  - Frontend forms should use **Formik**.
  - Frontend should use a mainstream responsive framework such as **Material-UI or Bootstrap**.
  - Backend remains Node + Express with JWT auth and bcrypt password hashing.
- No paid third-party services beyond free tiers.
- Authentication is JWT (access token only, stored in localStorage for simplicity — documented as an academic trade-off).

## 6. Entities
- **Guest** — unauthenticated visitor; can browse and search hotels and read reviews.
- **User** — authenticated end user; can reserve rooms, manage reservations, post reviews, edit profile.
- **Admin** — seeded role only; no dedicated UI in this milestone. Used for data seeding/ops.

## 7. Risks
- Backend search/filter slipping blocks frontend integration → mitigated by mock fixtures matching the locked contract.
- JWT in localStorage is academic-grade only; documented in TRD as a known trade-off.
- MongoDB schemaless flexibility can hide bugs → Joi validation is mandatory at every write endpoint.
