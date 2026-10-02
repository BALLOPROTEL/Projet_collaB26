import Keycloak from "keycloak-js";
import "./style.css";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8082",
  realm: "collector",
  clientId: "collector-web"
});

const state = {
  authenticated: false,
  username: null,
  roles: [],
  authReady: false
};

const app = document.querySelector("#app");

app.innerHTML = `
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">C</span>
        <span>Collector.shop</span>
      </div>
      <div class="actions">
        <span id="user-badge" class="muted">Visiteur</span>
        <button id="login-btn" class="btn">Se connecter</button>
        <button id="logout-btn" class="btn secondary hidden">Se déconnecter</button>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="eyebrow">Prototype microservices · projet collaboratif CESI</div>
        <h1>Des objets rares. Des échanges maîtrisés.</h1>
        <p>
          Cette version de démonstration valide le catalogue public, l'authentification,
          les rôles USER / ADMIN, la création d'une annonce et la communication avec le backend.
        </p>
        <div id="auth-status" class="status">Initialisation de l'authentification…</div>
      </section>

      <section class="content">
        <div class="section-head">
          <div>
            <div class="eyebrow">Catalogue public</div>
            <h2>Objets disponibles</h2>
          </div>
          <button id="refresh-btn" class="btn secondary">Actualiser</button>
        </div>

        <div id="catalog" class="grid"></div>

        <div class="panels">
          <section id="account-panel" class="panel hidden">
            <h3>Espace utilisateur</h3>
            <p class="muted">
              Cette zone prouve qu'un utilisateur authentifié peut accéder à des fonctions privées.
            </p>
            <pre id="me-output">Chargement…</pre>
          </section>

          <section id="listing-panel" class="panel hidden">
            <h3>Créer une annonce</h3>
            <form id="listing-form">
              <input name="title" placeholder="Titre de l'objet" required maxlength="120" />
              <textarea name="description" placeholder="Description" required></textarea>
              <input name="price" type="number" step="0.01" min="0" placeholder="Prix en €" required />
              <button class="btn" type="submit">Publier l'annonce</button>
            </form>
            <p id="listing-message" class="muted"></p>
          </section>

          <section id="admin-panel" class="panel hidden">
            <h3>Espace administration</h3>
            <p class="muted">
              Ce bloc est visible uniquement avec le rôle ADMIN.
            </p>
            <button id="admin-check-btn" class="btn">Tester l'accès admin</button>
            <pre id="admin-output">Aucun test lancé.</pre>
          </section>
        </div>
      </section>
    </main>

    <footer>
      Collector.shop · Prototype pédagogique · Données et comptes de démonstration uniquement.
    </footer>
  </div>
`;

const elements = {
  login: document.querySelector("#login-btn"),
  logout: document.querySelector("#logout-btn"),
  badge: document.querySelector("#user-badge"),
  authStatus: document.querySelector("#auth-status"),
  catalog: document.querySelector("#catalog"),
  refresh: document.querySelector("#refresh-btn"),
  accountPanel: document.querySelector("#account-panel"),
  listingPanel: document.querySelector("#listing-panel"),
  adminPanel: document.querySelector("#admin-panel"),
  meOutput: document.querySelector("#me-output"),
  listingForm: document.querySelector("#listing-form"),
  listingMessage: document.querySelector("#listing-message"),
  adminCheck: document.querySelector("#admin-check-btn"),
  adminOutput: document.querySelector("#admin-output")
};

function hasRole(role) {
  return state.roles.includes(role);
}

function renderSession() {
  elements.badge.textContent = state.authenticated
    ? `${state.username} · ${state.roles.join(", ")}`
    : "Visiteur";

  elements.login.classList.toggle("hidden", state.authenticated);
  elements.logout.classList.toggle("hidden", !state.authenticated);
  elements.accountPanel.classList.toggle("hidden", !state.authenticated);
  elements.listingPanel.classList.toggle("hidden", !state.authenticated);
  elements.adminPanel.classList.toggle("hidden", !hasRole("ADMIN"));

  if (!state.authReady) {
    elements.authStatus.textContent = "Authentification indisponible pour le moment.";
  } else if (state.authenticated) {
    elements.authStatus.textContent =
      "Session active : les routes privées peuvent être testées.";
  } else {
    elements.authStatus.textContent =
      "Catalogue public accessible. Connectez-vous pour tester les fonctions privées.";
  }
}

async function ensureFreshToken() {
  if (!state.authenticated) return null;
  await keycloak.updateToken(30);
  return keycloak.token;
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers ?? {});
  const token = await ensureFreshToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body;
}

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

async function loadCatalog() {
  elements.catalog.innerHTML = "<p>Chargement du catalogue…</p>";

  try {
    const items = await apiFetch("/catalog");
    elements.catalog.innerHTML = items
      .map(
        (item) => `
          <article class="card">
            <div class="thumb" aria-hidden="true">✦</div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="muted">${escapeHtml(item.description)}</p>
            <div class="price">${formatPrice(item.price)}</div>
            <p class="muted">Vendeur : ${escapeHtml(item.seller)}</p>
          </article>
        `
      )
      .join("");
  } catch (error) {
    elements.catalog.innerHTML =
      `<p>Impossible de charger le catalogue : ${escapeHtml(error.message)}</p>`;
  }
}

async function loadMe() {
  if (!state.authenticated) return;
  try {
    const me = await apiFetch("/me");
    elements.meOutput.textContent = JSON.stringify(me, null, 2);
  } catch (error) {
    elements.meOutput.textContent = error.message;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.login.addEventListener("click", () => {
  keycloak.login();
});

elements.logout.addEventListener("click", () => {
  keycloak.logout({ redirectUri: window.location.origin });
});

elements.refresh.addEventListener("click", loadCatalog);

elements.listingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.listingMessage.textContent = "Publication…";

  const data = new FormData(elements.listingForm);

  try {
    await apiFetch("/listings", {
      method: "POST",
      body: JSON.stringify({
        title: data.get("title"),
        description: data.get("description"),
        price: Number(data.get("price"))
      })
    });

    const createdTitle = String(data.get("title"));
    elements.listingForm.reset();
    elements.listingMessage.textContent =
      "Annonce créée. Propagation de l'événement vers le catalogue…";

    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const items = await apiFetch("/catalog");
      if (items.some((item) => item.title === createdTitle)) {
        elements.listingMessage.textContent =
          "Annonce créée et projetée dans le catalogue via RabbitMQ.";
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    await loadCatalog();
  } catch (error) {
    elements.listingMessage.textContent = `Erreur : ${error.message}`;
  }
});

elements.adminCheck.addEventListener("click", async () => {
  elements.adminOutput.textContent = "Test en cours…";
  try {
    const result = await apiFetch("/admin/stats");
    elements.adminOutput.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    elements.adminOutput.textContent = error.message;
  }
});

async function boot() {
  await loadCatalog();

  try {
    state.authenticated = await keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      checkLoginIframe: false
    });
    state.authReady = true;

    if (state.authenticated) {
      state.username =
        keycloak.tokenParsed?.preferred_username ??
        keycloak.tokenParsed?.sub ??
        "Utilisateur";
      state.roles = keycloak.tokenParsed?.realm_access?.roles ?? [];
      await loadMe();
    }
  } catch (error) {
    console.error("Keycloak initialization failed:", error);
    state.authReady = false;
  }

  renderSession();
}

boot();
