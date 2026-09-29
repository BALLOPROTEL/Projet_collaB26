import test from "node:test";
import assert from "node:assert/strict";
import { getRoles, hasRole } from "../src/roles.js";

test("getRoles returns Keycloak realm roles", () => {
  const payload = { realm_access: { roles: ["USER", "ADMIN"] } };
  assert.deepEqual(getRoles(payload), ["USER", "ADMIN"]);
});

test("hasRole validates USER and ADMIN", () => {
  const payload = { realm_access: { roles: ["USER"] } };
  assert.equal(hasRole(payload, "USER"), true);
  assert.equal(hasRole(payload, "ADMIN"), false);
});

test("missing roles are safe", () => {
  assert.deepEqual(getRoles({}), []);
});
