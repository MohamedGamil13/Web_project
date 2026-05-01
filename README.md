# Hotel Booking — Academic Project

Full-stack hotel booking app. Frontend is React + Vite + shadcn/ui, backend is Express + MongoDB. See [`docs/`](docs/) for the planning artifacts (`PROJECT_OVERVIEW`, `FRD`, `TRD`, `DATABASE_SCHEMA`, `API_PLAN`).

```
.
├── backend/      # Express + Mongoose API (Node 18+)
├── frontend/     # Vite + React 19 SPA
└── docs/         # Planning & design docs
```

## Prerequisites
- Node.js 18+ (Node 20 recommended)
- A running MongoDB instance — either local (`mongod`) or a free MongoDB Atlas cluster

## Quick start

Open two terminals.

### 1. Backend (`backend/`)
```bash
cd backend
cp .env.example .env       # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev                # starts the API on http://localhost:5050
```
Useful URLs once running:
- Health: http://localhost:5050/api/v1/health
- API root: http://localhost:5050/api/v1
- Swagger UI: http://localhost:5050/api/docs
- OpenAPI JSON: http://localhost:5050/api/docs.json

Run tests:
```bash
npm test
```

### 2. Frontend (`frontend/`)
```bash
cd frontend
cp .env.example .env       # default points at http://localhost:5050/api/v1
npm install
npm run dev                # starts the SPA on http://localhost:5173
```

Build / preview:
```bash
npm run build
npm run preview
```

## Project layout

### `backend/src`
```
config/        # env loader, DB connection
controllers/   # request handlers
docs/          # Swagger setup
middleware/    # auth, errorHandler, notFound, security, validate
models/        # Mongoose models (Phase 2 onward)
routes/        # /api  →  /api/v1  →  feature routers
services/      # business logic
utils/         # ApiError, asyncHandler, response envelope
validators/    # Joi/Zod request schemas
app.js, server.js
```

### `frontend/src`
```
app/                    # Providers (MUI ThemeProvider + AuthProvider), App, Home/NotFound
components/
  shared/               # Navbar, Footer, Layout, ConfirmDialog
features/
  auth/                 # AuthContext, schemas (Yup), api, pages
  hotels/               # api, filters, HotelCard, HotelFilters, pages
  reservations/         # api, schemas (Yup), ReserveDialog, pages
  reviews/              # api (Phase 7)
hooks/                  # useAuth, useDebouncedValue
lib/                    # apiClient (axios), env, formik-mui (FTextField helper)
routes/                 # AppRoutes, ProtectedRoute
```

## Conventions
- All API responses follow the envelope in `docs/TRD.md` §3.
- Routes are versioned at `/api/v1/...`.
- Frontend forms: **Formik + Yup** for state and validation.
- Frontend UI: **Material-UI v6 + Emotion** — single component library across the entire frontend. No Tailwind, no shadcn, no Radix in the runtime.
- JWT is stored in `localStorage` for academic scope (documented trade-off).

## Troubleshooting
- **`connect ECONNREFUSED 127.0.0.1:27017`** — start MongoDB locally (`brew services start mongodb-community`) or point `MONGO_URI` at an Atlas cluster.
- **macOS: port 5000 returns HTTP 403** — that's the AirPlay receiver. Disable it in *System Settings → General → AirDrop & Handoff*, or change `PORT` in `backend/.env` (e.g. `5050`) and update `VITE_API_BASE_URL` in `frontend/.env` to match.
- **`401` on every request after restart** — token expired; the API client clears it automatically and the next request will be unauthenticated.

## Team workflow
See `docs/PROJECT_OVERVIEW.md` for phases, integration checkpoints (CP-0 → CP-5), and the FE/BE responsibility split.
