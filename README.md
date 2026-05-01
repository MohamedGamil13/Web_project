# Hotel Booking Web App (Academic Project)

Full-stack hotel booking platform built for a web development course project.

- Frontend: React 19, Vite, Material UI, Formik, Yup
- Backend: Node.js, Express 5, MongoDB (Mongoose), JWT, bcrypt
- API docs: Swagger (`/api/docs`)

Project documents are under [`docs/`](/Volumes/Work/Github/Web_project/docs):
- [`PROJECT_OVERVIEW.md`](/Volumes/Work/Github/Web_project/docs/PROJECT_OVERVIEW.md)
- [`FRD.md`](/Volumes/Work/Github/Web_project/docs/FRD.md)
- [`TRD.md`](/Volumes/Work/Github/Web_project/docs/TRD.md)
- [`DATABASE_SCHEMA.md`](/Volumes/Work/Github/Web_project/docs/DATABASE_SCHEMA.md)
- [`API_PLAN.md`](/Volumes/Work/Github/Web_project/docs/API_PLAN.md)
- [`RUBRIC_STATUS.md`](/Volumes/Work/Github/Web_project/docs/RUBRIC_STATUS.md)

## Idea
The system allows users to:
- register and sign in securely
- browse hotels with search/filter/sort
- view hotel details and room options
- create/cancel reservations
- submit and manage reviews
- manage profile data and avatar
- change password via a protected re-auth flow

## Core Capabilities
- JWT-based authentication and protected routes
- Profile management (`name`, `email`, `phone`, avatar upload/remove)
- Hotel listing with filters and pagination
- Room reservation with availability checks
- Duplicate-overlap protection for same user + same room + overlapping dates
- Review system with rating aggregation
- Swagger API documentation
- Postman collection for quick API testing

## Tech Stack
### Frontend
- React + React Router
- Material UI (`@mui/material`, icons, date pickers)
- Formik + Yup
- Axios

### Backend
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Validation (`Joi`)
- File upload (`multer`) for avatars

## Project Structure
```
/Volumes/Work/Github/Web_project
├── backend/
├── frontend/
└── docs/
```

## Prerequisites
- Node.js 18+ (Node 20 recommended)
- MongoDB (local or Atlas)

## Local Setup
Open two terminals.

### 1) Backend
```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```
Backend runs on `http://localhost:5050` by default.

Useful endpoints:
- API root: [http://localhost:5050/api/v1](http://localhost:5050/api/v1)
- Health: [http://localhost:5050/api/v1/health](http://localhost:5050/api/v1/health)
- Swagger: [http://localhost:5050/api/docs](http://localhost:5050/api/docs)

### 2) Frontend
```bash
cp .env.example .env
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Environment Variables
### Backend (`backend/.env`)
- `PORT` (default `5050`)
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_ROUNDS`
- `CLIENT_URL`

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL` (default `http://localhost:5050/api/v1`)
- `VITE_APP_NAME`

## Demo Accounts (after `npm run seed`)
Password for all seeded users: `Password1`

- `admin@example.com` (admin)
- `alice@example.com` (user)
- `bob@example.com` (user)

## Avatar Storage and Security
- Avatar files are stored locally under backend storage (`backend/storage/avatars`).
- Database stores a file reference (`avatarPath`), not base64 image blobs.
- Client receives `avatarUrl` as API path (`/api/v1/users/:id/avatar`).
- Avatar fetch is protected (auth required).

## Password Change Flow
Implemented as a dedicated route/page:
1. Verify current password: `POST /api/v1/users/me/password/verify`
2. Receive short-lived re-auth token (10 min)
3. Change password: `PATCH /api/v1/users/me/password` with `x-reauth-token`

## Scripts
### Backend
- `npm run dev` — start API with nodemon
- `npm start` — start API
- `npm run seed` — seed users/hotels/rooms
- `npm test` — Jest + Supertest
- `npm run lint` — ESLint
- `npm run prettier` / `prettier:write`

### Frontend
- `npm run dev` — start Vite server
- `npm run build` — production build
- `npm run preview` — preview built app
- `npm run lint` — ESLint
- `npm run prettier` / `prettier:write`

## API Testing
Import [`docs/postman_collection.json`](/Volumes/Work/Github/Web_project/docs/postman_collection.json) in Postman/Insomnia.
