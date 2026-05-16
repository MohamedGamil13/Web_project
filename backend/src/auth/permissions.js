export const PERMISSIONS = {
  USERS_VIEW: "users.view",
  USERS_MANAGE_ROLES: "users.manage_roles",
  USERS_MANAGE_PERMISSIONS: "users.manage_permissions",
  HOTELS_MANAGE: "hotels.manage",
  ROOMS_MANAGE: "rooms.manage",
  RESERVATIONS_MANAGE_VIEW: "reservations.manage.view",
  RESERVATIONS_MANAGE_EDIT: "reservations.manage.edit",
  ANALYTICS_VIEW: "analytics.view",
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const OWNER_PERMISSIONS = ALL_PERMISSIONS;

const ADMIN_PERMISSIONS = [
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.HOTELS_MANAGE,
  PERMISSIONS.ROOMS_MANAGE,
  PERMISSIONS.RESERVATIONS_MANAGE_VIEW,
  PERMISSIONS.RESERVATIONS_MANAGE_EDIT,
  PERMISSIONS.ANALYTICS_VIEW,
];

const USER_PERMISSIONS = [];

export function getPermissionsForRole(role) {
  switch (role) {
    case "owner":
      return OWNER_PERMISSIONS;
    case "admin":
      return ADMIN_PERMISSIONS;
    case "user":
    default:
      return USER_PERMISSIONS;
  }
}

export function resolvePermissions(role, overrides = null) {
  const base = new Set(getPermissionsForRole(role));
  if (role === "owner") return [...base];

  const allow = Array.isArray(overrides?.allow) ? overrides.allow : [];
  const deny = Array.isArray(overrides?.deny) ? overrides.deny : [];

  for (const permission of allow) {
    if (ALL_PERMISSIONS.includes(permission)) base.add(permission);
  }
  for (const permission of deny) {
    base.delete(permission);
  }

  return [...base];
}
