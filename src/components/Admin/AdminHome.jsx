import React, { useEffect, useState, useRef } from "react";
import { initSse } from "../../utils/sseClient";

const API_BASE = "http://192.168.50.14:5000";

/**
 * AdminHome.jsx
 * - Inicia el SSE singleton
 * - Escucha eventos globales:
 *    - sse:counts  -> actualiza contadores (FUENTE ÚNICA)
 *    - sse:new-lead -> solo informativo
 * - Fallback polling cada 30s
 */

function getTokenCandidates() {
  if (typeof window === "undefined") return [];
  const jwt = localStorage.getItem("blog_token");
  const adminLocal = localStorage.getItem("admin_token");
  const list = [];
  if (jwt) list.push(jwt);
  if (adminLocal) list.push(adminLocal);
  return list;
}

async function tryFetchCounts(token) {
  try {
    const headers = token ? { Authorization: "Bearer " + token } : {};
    const resp = await fetch(`${API_BASE}/api/leads/count`, { headers });
    const body = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, body };
  } catch {
    return { ok: false, status: 0, body: {} };
  }
}

async function pickValidToken() {
  const candidates = getTokenCandidates();
  for (const token of candidates) {
    const r = await tryFetchCounts(token);
    if (r.ok) return token;
    if (r.status === 401) continue;
  }
  return candidates[0] || "";
}

export default function AdminHome() {
  const [blogsCount, setBlogsCount] = useState(null);
  const [leadsTotal, setLeadsTotal] = useState(null);
  const [leadsUnread, setLeadsUnread] = useState(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    // 🔥 SSE singleton
    initSse();

    async function fetchInitialData() {
      setLoading(true);

      try {
        // Blogs (público)
        try {
          const b = await fetch(`${API_BASE}/api/blogs`);
          if (b.ok) {
            const blogs = await b.json();
            if (mountedRef.current) {
              setBlogsCount(Array.isArray(blogs) ? blogs.length : 0);
            }
          }
        } catch {
          if (mountedRef.current) setBlogsCount(null);
        }

        // Leads (autenticado)
        const token = await pickValidToken();
        if (token) {
          const r = await tryFetchCounts(token);
          if (r.ok && mountedRef.current) {
            setLeadsTotal(
              typeof r.body.count === "number" ? r.body.count : 0
            );
            setLeadsUnread(
              typeof r.body.unread === "number" ? r.body.unread : 0
            );
          }
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetchInitialData();

    // =====================
    // SSE EVENTS
    // =====================
    function onCounts(ev) {
      try {
        const payload = ev.detail;
        if (!mountedRef.current) return;

        if (typeof payload.count === "number") {
          setLeadsTotal(payload.count);
        }
        if (typeof payload.unread === "number") {
          setLeadsUnread(payload.unread);
        }
      } catch {}
    }

    function onNewLead() {
      // ❌ NO tocar contadores aquí
      // el backend manda 'counts' inmediatamente
    }

    window.addEventListener("sse:counts", onCounts);
    window.addEventListener("sse:new-lead", onNewLead);

    // ⏱️ fallback polling
    const interval = setInterval(fetchInitialData, 30_000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener("sse:counts", onCounts);
      window.removeEventListener("sse:new-lead", onNewLead);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Inicio — Resumen</h2>

      {loading ? (
        <div className="text-gray-500">Cargando estadísticas...</div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">
                Blogs publicados
              </div>
              <div className="text-3xl font-extrabold text-red-600">
                {blogsCount ?? "—"}
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">
                Leads agendadas
              </div>
              <div className="text-3xl font-extrabold text-red-600">
                {leadsTotal ?? "—"}
              </div>

              <div className="mt-2 text-sm text-gray-600">
                {leadsUnread != null ? (
                  <>
                    No leídas:{" "}
                    <span className="font-semibold text-red-600">
                      {leadsUnread}
                    </span>
                  </>
                ) : (
                  "No disponible"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
