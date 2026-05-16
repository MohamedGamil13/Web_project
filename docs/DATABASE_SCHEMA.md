# Database Schema

MongoDB via Mongoose. Collections use `timestamps: true` (`createdAt`, `updatedAt`).

## 1. Relationship Overview

```text
User (1) ----< Reservation >---- (1) Room ---- (N..1) ---- Hotel
  |                                           |
  +----------------< Review >-----------------+
```

- Hotel has many rooms.
- User has many reservations.
- Reservation belongs to one user, one room, and one denormalized hotel id.
- Review belongs to one user and one hotel, with one-review-per-user-per-hotel uniqueness.

## 2. Collections

### 2.1 `users`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `name` | String | required, 2-80 |
| `email` | String | required, lowercase, unique |
| `passwordHash` | String | required, `select: false` |
| `phone` | String | optional |
| `avatarPath` | String | optional; internal storage filename |
| `role` | String | enum: `owner` \| `admin` \| `user`, default `user` |
| `permissionOverrides.allow` | [String] | explicit grants for admin accounts |
| `permissionOverrides.deny` | [String] | explicit revocations for admin accounts |
| `createdAt` / `updatedAt` | Date | auto |

Indexes:
- `{ email: 1 }` unique.
- `{ role: 1 }` unique partial index for `{ role: "owner" }` (exactly one owner).

Serialization notes:
- `passwordHash` and `avatarPath` are hidden from API output.
- `avatarUrl` is exposed as `/api/v1/users/<id>/avatar`.

### 2.2 `hotels`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `name` | String | required |
| `description` | String | optional |
| `city` | String | required |
| `country` | String | required |
| `address` | String | optional |
| `starRating` | Number | 1-5 |
| `amenities` | [String] | optional |
| `images` | [String] | URL list |
| `priceFrom` | Number | denormalized minimum room price |
| `reviewAvg` | Number | computed |
| `reviewCount` | Number | computed |
| `createdAt` / `updatedAt` | Date | auto |

Indexes:
- `{ city: 1 }`
- `{ priceFrom: 1 }`
- `{ reviewAvg: -1 }`
- text index on hotel search fields (`name`, `city`, `description`).

### 2.3 `rooms`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `hotel` | ObjectId ref `Hotel` | required, indexed |
| `roomType` | String | enum: `single` \| `double` \| `suite` \| `family` |
| `capacity` | Number | required |
| `pricePerNight` | Number | required |
| `quantity` | Number | required/default 1 |
| `amenities` | [String] | optional |
| `images` | [String] | optional |
| `createdAt` / `updatedAt` | Date | auto |

Indexes:
- `{ hotel: 1 }`

### 2.4 `reservations`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `userId` | ObjectId ref `User` | required, indexed |
| `roomId` | ObjectId ref `Room` | required, indexed |
| `hotelId` | ObjectId ref `Hotel` | required, indexed |
| `checkIn` | Date | required, inclusive |
| `checkOut` | Date | required, exclusive |
| `guests` | Number | required |
| `nights` | Number | computed |
| `totalPrice` | Number | computed snapshot |
| `pricing.subtotal` | Number | nights × room price |
| `pricing.serviceFee` | Number | 8% |
| `pricing.taxAmount` | Number | 14% |
| `pricing.total` | Number | subtotal + fees + tax |
| `pricing.rules.serviceFeeRate` | Number | `0.08` |
| `pricing.rules.taxRate` | Number | `0.14` |
| `workflowEvents[]` | Array | includes `event`, `actorRole`, `actorUserId`, `message`, `at` |
| `status` | String | enum: `active` \| `cancelled` |
| `cancelledAt` | Date | optional |
| `createdAt` / `updatedAt` | Date | auto |

Indexes:
- `{ userId: 1, checkIn: -1 }`
- `{ roomId: 1, status: 1, checkIn: 1, checkOut: 1 }` for overlap checks.

Availability rule:
- For a room/date range, overlapping active reservations must remain `< room.quantity`.

### 2.5 `reviews`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `user` | ObjectId ref `User` | required |
| `hotel` | ObjectId ref `Hotel` | required, indexed |
| `rating` | Number | required, integer 1-5 |
| `comment` | String | optional, max 1000 |
| `createdAt` / `updatedAt` | Date | auto |

Indexes:
- `{ hotel: 1, createdAt: -1 }`
- `{ user: 1, hotel: 1 }` unique (one review per user per hotel).

Eligibility:
- Any authenticated user can post a review.

## 3. Seed Data
- Seed script: `backend/src/scripts/seed.js`.
- Inserts owner/admin/user accounts, sample hotels/rooms, and baseline data for validation.
