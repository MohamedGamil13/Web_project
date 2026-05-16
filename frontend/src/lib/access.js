export function isOwner(role) {
  return role === "owner";
}

export function isAdmin(role) {
  return role === "admin";
}

export function isStaff(role) {
  return isOwner(role) || isAdmin(role);
}

