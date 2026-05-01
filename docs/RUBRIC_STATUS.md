# Rubric Status — Final Submission

## Snapshot
- **Frontend stack alignment:** complete — Formik + Yup, Material-UI v9, axios, React Router.
- **Backend stack alignment:** complete — Node + Express 5, MongoDB/Mongoose 9, JWT (HS256), bcryptjs, Joi, Multer (avatar upload).
- **Tests:** **65/65 passing** across **7 suites** (`auth`, `health`, `hotels`, `hotels.validators`, `reservations`, `reviews`, `users`). DB-free tests, run via `npm --prefix backend test`.
- **Lint:** both projects pass (`npm run lint`) — zero errors, only the standard unused-variable warnings on intentional placeholders.
- **Frontend build:** clean (`npm --prefix frontend run build` → ~277 KB gzipped, single chunk).

Paths below are repo-relative.

## Documentation
| Item | Proof |
|---|---|
| Project overview | [docs/PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Functional requirements | [docs/FRD.md](FRD.md) |
| Technical requirements | [docs/TRD.md](TRD.md) |
| Database schema | [docs/DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) |
| API documentation plan | [docs/API_PLAN.md](API_PLAN.md) |
| API collection export | [docs/postman_collection.json](postman_collection.json) — login auto-captures `{{token}}`; password verify auto-captures `{{reauthToken}}` |
| Setup README | [README.md](../README.md) — env, scripts, demo accounts, password flow, avatar storage |

## Common Technical Requirements
| Item | Proof |
|---|---|
| `npm` project setup | [backend/package.json](../backend/package.json), [frontend/package.json](../frontend/package.json) |
| Dependencies + devDependencies | both package manifests |
| `dev` / `start` scripts | backend: `dev`, `start`; frontend: `dev`, `preview` |
| `test` scripts | backend Jest+Supertest (7 suites, 61+ tests); frontend has a placeholder `echo` (no FE unit tests in scope) |
| `lint` scripts | backend ESLint flat config (`src/`, `tests/`); frontend ESLint flat config (`src/`) — both **pass** |
| `prettier` / `prettier:write` scripts | both projects |
| `build` script | frontend Vite build; backend placeholder no-op (Node ESM, no transpile) |
| Frontend build runs without error | `npm --prefix frontend run build` exits 0 |
| Version-controlled with feature branches | git history; `.gitignore` covers `node_modules`, build outputs, `.env`, `storage/` (Multer uploads) |

## Backend Requirements
| Item | Proof |
|---|---|
| Express app + health endpoint | [src/app.js](../backend/src/app.js), [`/api/v1/health`](../backend/src/routes/v1/health.routes.js) |
| Helmet / CORS / morgan / body parsing | [middleware/security.js](../backend/src/middleware/security.js), [app.js](../backend/src/app.js) |
| Versioned routing `/api/v1/...` | [routes/v1/index.js](../backend/src/routes/v1/index.js) |
| Mongoose connection | [config/db.js](../backend/src/config/db.js), [server.js](../backend/src/server.js) |
| Mongoose models | [User](../backend/src/models/User.js), [Hotel](../backend/src/models/Hotel.js), [Room](../backend/src/models/Room.js), [Reservation](../backend/src/models/Reservation.js), [Review](../backend/src/models/Review.js) |
| Password hashing (bcryptjs) | [services/auth.service.js](../backend/src/services/auth.service.js), [services/users.service.js](../backend/src/services/users.service.js) |
| JWT auth + role middleware | [middleware/auth.js](../backend/src/middleware/auth.js) (`requireAuth`, `requireRole`) — supports `Authorization: Bearer …` *and* `?token=` query for image tags |
| Joi request validation | [middleware/validate.js](../backend/src/middleware/validate.js) + [validators/](../backend/src/validators/) |
| Centralized error handler + 404 | [errorHandler.js](../backend/src/middleware/errorHandler.js), [notFound.js](../backend/src/middleware/notFound.js) |
| Consistent response envelope | [utils/response.js](../backend/src/utils/response.js) (`ok`, `created`); errors via `errorHandler.js` |
| Auth endpoints | [routes/v1/auth.routes.js](../backend/src/routes/v1/auth.routes.js) — register, login, me, logout |
| Users / profile / password / avatar endpoints | [routes/v1/users.routes.js](../backend/src/routes/v1/users.routes.js) — GET/PATCH `/me`, `POST /me/password/verify`, `PATCH /me/password` (`x-reauth-token`), `POST /me/avatar` (multipart), `DELETE /me/avatar`, `GET /:id/avatar` |
| Hotels CRUD (admin-gated mutations) | [routes/v1/hotels.routes.js](../backend/src/routes/v1/hotels.routes.js) |
| Reservations CRUD (auth-gated) | [routes/v1/reservations.routes.js](../backend/src/routes/v1/reservations.routes.js) — create / list-mine / get / cancel |
| Reviews CRUD | [routes/v1/reviews.routes.js](../backend/src/routes/v1/reviews.routes.js) + nested `/hotels/:id/reviews` in hotels routes |
| Aggregation (review avg/count recompute) | [services/reviews.service.js](../backend/src/services/reviews.service.js) `recomputeHotelStats` (Mongo `$group` aggregation, runs on every create/update/delete) |
| File upload | [middleware/uploadAvatar.js](../backend/src/middleware/uploadAvatar.js) — Multer disk storage to `backend/storage/avatars/`, ≤ 5 MB, mimetype-allowlisted |
| Seed script | `npm run seed` → [scripts/seed.js](../backend/src/scripts/seed.js) |
| Swagger / OpenAPI | [docs/swagger.js](../backend/src/docs/swagger.js); served at `/api/docs` with reusable `User`/`AuthResponse`/`HotelSummary`/`Reservation`/`ApiError` schemas |
| Tests cover each endpoint group | 7 suites: [health](../backend/tests/health.test.js), [auth](../backend/tests/auth.test.js), [users](../backend/tests/users.test.js), [hotels](../backend/tests/hotels.test.js), [hotels.validators](../backend/tests/hotels.validators.test.js), [reservations](../backend/tests/reservations.test.js), [reviews](../backend/tests/reviews.test.js) — 65 tests, each group with at least one validation/error path |

## Frontend Requirements
| Item | Proof |
|---|---|
| React SPA with Vite | [vite.config.js](../frontend/vite.config.js), [main.jsx](../frontend/src/main.jsx) |
| React Router | [routes/AppRoutes.jsx](../frontend/src/routes/AppRoutes.jsx) — public, public-only, and protected route groups |
| Component-based architecture | per-feature folders under [src/features/](../frontend/src/features/), shared shell under [src/components/shared/](../frontend/src/components/shared/) |
| Forms via Formik + Yup | helper [lib/formik-mui.jsx](../frontend/src/lib/formik-mui.jsx) (`FTextField`, `FDatePicker`); used in [Login](../frontend/src/features/auth/pages/LoginPage.jsx), [Register](../frontend/src/features/auth/pages/RegisterPage.jsx), [Profile](../frontend/src/features/auth/pages/ProfilePage.jsx), [ChangePassword](../frontend/src/features/auth/pages/ChangePasswordPage.jsx), [ReserveDialog](../frontend/src/features/reservations/ReserveDialog.jsx), [ReviewForm](../frontend/src/features/reviews/ReviewForm.jsx) |
| Yup schemas | [auth/schemas.js](../frontend/src/features/auth/schemas.js), [reservations/schemas.js](../frontend/src/features/reservations/schemas.js), [reviews/schemas.js](../frontend/src/features/reviews/schemas.js) |
| Material-UI as the responsive UI framework | end-to-end. Theme + LocalizationProvider in [Providers.jsx](../frontend/src/app/Providers.jsx) |
| axios with centralized client | [lib/apiClient.js](../frontend/src/lib/apiClient.js) — interceptors for token + 401 handling + `toAuthenticatedAssetUrl` for image tags |
| Auth context + protected routes | [AuthContext](../frontend/src/features/auth/AuthContext.jsx), [ProtectedRoute](../frontend/src/routes/ProtectedRoute.jsx), [PublicOnlyRoute](../frontend/src/routes/PublicOnlyRoute.jsx) |
| Authenticated dashboard | reservations dashboard at `/reservations` ([page](../frontend/src/features/reservations/pages/ReservationsPage.jsx)) + history at `/reservations/history` ([page](../frontend/src/features/reservations/pages/ReservationsHistoryPage.jsx)) + profile at `/profile` ([page](../frontend/src/features/auth/pages/ProfilePage.jsx)) |
| Profile view + edit + avatar upload | [ProfilePage](../frontend/src/features/auth/pages/ProfilePage.jsx) — Formik edit form, multipart avatar upload via [api.js](../frontend/src/features/auth/api.js) `uploadAvatar` / `removeAvatar` |
| Password change with re-auth | [ChangePasswordPage](../frontend/src/features/auth/pages/ChangePasswordPage.jsx) — verify → cache 10-min `reauthToken` → patch with `x-reauth-token` header |
| Hotel browse with filters + pagination | [HotelsListPage](../frontend/src/features/hotels/pages/HotelsListPage.jsx) — URL-synced city/price-slider/rating/amenities/sort + MUI Pagination |
| Hotel detail with rooms + reviews | [HotelDetailsPage](../frontend/src/features/hotels/pages/HotelDetailsPage.jsx) |
| Reservation create / list / cancel + history | [ReserveDialog](../frontend/src/features/reservations/ReserveDialog.jsx) (MUI X DatePicker, guests Select, live total), [ReservationsPage](../frontend/src/features/reservations/pages/ReservationsPage.jsx), [ReservationsHistoryPage](../frontend/src/features/reservations/pages/ReservationsHistoryPage.jsx), [ConfirmDialog](../frontend/src/components/shared/ConfirmDialog.jsx) |
| Reviews list + write/edit/delete | [ReviewsSection](../frontend/src/features/reviews/ReviewsSection.jsx), [ReviewForm](../frontend/src/features/reviews/ReviewForm.jsx), [ReviewItem](../frontend/src/features/reviews/ReviewItem.jsx) |
| Loading / empty / error states | `Skeleton` placeholders + `Alert`-with-retry across hotel list, hotel detail, reservations, reviews |
| Responsive layout | MUI `Container` + responsive `sx={{ … }}` breakpoints + responsive Navbar (Drawer below `md`) |
| Avatar dropdown (initials fallback + upload) | [UserAvatar](../frontend/src/components/shared/UserAvatar.jsx) (deterministic color from name, image when set), Navbar `Menu` |

## Bonus / Quality
| Item | Proof |
|---|---|
| Swagger API docs | served at `/api/docs`, JSDoc on every route + reusable schema components |
| Postman/Insomnia/Apidog collection | [docs/postman_collection.json](postman_collection.json) — auto-captures JWT from `Login (alice)` and `reauthToken` from `Password — Verify current` |
| Unit / API tests per endpoint | 65 tests across 7 suites |
| Image upload (avatar) | multer + protected fetch with `?token=` query support |
| URL-synchronized filters | hotel listing — every filter is shareable via the URL query string |
| Two-thumb price slider | MUI `Slider` with `disableSwap` + `onChangeCommitted` |
| Password change with re-auth | dedicated route + 10-min token + `x-reauth-token` header |

## End-to-end demo (acceptance criterion)
| Step | Where | Notes |
|---|---|---|
| 1. Register | `/register` | Formik + Yup; auto-login on success |
| 2. Login | `/login` | `returnTo` honored; navbar swaps to avatar dropdown |
| 3. Browse hotels | `/hotels` | Filters URL-synced; debounced fetch; pagination |
| 4. Hotel detail | `/hotels/:id` | Rooms, amenities, reviews, rating summary |
| 5. Reserve | dialog from a room card | MUI date pickers + guests select + live total |
| 6. View / cancel reservation | `/reservations` | Confirm dialog; updates immediately |
| 7. Past stays history | `/reservations/history` | Past + cancelled groups |
| 8. Add a review | hotel detail page | One per (user, hotel); rating recompute on hotel header |
| 9. Edit / delete own review | inline | Pinned to top of page 1 with "You" badge + Edit/Delete |
| 10. Profile update | `/profile` | Name/phone form + multipart avatar upload + remove |
| 11. Password change | `/profile/password` | Verify current → new password (separate steps; cached `reauthToken`) |

## Known deferrals (documented in [TRD.md](TRD.md) §0)
- Refresh tokens / httpOnly cookie auth — out of scope; JWT in `localStorage` is the documented academic trade-off.
- Frontend unit tests — not in scope; manual demo flow + backend tests cover validation/auth boundaries.
- Cloud deploy / CI pipelines — local-only demo target.
- Required-completed-reservation gate on review writes — intentionally relaxed for demo simplicity; documented in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) §2.5.

## Final local verification checklist
```bash
# Backend
cd backend
npm install
npm run lint    # exit 0 (warnings only)
npm test        # 7 suites, 65 tests passing
npm run seed
npm run dev     # http://localhost:5050

# Frontend (separate terminal)
cd frontend
npm install
npm run lint    # exit 0
npm run build   # exit 0
npm run dev     # http://localhost:5173
```

Then walk through the 11-step demo flow above. Swagger lives at `http://localhost:5050/api/docs`. Import [postman_collection.json](postman_collection.json) and run *Auth → Login (alice)* first to capture the JWT.
