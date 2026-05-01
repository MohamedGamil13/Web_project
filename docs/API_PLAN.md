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

### 2.3 Hotels (`/hotels`) — **shipped in Phase 4**
| Method | Path | Auth | Query / Body | Success | Errors |
|--------|------|------|--------------|---------|--------|
| GET | `/hotels` | — | `q`, `city`, `minPrice`, `maxPrice`, `minStars`, `amenities` (comma-sep, lowercased), `sort` (`price`, `-price`, `-rating`, `name`, `-name`, `-createdAt`), `page` (≥ 1, default 1), `pageSize` (1–50, default 10) | 200 list of `hotel` + `meta: { page, pageSize, total }` | 422 (e.g. `maxPrice < minPrice`, unknown sort) |
| GET | `/hotels/:id` | — | — | 200 `hotelDetail` (hotel + `rooms[]`) | 422 invalid id, 404 |
| GET | `/hotels/:id/rooms` | — | — | 200 list of `room` | 422, 404 hotel |
| POST | `/hotels` | admin | `{ name, city, country, starRating, description?, address?, amenities?, images?, priceFrom? }` | 201 `hotel` | 401, 403, 422 |
| PATCH | `/hotels/:id` | admin | partial of create body, ≥ 1 field | 200 `hotel` | 401, 403, 422, 404 |
| DELETE | `/hotels/:id` | admin | — | 200 `{ id }` (cascades rooms) | 401, 403, 404 |

`hotel` summary shape: `{ id, name, city, country, starRating, amenities, priceFrom, reviewAvg, reviewCount, thumbnail }`.
`hotelDetail` shape: `hotel` summary + `description`, `address`, `images`, `rooms[]`.

### 2.4 Rooms (`/rooms`, `/hotels/:id/rooms`)
| Method | Path | Auth | Query | Success | Errors |
|--------|------|------|-------|---------|--------|
| GET | `/hotels/:id/rooms` | — | (Phase 5: `checkIn`, `checkOut` to populate `available`) | 200 list of `room` | 422, 404 hotel |
| GET | `/rooms/:id` | — | — | 200 `room` | 404 | _Phase 5_ |

`room` shape: `{ id, hotel, roomType, capacity, pricePerNight, quantity, amenities, images, available? }`.

### 2.5 Reservations (`/reservations`) — **shipped in Phase 5**
All endpoints require `Authorization: Bearer <jwt>`. Users only ever see and act on their own reservations.

| Method | Path | Auth | Body / Query | Success | Errors |
|--------|------|------|--------------|---------|--------|
| POST | `/reservations` | user | `{ roomId, checkIn, checkOut, guests }` | 201 `reservation` | 401, 422, 404 room, 409 not available |
| GET | `/reservations/me` | user | — | 200 list of `reservation` (current user only, sorted by check-in desc) | 401 |
| GET | `/reservations/:id` | user | — | 200 `reservation` | 401, 403 (not owner), 404 |
| PATCH | `/reservations/:id/cancel` | user | — | 200 `reservation` (status=`cancelled`, `cancelledAt` set) | 401, 403 (not owner), 404, 409 (already cancelled, or check-in already started) |

**Validation (POST):**
- `roomId` is a 24-char ObjectId (422 otherwise).
- `checkIn` / `checkOut` ISO date; `checkOut` must be strictly later than `checkIn`.
- `guests` is an integer ≥ 1; capped at the room's `capacity` server-side (422 with `{ field: 'guests', message: '...' }`).
- `checkIn` may not be in the past (422 with `{ field: 'checkIn' }`).

**Availability (POST):** the server counts active reservations for `roomId` whose date range overlaps `[checkIn, checkOut)`. Two ranges overlap iff `existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn`. If the count ≥ `room.quantity` → 409 `CONFLICT` with message `"Room is not available for the selected dates"`.

**Price calculation:** `nights = round((checkOut - checkIn) / 1d)`, `totalPrice = nights * room.pricePerNight`. Prices are snapshotted onto the reservation document at create time so subsequent room price changes don't retroactively alter past bookings.

**Cancellation:** allowed only on `status: 'active'` reservations whose `checkIn` is still in the future. Already-cancelled or already-started bookings → 409.

`reservation` shape:
```json
{
  "id": "…",
  "userId": "…",
  "status": "active" | "cancelled",
  "checkIn": "2026-12-01T00:00:00.000Z",
  "checkOut": "2026-12-05T00:00:00.000Z",
  "guests": 2,
  "nights": 4,
  "totalPrice": 560,
  "cancelledAt": null,
  "createdAt": "2026-05-01T…",
  "hotel": { "id": "…", "name": "…", "city": "…", "country": "…" },
  "room": { "id": "…", "roomType": "double", "pricePerNight": 140, "capacity": 2 }
}
```

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
