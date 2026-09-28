export function getRoles(payload = {}) {
  return Array.isArray(payload?.realm_access?.roles)
    ? payload.realm_access.roles
    : [];
}

export function hasRole(payload, role) {
  return getRoles(payload).includes(role);
}
