# Technical Requirements Document (TRD)

## 0. Locked Decisions
- Demo target: **local-only** (frontend dev server + backend dev server + local/Atlas Mongo). No cloud deploy required.
- Frontend forms: **Formik + Yup** (rubric-aligned). RHF/Zod removed.
- Frontend UI framework: **Material-UI v6 + Emotion** end-to-end. Tailwind, shadcn, and Radix have been removed; MUI is the only component library in the runtime.
- Hotel images: URL string fields populated with placeholder links via the seed script.
- Reservation completion: computed **lazily on read** (no scheduler).
- Password-change endpoint (`PATCH /users/me/password`): delivered in **Phase 8** polish.
- Refresh tokens / httpOnly cookie auth: out of scope.

## 1. Stack

### Frontend (`/frontend`)
- React 19 + Vite
- React Router v7 for routing
- **Material-UI v6 + Emotion** is the only component library. All shells (AppBar/Toolbar/Container), all forms (TextField/Select/Checkbox/Slider/Button), all surfaces (Card/Paper/Dialog/Alert/Skeleton/Pagination/Chip/Rating), and all icons (`@mui/icons-material`) are MUI. MUI is wired via `ThemeProvider` + `CssBaseline` in `app/Providers.jsx`.
- **Formik + Yup** for form state and validation. Field-level integration via the `FTextField` helper in `lib/formik-mui.jsx`.
- HTTP: axios (single shared `apiClient` with interceptors).
- State: React context for current user/session; component-local state for everything else (no Redux).
- ESLint for linting.

> Tailwind, shadcn, Radix, lucide-react, clsx, class-variance-authority, and tailwind-merge are all uninstalled.

### Backend (`/backend`)
- Node.js (ESM) + Express 5
- MongoDB via Mongoose 9
- Auth: jsonwebtoken (HS256) + bcryptjs
- Validation: Joi v18
- Middleware: helmet, cors, morgan, dotenv
- Tests: Jest + Supertest (`NODE_OPTIONS=--experimental-vm-modules`)
- Docs: swagger-jsdoc + swagger-ui-express, served at `/api/docs`

## 2. Repository Layout
```
/frontend
  src/
    api/           # axios client + per-resource modules
    components/    # shared UI (shadcn primitives, layout)
    pages/         # route-level components
    routes/        # router config + ProtectedRoute
    hooks/
    context/       # AuthContext
    lib/           # utils, validation schemas
    mocks/         # fixtures used until each integration checkpoint
/backend
  src/
    config/        # env loader, db connection
    middleware/    # auth, errorHandler, validate
    modules/
      auth/
      users/
      hotels/
      rooms/
      reservations/
      reviews/
    utils/         # response envelope, asyncHandler
    server.js
  tests/
```

## 3. API Contract Style

### Response envelope
Every successful response follows:
```json
{
  "success": true,
  "data": <payload>,
  "meta": { "page": 1, "pageSize": 10, "total": 42 }   // only for paginated lists
}
```

### Error envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [
      { "field": "email", "message": "must be a valid email" }
    ]
  }
}
```
- `code` is a stable machine-readable string (e.g. `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`).
- `details` is present only for validation errors; otherwise omitted.

### Status codes
| Code | When |
|------|------|
| 200 | Successful read / update / delete |
| 201 | Resource created |
| 204 | Successful delete with no body (we prefer 200 + envelope; 204 reserved) |
| 400 | Malformed request (bad JSON, missing required body) |
| 401 | Missing or invalid token |
| 403 | Authenticated but not allowed (e.g. cancelling someone else's reservation) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, room not available for given dates, double review) |
| 422 | Joi validation failure (we use 422 for validation, 400 for parse errors) |
| 500 | Unhandled server error |

## 4. Authentication
- Password hashing: bcryptjs, cost factor 10.
- Token: JWT (HS256) signed with `JWT_SECRET`, expiry from `JWT_EXPIRES_IN` (default 7d).
- Payload: `{ sub: userId, role }`.
- Storage: localStorage on the client. **Trade-off accepted for academic scope** — documented here so reviewers know we know. Refresh tokens / httpOnly cookie auth are explicitly out of scope for this iteration.
- Transport: `Authorization: Bearer <token>` header on every protected call.
- `authMiddleware` decodes the token, attaches `req.user = { id, role }`, and rejects with 401 on missing/invalid/expired token.

## 5. Validation
- Every write endpoint goes through a Joi schema via a shared `validate(schema, where)` middleware (`where` ∈ `body | params | query`).
- On failure → 422 + `VALIDATION_ERROR` with `details[]`.

## 6. Error Handling
- A single `errorHandler` middleware is the last `app.use`.
- Controllers wrap async work with `asyncHandler` so thrown errors reach the handler.
- The handler maps known error classes (`ApiError`, `mongoose.Error.ValidationError`, `mongoose.Error.CastError`, JWT errors, Joi errors) to the envelope above.
- In non-prod environments the response includes a `stack` field for debugging.

## 7. Configuration & Environment
- `.env.example` provides all required keys: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`.
- Frontend uses Vite env vars: `VITE_API_BASE_URL` (default `http://localhost:5000/api`).
- CORS allows the frontend origin from `CLIENT_URL`.

## 8. Testing
- Backend: Jest + Supertest. One integration test per route module covering happy path + at least one error path.
- Frontend: no formal unit tests required this milestone — manual checklist + axe-style sanity in the demo.

## 9. Documentation
- Swagger UI at `/api/docs` driven by JSDoc on each route.
- READMEs in `/frontend` and `/backend` describe install, env, run, test.
- API_PLAN.md is kept in sync with the served Swagger.

## 10. Quality Bar
- All write endpoints validated.
- All endpoints return the envelope above; no raw `res.json(doc)` allowed (a helper `ok(res, data)` enforces this).
- No secrets committed; `.env` is gitignored.
- ESLint passes on the frontend.
