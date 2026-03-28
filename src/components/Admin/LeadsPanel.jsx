import React, { useEffect, useState, useRef } from "react";

/**
 * LeadsPanel (mejorado)
 * - Determina qué token (JWT o admin_token) funciona antes de abrir EventSource.
 * - Reintenta la conexión en caso de error, re-evaluando los tokens.
 */

// Helper para recuperar tokens candidatos en orden (JWT primero, admin token después)
function getTokenCandidateOrder() {
  if (typeof window === "undefined") return [];
  const jwt = localStorage.getItem("blog_token");
  const adminLocal = localStorage.getItem("admin_token");
  const list = [];
  if (jwt) list.push({ token: jwt, type: "jwt" });
  if (adminLocal) list.push({ token: adminLocal, type: "admin" });
  return list;
}

export default function LeadsPanel() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const esRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  async function fetchLeads() {
    setLoading(true);
    setError("");
    try {
      const token = getAnyToken();
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await fetch("http://192.168.10.149:5000/api/leads", { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error("No autorizado");
        throw new Error("Error cargando leads");
      }
      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data.map((l) => ({ ...l, read: typeof l.read === "number" ? l.read : l.read ? 1 : 0 }))
        : [];
      setLeads(normalized);
    } catch (err) {
      setError(err.message || "Error cargando leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  function getAnyToken() {
    const candidates = getTokenCandidateOrder();
    return candidates.length ? candidates[0].token : "";
  }

  // Intentar cuál token funciona (probar usando header Authorization a /api/leads/count)
  async function pickValidToken() {
    const candidates = getTokenCandidateOrder();
    if (candidates.length === 0) return "";
    for (const c of candidates) {
      try {
        const headers = c.token ? { Authorization: "Bearer " + c.token } : {};
        const resp = await fetch("http://192.168.10.149:5000/api/leads/count", { headers });
        if (resp.ok) return c.token;
        // si 401 -> probar siguiente candidato
      } catch (e) {
        // ignore and try next
      }
    }
    // ninguno validó -> devolver el primero (para intentar de todos modos)
    return candidates[0].token;
  }

  function createEventSourceWithToken(token) {
    const url = `http://192.168.10.149:5000/api/leads/stream?admin_token=${encodeURIComponent(token)}`;
    try {
      const es = new EventSource(url);
      esRef.current = es;
      return es;
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function startSse() {
      // primera carga
      await fetchLeads();

      const token = await pickValidToken();
      if (!token) return;

      const es = createEventSourceWithToken(token);
      if (!es) return;

      es.addEventListener("new-lead", (ev) => {
        try {
          const newLead = JSON.parse(ev.data);
          setLeads((prev) => {
            if (prev.find((p) => String(p.id) === String(newLead.id))) return prev;
            return [newLead, ...prev];
          });
        } catch (e) {}
      });

      es.addEventListener("counts", () => {
        // opcional: podrías actualizar un contador si lo necesitas
      });

      es.onerror = () => {
        // EventSource intentará reconectar automáticamente, pero aquí re-evaluamos tokens
        try {
          if (esRef.current) esRef.current.close();
        } catch (e) {}
        // Reintento tras un pequeño retraso
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!mounted) return;
          startSse();
        }, 3000);
      };
    }

    startSse();

    const poll = setInterval(fetchLeads, 30_000); // fallback polling
    return () => {
      mounted = false;
      clearInterval(poll);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("¿Seguro de eliminar este lead? Esta acción es irreversible.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://192.168.10.149:5000/api/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + getAnyToken() },
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("No autorizado");
        throw new Error("No se pudo eliminar el lead");
      }
      setLeads((prev) => prev.filter((l) => String(l.id) !== String(id)));
    } catch (err) {
      alert(err.message || "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleRead(id, currentRead) {
    setTogglingId(id);
    try {
      const res = await fetch(`http://192.168.10.149:5000/api/leads/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getAnyToken(),
        },
        body: JSON.stringify({ read: !currentRead }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("No autorizado");
        throw new Error("No se pudo actualizar el estado");
      }
      const body = await res.json().catch(() => ({}));
      setLeads((prev) =>
        prev.map((l) => {
          if (String(l.id) === String(id)) {
            const newRead = typeof body.read === "number" ? Boolean(body.read) : !Boolean(currentRead);
            return { ...l, read: newRead ? 1 : 0 };
          }
          return l;
        })
      );
    } catch (err) {
      alert(err.message || "Error actualizando estado");
    } finally {
      setTogglingId(null);
    }
  }

  const totalLeads = leads.length;
  const unreadLeads = leads.filter((l) => !l.read).length;

  return (
    <div className="max-w-6xl mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-black">Panel: Leads</h2>
          <p className="text-sm text-gray-500">Listado de solicitudes agendadas</p>
        </div>

        <div className="text-right text-sm text-gray-600">
          <div>
            Total: <span className="font-semibold text-red-600">{totalLeads}</span>
          </div>
          <div>
            No leídos: <span className="font-semibold text-red-600">{unreadLeads}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando leads...</div>
      ) : error ? (
        <div className="text-red-600 py-6">{error}</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No hay leads por el momento.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-sm text-gray-600">#</th>
                <th className="p-2 text-sm text-gray-600">Nombre</th>
                <th className="p-2 text-sm text-gray-600">Código Postal</th>
                <th className="p-2 text-sm text-gray-600">Condado / Estado</th>
                <th className="p-2 text-sm text-gray-600">Teléfono</th>
                <th className="p-2 text-sm text-gray-600">Creado</th>
                <th className="p-2 text-sm text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => {
                const isUnread = !lead.read;
                return (
                  <tr
                    key={lead.id || idx}
                    className={`border-b hover:bg-gray-50 ${isUnread ? "bg-red-50" : ""}`}
                  >
                    <td className="p-2 align-top">{idx + 1}</td>
                    <td className="p-2">
                      <div className={`font-semibold ${isUnread ? "text-black" : ""}`}>
                        {lead.nombre} {lead.apellidos}
                        {isUnread && (
                          <span className="ml-2 inline-block bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                            Nuevo
                          </span>
                        )}
                      </div>
                      {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                    </td>
                    <td className="p-2">{lead.codigoPostal}</td>
                    <td className="p-2">{lead.condado} {lead.estado ? ` / ${lead.estado}` : ""}</td>
                    <td className="p-2">{lead.telefono}</td>
                    <td className="p-2 text-sm text-gray-500">{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "-"}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                              if (isMobile) window.location.href = `tel:${lead.telefono}`;
                              else window.open(`https://wa.me/${lead.telefono.replace(/\D/g, "")}`, "_blank");
                            }
                          }}
                          className="text-xs px-2 py-1 rounded bg-green-50 text-green-700"
                        >
                          Contactar
                        </button>

                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
                          className="text-xs px-2 py-1 rounded bg-red-50 text-red-600"
                        >
                          {deletingId === lead.id ? "Eliminando..." : "Eliminar"}
                        </button>

                        <button
                          onClick={() => toggleRead(lead.id, Boolean(lead.read))}
                          disabled={togglingId === lead.id}
                          title={lead.read ? "Marcar como no leído" : "Marcar como leído"}
                          className={`ml-2 text-xs px-2 py-1 rounded ${lead.read ? "bg-gray-100 text-gray-700" : "bg-blue-600 text-white"}`}
                        >
                          {togglingId === lead.id ? "..." : lead.read ? "Leído" : "Marcar leído"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}