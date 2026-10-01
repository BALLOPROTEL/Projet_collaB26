import { expect, test } from "@playwright/test";

async function login(page, username, password) {
  await page.goto("/");
  await expect(page.locator("#auth-status")).toContainText(
    /Catalogue public accessible|Session active/,
    { timeout: 30_000 }
  );

  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/localhost:8082/);

  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);

  await Promise.all([
    page.waitForURL(/localhost:5173/),
    page.locator("#kc-login").click()
  ]);
}

test("le catalogue public est visible sans authentification", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Objets disponibles" })).toBeVisible();

  await expect.poll(async () => page.locator("article.card").count(), {
    timeout: 20_000
  }).toBeGreaterThanOrEqual(3);
});

test("USER crée une annonce propagée jusqu'au catalogue", async ({ page }) => {
  await login(page, "user1", "User123!");

  await expect(page.locator("#user-badge")).toContainText("user1");
  await expect(page.locator("#account-panel")).toBeVisible();
  await expect(page.locator("#listing-panel")).toBeVisible();
  await expect(page.locator("#admin-panel")).toBeHidden();

  const title = `E2E Collector ${Date.now()}`;

  await page.getByPlaceholder("Titre de l'objet").fill(title);
  await page.getByPlaceholder("Description").fill(
    "Annonce créée automatiquement par Playwright"
  );
  await page.getByPlaceholder("Prix en €").fill("57.90");
  await page.getByRole("button", { name: "Publier l'annonce" }).click();

  await expect(page.locator("#listing-message")).toContainText(
    "Annonce créée et projetée dans le catalogue via RabbitMQ.",
    { timeout: 20_000 }
  );

  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});

test("ADMIN accède à la route d'administration", async ({ page }) => {
  await login(page, "admin1", "Admin123!");

  await expect(page.locator("#user-badge")).toContainText("admin1");
  await expect(page.locator("#admin-panel")).toBeVisible();

  await page.getByRole("button", { name: "Tester l'accès admin" }).click();
  await expect(page.locator("#admin-output")).toContainText(
    "Admin access granted"
  );
});
