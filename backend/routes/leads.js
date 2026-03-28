const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const jwt = require("jsonwebtoken");

/**
 * =========================
 * AUTH
 * =========================
 */
function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const headerParts = authHeader.split(" ");
  let token = null;

  if (headerParts.length === 2 && headerParts[0] === "Bearer") {
    token = headerParts[1];
  } else if (req.headers["x-admin-token"]) {
    token = req.headers["x-admin-token"];
  } else if (req.query && req.query.admin_token) {
    token = req.query.admin_token;
  }

  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const expected = process.env.ADMIN_TOKEN || null;
  if (expected && token === expected) {
    req.user = { admin: true };
    return next();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("checkAuth error: missing JWT_SECRET");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "No autorizado" });
  }
}

/**
 * =========================
 * SSE STORAGE
 * =========================
 */
const sseClients = new Set();

function sendSseEvent(res, event, data) {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    res.flush?.(); // 🔥 FUERZA ENVÍO INMEDIATO
  } catch {}
}

/**
 * =========================
 * SSE STREAM
 * =========================
 */
router.get("/stream", checkAuth, async (req, res) => {
  res.status(200);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // 🔥 anti-buffer (nginx)
  res.setHeader("Content-Encoding", "identity");

  res.flushHeaders(); // 🔥 CRÍTICO

  sseClients.add(res);

  // Enviar estado inicial
  try {
    const count = await Lead.count();
    const unread = await Lead.countUnread();
    sendSseEvent(res, "counts", { count, unread });
  } catch {}

  // Heartbeat (mantiene viva la conexión)
  const heartbeat = setInterval(() => {
    try {
      res.write(": keep-alive\n\n");
      res.flush?.();
    } catch {}
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

/**
 * =========================
 * BROADCAST
 * =========================
 */
async function broadcastCounts() {
  const count = await Lead.count();
  const unread = await Lead.countUnread();

  for (const client of sseClients) {
    sendSseEvent(client, "counts", { count, unread });
  }
}

/**
 * =========================
 * ROUTES
 * =========================
 */

// GET all leads
router.get("/", checkAuth, async (req, res) => {
  try {
    const rows = await Lead.getAll();
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

// GET counts
router.get("/count", checkAuth, async (req, res) => {
  try {
    const count = await Lead.count();
    const unread = await Lead.countUnread();
    res.json({ count, unread });
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

// CREATE lead (público)
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.nombre || !payload.apellidos || !payload.codigoPostal || !payload.telefono) {
      return res.status(400).json({ error: "Campos requeridos faltantes" });
    }

    const id = await Lead.create(payload);
    const created = await Lead.getById(id);

    // 🔥 SSE INMEDIATO
    broadcastCounts().catch(() => {});

    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

// DELETE lead
router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    await Lead.remove(id);
    await broadcastCounts();

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

// MARK READ / UNREAD
router.patch("/:id/read", checkAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    if (typeof req.body.read === "boolean") {
      if (req.body.read) await Lead.markRead(id);
      else await Lead.markUnread(id);
    } else {
      await Lead.toggleRead(id);
    }

    await broadcastCounts();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
