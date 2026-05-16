# Hotel Booking Web App

Full-stack hotel booking platform with a React SPA frontend and Node.js/Express API backend.

- Frontend: React 19, Vite, Material UI, Formik, Yup
- Backend: Node.js, Express 5, MongoDB (Mongoose), JWT, bcrypt
- API docs: Swagger (`/api/docs`)

Project documents:
- [`docs/PROJECT_OVERVIEW.md`](./docs/PROJECT_OVERVIEW.md)
- [`docs/FRD.md`](./docs/FRD.md)
- [`docs/TRD.md`](./docs/TRD.md)
- [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md)
- [`docs/API_PLAN.md`](./docs/API_PLAN.md)

## Idea
The system allows users to:
- register and sign in securely
- browse hotels with search/filter/sort
- view hotel details and room options
- create/cancel reservations
- submit and manage reviews
- receive and manage reservation notifications
- manage profile data and avatar
- change password via a protected re-auth flow

## Core Capabilities
- JWT-based authentication and protected routes
- Role and permission-based access control (`owner`, `admin`, `user`)
- Owner-managed admin permission overrides (`allow[]` / `deny[]`)
- Profile management (`name`, `email`, `phone`, avatar upload/remove)
- Hotel listing with filters and pagination
- Room reservation with availability checks
- Duplicate-overlap protection for same user + same room + overlapping dates
- Review system with rating aggregation
- Reservation lifecycle notifications (created/updated/cancelled)
- Staff occupancy insights with threshold alerts and sell-out forecast
- Swagger API documentation
- Postman collection for quick API testing

## Project Structure
```text
|-- backend/
|-- frontend/
|-- docs/
```

## Prerequisites
- Node.js 18+ (Node 20 recommended)
- MongoDB (local or Atlas)

## Local Setup
Open two terminals.

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
Backend runs on `http://localhost:5050`.

### 2) Frontend
```bash
cd frontend
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

## Seed Accounts (after `npm run seed`)
Password for all seeded users: `Password1`

- `owner@example.com` (owner)
- `admin@example.com` (admin)
- `alice@example.com` (user)
- `bob@example.com` (user)

## Password Change Flow
1. Verify current password: `POST /api/v1/users/me/password/verify`
2. Receive short-lived re-auth token (10 min)
3. Change password: `PATCH /api/v1/users/me/password` with `x-reauth-token`

## Scripts
### Backend
- `npm run dev` - start API with nodemon
- `npm start` - start API
- `npm run seed` - seed users/hotels/rooms
- `npm test` - Jest + Supertest
- `npm run lint` - ESLint
- `npm run prettier` / `prettier:write`

### Frontend
- `npm run dev` - start Vite server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run lint` - ESLint
- `npm run prettier` / `prettier:write`

## API Testing
Import [`docs/postman_collection.json`](./docs/postman_collection.json) in Postman/Insomnia.

