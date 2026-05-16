# API Plan

Base URL: `http://localhost:5050/api/v1`
All successful responses use `{ success, data, meta? }` envelope. Authenticated endpoints require `Authorization: Bearer <jwt>`.

## 0. Conventions
- Dates: ISO 8601 strings.
- Pagination: `page` (default 1), `pageSize` (default 10, max 50).
- IDs: MongoDB ObjectId. Invalid IDs return 422.

## 1. Modules
- `/auth` Authentication
- `/users` Profile, roles, permission management
- `/hotels` Hotel browse and management
- `/rooms` Room read/update/delete
- `/reservations` Reservation lifecycle
- `/reviews` Review lifecycle
- `/notifications` User notifications
- `/analytics` Occupancy insights

## 2. Endpoints

### 2.1 Auth
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account and issue JWT |
| POST | `/auth/login` | Public | Login and issue JWT |
| GET | `/auth/me` | User | Current user |
| POST | `/auth/logout` | User | Stateless logout acknowledgement |

### 2.2 Users
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/users/me` | User | Get own profile |
| PATCH | `/users/me` | User | Update own profile |
| POST | `/users/me/password/verify` | User | Verify current password, returns reauth token |
| PATCH | `/users/me/password` | User | Change password with `x-reauth-token` |
| POST | `/users/me/avatar` | User | Upload avatar |
| DELETE | `/users/me/avatar` | User | Remove avatar |
| GET | `/users/:id/avatar` | User | Serve avatar image |
| GET | `/users` | Admin/Owner | List users |
| PATCH | `/users/:id/role` | Owner | Change role `user` or `admin` |
| GET | `/users/:id/permissions` | Owner | Get admin permission profile |
| PATCH | `/users/:id/permissions` | Owner | Update admin permission overrides |

Permission override payload:
```json
{ "allow": ["analytics.view"], "deny": ["rooms.manage"] }
```

### 2.3 Hotels
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/hotels` | Public | List hotels with filters |
| GET | `/hotels/:id` | Public | Hotel details |
| GET | `/hotels/:id/rooms` | Public | Rooms by hotel |
| POST | `/hotels` | Admin/Owner | Create hotel |
| PATCH | `/hotels/:id` | Admin/Owner | Update hotel |
| DELETE | `/hotels/:id` | Admin/Owner | Delete hotel |

### 2.4 Rooms
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/rooms/:id` | Public | Get room |
| PATCH | `/rooms/:id` | Admin/Owner | Update room |
| DELETE | `/rooms/:id` | Admin/Owner | Delete room |

### 2.5 Reservations
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/reservations` | User | Create reservation |
| GET | `/reservations/me` | User | List own reservations |
| GET | `/reservations/manage` | Admin/Owner | Staff reservations list |
| GET | `/reservations/:id` | User/Admin/Owner | Get reservation |
| GET | `/reservations/:id/timeline` | User/Admin/Owner | Workflow timeline |
| PATCH | `/reservations/:id` | Admin/Owner | Staff update reservation |
| PATCH | `/reservations/:id/cancel` | User/Admin/Owner | Cancel reservation |

### 2.6 Reviews
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/hotels/:id/reviews` | Public | List hotel reviews |
| POST | `/hotels/:id/reviews` | User | Create review |
| GET | `/hotels/:id/reviews/me` | User | Get own review for hotel |
| PATCH | `/reviews/:id` | User | Update own review |
| DELETE | `/reviews/:id` | User | Delete own review |

### 2.7 Notifications
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/notifications/me` | User | List own notifications |
| PATCH | `/notifications/:id/read` | User | Mark as read |

### 2.8 Analytics
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/analytics/occupancy-insights` | Admin/Owner | Occupancy metrics and forecast |

## 3. Role and Permission Notes
- Roles: `owner`, `admin`, `user`.
- Exactly one owner exists.
- Route access is permission-driven.
- Owner can edit admin permission overrides (`allow[]`, `deny[]`).
- Owner permissions cannot be overridden.
