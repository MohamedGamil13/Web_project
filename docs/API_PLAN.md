# API Plan

Base URL: `/api`
All responses follow the envelope defined in `TRD.md` §3. Authenticated endpoints require `Authorization: Bearer <jwt>`.

> **Locked decisions:** local-only demo target; shadcn/ui + react-hook-form + zod on the FE; placeholder image URLs seeded into `hotel.images`; reservation `completed` status is computed lazily on read; refresh-token / cookie auth is out of scope; `PATCH /users/me/password` ships in Phase 7.

## 0. Conventions
- Dates are ISO 8601 strings (`YYYY-MM-DD` for date-only, full ISO for timestamps).
- Pagination query: `?page=1&pageSize=10` (defaults 1 / 10, max 50). Response carries `meta.page`, `meta.pageSize`, `meta.total`.
- Sorting query: `?sort=field` or `?sort=-field` for descending. Allowed fields per endpoint listed below.
- All `id` path params are MongoDB ObjectIds. Bad ids → 422 `VALIDATION_ERROR`.

## 1. Module map & owners
| Prefix | Owner | Module |
|--------|-------|--------|
| `/auth` | BE1 | Authentication |
| `/users` | BE1 | Profile (self) |
| `/hotels` | BE2 | Hotel browse + details |
| `/hotels/:id/rooms` | BE2 | Hotel's rooms |
| `/rooms/:id` | BE2 | Single room read |
| `/reservations` | BE3 | Reservations |
| `/hotels/:id/reviews` | BE3 | Hotel reviews list/create |
| `/reviews/:id` | BE3 | Update / delete own review |

## 2. Endpoints

### 2.1 Auth (`/auth`) — **shipped in Phase 3**
| Method | Path | Auth | Body | Success | Errors |
|--------|------|------|------|---------|--------|
| POST | `/auth/register` | — | `{ name, email, password, phone? }` | 201 `{ user, token }` | 422 validation, 409 email taken |
| POST | `/auth/login` | — | `{ email, password }` | 200 `{ user, token }` | 422 validation, 401 bad credentials |
| GET | `/auth/me` | user | — | 200 `user` | 401 |
| POST | `/auth/logout` | user | — | 200 `{ ok: true }` | (stateless: client clears token) |

`user` shape returned: `{ id, name, email, role, phone?, avatarUrl?, createdAt, updatedAt }`. `passwordHash` is never returned.

Login error message: `"Invalid email or password"` is used for both an unknown email and a wrong password (no field-level enumeration).
Register conflict: 409 `CONFLICT` with `error.message = "An account with that email already exists"`.

### 2.2 Users (`/users`) — **shipped in Phase 3**
| Method | Path | Auth | Body | Success | Errors |
|--------|------|------|------|---------|--------|
| GET | `/users/me` | user | — | 200 `user` | 401 |
| PATCH | `/users/me` | user | `{ name?, email?, phone?, avatarUrl? }` (≥ 1 field) | 200 `user` | 422 validation, 409 email taken |
| PATCH | `/users/me/password` | user | `{ currentPassword, newPassword }` | 200 `{ ok: true }` | 401 wrong current, 422 | _Phase 7_ |

Empty `phone` / `avatarUrl` strings clear the field. Email change re-checks uniqueness.

### 2.3 Hotels (`/hotels`)
| Method | Path | Auth | Query | Success | Errors |
|--------|------|------|-------|---------|--------|
| GET | `/hotels` | — | `q`, `city`, `minPrice`, `maxPrice`, `minStars`, `amenities` (comma-sep), `sort` (`price`, `-price`, `-rating`, `-createdAt`), `page`, `pageSize` | 200 list of `hotel` + meta | 422 |
| GET | `/hotels/:id` | — | — | 200 `hotelDetail` (hotel + `rooms[]` + `avgRating` + `reviewCount`) | 404 |

`hotel` summary shape: `{ id, name, city, country, starRating, priceFrom, avgRating, reviewCount, thumbnail }`.
`hotelDetail` shape: `hotel` summary + `description`, `address`, `amenities`, `images`, `rooms`.

### 2.4 Rooms (`/rooms`, `/hotels/:id/rooms`)
| Method | Path | Auth | Query | Success | Errors |
|--------|------|------|-------|---------|--------|
| GET | `/hotels/:id/rooms` | — | `checkIn`, `checkOut` (optional; if both present, response includes `available` boolean per room) | 200 list of `room` | 404 hotel |
| GET | `/rooms/:id` | — | — | 200 `room` | 404 |

`room` shape: `{ id, hotel, type, capacity, pricePerNight, quantity, amenities, images, available? }`.

### 2.5 Reservations (`/reservations`)
| Method | Path | Auth | Body / Query | Success | Errors |
|--------|------|------|--------------|---------|--------|
| POST | `/reservations` | user | `{ roomId, checkIn, checkOut, guestCount }` | 201 `reservation` | 422, 404 room, 409 not available |
| GET | `/reservations` | user | `?status=upcoming\|completed\|cancelled` | 200 list of `reservation` (current user only) | 401 |
| GET | `/reservations/:id` | user | — | 200 `reservation` | 401, 403 (not owner), 404 |
| POST | `/reservations/:id/cancel` | user | — | 200 `reservation` (status=`cancelled`) | 403 (not owner), 409 (already cancelled, completed, or < 24h to check-in) |

`reservation` shape: `{ id, user, hotel: { id, name, city }, room: { id, type, pricePerNight }, checkIn, checkOut, nights, guestCount, totalPrice, status, createdAt }`.

### 2.6 Reviews (`/hotels/:id/reviews`, `/reviews/:id`)
| Method | Path | Auth | Body / Query | Success | Errors |
|--------|------|------|--------------|---------|--------|
| GET | `/hotels/:id/reviews` | — | `page`, `pageSize`, `sort` (`-createdAt`, `-rating`) | 200 list of `review` + meta | 404 hotel |
| POST | `/hotels/:id/reviews` | user | `{ rating, comment }` | 201 `review` (or 200 if upsert overwrote existing) | 403 (no completed reservation), 422 |
| PATCH | `/reviews/:id` | user | `{ rating?, comment? }` | 200 `review` | 403, 404, 422 |
| DELETE | `/reviews/:id` | user | — | 200 `{ ok: true }` | 403, 404 |

`review` shape: `{ id, hotel, user: { id, name }, rating, comment, createdAt, updatedAt }`.

### 2.7 Health
| Method | Path | Auth | Success |
|--------|------|------|---------|
| GET | `/api/health` | — | 200 `{ status: "ok", uptime }` |

## 3. Validation Schemas (Joi sketches)
- **register:** `name` 2–80; `email` valid email; `password` min 8, regex `/[A-Za-z]/` and `/[0-9]/`.
- **login:** `email` valid email; `password` non-empty.
- **createReservation:** `roomId` ObjectId; `checkIn` ISO date ≥ today; `checkOut` ISO date > checkIn; `guestCount` int ≥ 1.
- **createReview:** `rating` int 1–5; `comment` ≤ 1000.
- **hotels list query:** `minPrice ≥ 0`, `maxPrice ≥ minPrice`, `minStars` 1–5, `pageSize` ≤ 50.

## 4. Mock Fixtures (FE)
Until each integration checkpoint, `frontend/src/mocks/` provides JSON fixtures matching every shape above. Swapping mock → real is a single import change in `frontend/src/api/<resource>.js`.

## 5. Sample Payloads

### Login success
```json
{
  "success": true,
  "data": {
    "user": { "id": "65f...", "name": "Ada", "email": "ada@x.io", "role": "user", "createdAt": "2026-04-12T10:00:00.000Z" },
    "token": "eyJhbGciOi..."
  }
}
```

### Validation error (422)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "checkOut", "message": "must be after checkIn" }
    ]
  }
}
```

### Conflict (409 — room not available)
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Room is not available for the selected dates"
  }
}
```
