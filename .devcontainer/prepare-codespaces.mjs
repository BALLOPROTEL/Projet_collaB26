import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

if (process.env.CODESPACES !== "true") {
  console.error("[Collector] This script is intended for GitHub Codespaces.");
  process.exit(1);
}

const name = process.env.CODESPACE_NAME;
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

if (!name || !domain) {
  throw new Error("Missing GitHub Codespaces environment variables.");
}

const url = (port) => `https://${name}-${port}.${domain}`;
const webUrl = url(5173);
const apiUrl = url(3000);
const keycloakUrl = url(8082);
const rabbitUrl = url(15674);

await mkdir(".codespaces", { recursive: true });

const realmPath = path.join("infra", "keycloak", "collector-realm.json");
const realm = JSON.parse(await readFile(realmPath, "utf8"));
const webClient = realm.clients?.find(
  (client) => client.clientId === "collector-web",
);

if (!webClient) {
  throw new Error("collector-web client not found in Keycloak realm.");
}

webClient.rootUrl = webUrl;
webClient.baseUrl = webUrl;
webClient.redirectUris = [`${webUrl}/*`];
webClient.webOrigins = [webUrl];
webClient.attributes = {
  ...(webClient.attributes ?? {}),
  "pkce.code.challenge.method": "S256",
  "post.logout.redirect.uris": `${webUrl}/*`,
};

await writeFile(
  path.join(".codespaces", "collector-realm.json"),
  `${JSON.stringify(realm, null, 2)}\n`,
);

await writeFile(
  path.join(".codespaces", "codespace.env"),
  [
    `CODESPACE_WEB_URL=${webUrl}`,
    `CODESPACE_API_URL=${apiUrl}`,
    `CODESPACE_KEYCLOAK_URL=${keycloakUrl}`,
    `CODESPACE_KEYCLOAK_ISSUER=${keycloakUrl}/realms/collector`,
    `CODESPACE_RABBIT_URL=${rabbitUrl}`,
    "",
  ].join("\n"),
);

console.log(`[Collector] Web: ${webUrl}`);
console.log(`[Collector] API: ${apiUrl}`);
console.log(`[Collector] Keycloak: ${keycloakUrl}`);
console.log(`[Collector] RabbitMQ: ${rabbitUrl}`);
