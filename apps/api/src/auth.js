import { createRemoteJWKSet, jwtVerify } from "jose";
import { hasRole } from "./roles.js";

const issuer =
  process.env.KEYCLOAK_ISSUER ??
  "http://localhost:8082/realms/collector";

const jwks = createRemoteJWKSet(
  new URL(`${issuer}/protocol/openid-connect/certs`)
);

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer });
    req.user = payload;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || !hasRole(req.user, role)) {
      return res.status(403).json({ error: `Role ${role} required` });
    }
    next();
  };
}
