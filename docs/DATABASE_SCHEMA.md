# Database Schema

MongoDB via Mongoose. All collections include `createdAt` and `updatedAt` from `{ timestamps: true }`. All `_id` values are MongoDB ObjectIds.

## 1. Entity Relationship Overview

```
User (1) ────< Reservation >──── (1) Room ────(N..1)──── Hotel
  │                                                        │
  └──────────────< Review >─────────────────────────────────┘
                  (1 review per (user, hotel))
```

- A **Hotel** has many **Rooms**.
- A **User** has many **Reservations**.
- A **Reservation** belongs to exactly one **User** and one **Room** (and via the room, one **Hotel**, denormalized for query speed).
- A **Review** belongs to one **User** and one **Hotel**; uniqueness enforced on `(user, hotel)`.

## 2. Collections

### 2.1 `users`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `name` | String, required, 2–80 chars | |
| `email` | String, required, lowercase, **unique index** | |
| `passwordHash` | String, required | bcrypt; never returned by the API |
| `role` | String enum: `user` \| `admin`, default `user` | |
| `avatarUrl` | String, optional | |
| `createdAt`/`updatedAt` | Date | auto |

**Indexes:** `{ email: 1 }` unique.

**Hidden fields on serialization:** `passwordHash`, `__v`.

### 2.2 `hotels`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `name` | String, required | |
| `description` | String | |
| `city` | String, required, indexed | search target |
| `country` | String, required | |
| `address` | String | |
| `starRating` | Number 1–5 | hotel-class rating, integer |
| `amenities` | [String] | e.g. `wifi`, `pool`, `parking`, `breakfast`, `gym` |
| `images` | [String] | URLs; seeded with placeholder links (e.g. `https://picsum.photos/...`) |
| `priceFrom` | Number | denormalized minimum room price for sorting/listing |
| `avgRating` | Number, default 0 | computed from reviews |
| `reviewCount` | Number, default 0 | computed |
| `createdAt`/`updatedAt` | Date | auto |

**Indexes:** `{ city: 1 }`, `{ priceFrom: 1 }`, `{ avgRating: -1 }`, text index on `{ name, city, description }` for keyword search.

### 2.3 `rooms`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `hotel` | ObjectId ref `Hotel`, required, indexed | |
| `type` | String enum: `single` \| `double` \| `suite` \| `family` | |
| `capacity` | Number, required, 1–8 | |
| `pricePerNight` | Number, required, ≥ 0 | |
| `quantity` | Number, default 1 | how many physical rooms of this type the hotel has |
| `amenities` | [String] | optional, room-specific |
| `images` | [String] | |
| `createdAt`/`updatedAt` | Date | auto |

**Indexes:** `{ hotel: 1 }`.

**Note on availability:** availability is computed at query time from overlapping reservations against `quantity` (no separate inventory collection).

### 2.4 `reservations`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `user` | ObjectId ref `User`, required, indexed | |
| `room` | ObjectId ref `Room`, required, indexed | |
| `hotel` | ObjectId ref `Hotel`, required, indexed | denormalized for list/lookup |
| `checkIn` | Date, required | inclusive |
| `checkOut` | Date, required | exclusive; must be `> checkIn` |
| `guestCount` | Number, required, ≥ 1 | |
| `nights` | Number | computed = `(checkOut - checkIn) / 1d` |
| `totalPrice` | Number | `nights * room.pricePerNight` (snapshot at create) |
| `status` | String enum: `upcoming` \| `completed` \| `cancelled`, default `upcoming` | |
| `cancelledAt` | Date | optional |
| `createdAt`/`updatedAt` | Date | auto |

**Indexes:** `{ user: 1, status: 1, checkIn: -1 }`, `{ room: 1, checkIn: 1, checkOut: 1 }` (used by the availability check).

**Status transitions:**
- `upcoming` → `cancelled` (user, ≥ 24h before `checkIn`)
- `upcoming` → `completed` — **computed lazily on read** (server-side): on every reservation read, if `status = upcoming` and `now >= checkOut`, the document is updated to `completed` before being returned. No scheduler.

**Availability rule:** a new reservation `R` is allowed only if, for the same `room`, the count of reservations with `status = upcoming` whose date range `[checkIn, checkOut)` overlaps `[R.checkIn, R.checkOut)` is `< room.quantity`. Two ranges overlap iff `existing.checkIn < R.checkOut AND existing.checkOut > R.checkIn`.

### 2.5 `reviews`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `user` | ObjectId ref `User`, required | |
| `hotel` | ObjectId ref `Hotel`, required, indexed | |
| `rating` | Number 1–5, required, integer | |
| `comment` | String, ≤ 1000 chars | |
| `createdAt`/`updatedAt` | Date | auto |

**Indexes:** `{ hotel: 1, createdAt: -1 }`, `{ user: 1, hotel: 1 }` **unique** (one review per user per hotel; updates overwrite).

**Eligibility rule:** a user may post a review for `hotel` only if they have at least one reservation for that hotel with `status = completed`. Enforced at the controller level.

**Aggregate maintenance:** when a review is created, updated, or deleted, the hotel's `avgRating` and `reviewCount` are recomputed in the same request.

## 3. Seed Data
A seed script (`backend/src/scripts/seed.js`, written by BE2) inserts:
- 1 admin user, 3 regular users.
- ~10 hotels across 3–4 cities, each with 3–5 rooms.
- A handful of reservations and reviews for demoing.

## 4. Constants (referenced by code)
- `CANCEL_CUTOFF_HOURS = 24`
- `PAGE_SIZE_DEFAULT = 10`, `PAGE_SIZE_MAX = 50`
- `BCRYPT_ROUNDS = 10`
