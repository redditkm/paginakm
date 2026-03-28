// Cliente SSE singleton que valida token y emite eventos globales (CustomEvent)
// src/utils/sseClient.js

const BASE = "http://192.168.50.14:5000";

// =======================
// Helpers de token
// =======================
function getTokenCandidates() {
  if (typeof window === "undefined") return [];

  const jwt = localStorage.getItem("blog_token");
  const adminLocal = localStorage.getItem("admin_token");

  const list = [];
  if (jwt) list.push(jwt);
  if (adminLocal) list.push(adminLocal);

  return list;
}

async function validateToken(token) {
  try {
    const resp = await fetch(`${BASE}/api/leads/count`, {
      headers: { Authorization: "Bearer " + token },
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function pickValidToken() {
  const tokens = getTokenCandidates();
  if (tokens.length === 0) return "";

  for (const token of tokens) {
    const ok = await validateToken(token);
    if (ok) return token;
  }

  return "";
}

// =======================
// Estado global SSE
// =======================
let eventSource = null;
let running = false;
let retryTimeout = null;
let lastToken = null;

// =======================
// API pública
// =======================
export function initSse() {
  if (running) return;
  running = true;
  connect();
}

export function closeSse() {
  running = false;
  lastToken = null;

  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }

  if (eventSource) {
    try {
      eventSource.close();
    } catch {}
    eventSource = null;
  }
}

// =======================
// Internals
// =======================
function scheduleRetry(delay = 2000) {
  if (!running) return;

  if (retryTimeout) clearTimeout(retryTimeout);

  retryTimeout = setTimeout(() => {
    connect();
  }, delay);
}

async function connect() {
  try {
    const token = await pickValidToken();

    if (!token) {
      scheduleRetry(3000);
      return;
    }

    // Si ya está conectado con el mismo token, no reconectar
    if (eventSource && lastToken === token) return;

    // Cerrar conexión previa
    if (eventSource) {
      try {
        eventSource.close();
      } catch {}
      eventSource = null;
    }

    lastToken = token;

    const url = `${BASE}/api/leads/stream?admin_token=${encodeURIComponent(
      token
    )}`;

    eventSource = new EventSource(url);

    // =======================
    // Eventos del servidor
    // =======================
    eventSource.addEventListener("counts", (ev) => {
      try {
        const data = JSON.parse(ev.data);
        window.dispatchEvent(
          new CustomEvent("sse:counts", { detail: data })
        );
      } catch {}
    });

    eventSource.addEventListener("new-lead", (ev) => {
      try {
        const data = JSON.parse(ev.data);
        window.dispatchEvent(
          new CustomEvent("sse:new-lead", { detail: data })
        );
      } catch {}
    });

    eventSource.onerror = () => {
      try {
        eventSource.close();
      } catch {}
      eventSource = null;
      scheduleRetry(2000);
    };
  } catch {
    scheduleRetry(3000);
  }
}
