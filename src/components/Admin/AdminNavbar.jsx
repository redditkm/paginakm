import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { initSse } from "../../utils/sseClient";

const API_BASE = "http://192.168.50.14:5000";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openFestividades, setOpenFestividades] = useState(false);
  const [loading, setLoading] = useState(false);

  const [festividades, setFestividades] = useState({
    navidad: false,
    halloween: false,
    sanValentin: false,
    fourthJuly: false,
  });

  const [unread, setUnread] = useState(0);
  const mountedRef = useRef(false);
  const festividadesRef = useRef(null);

  // ======================
  // TOKEN
  // ======================
  function getToken() {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem("blog_token") ||
      localStorage.getItem("admin_token") ||
      ""
    );
  }

  // ======================
  // LEADS (SSE)
  // ======================
  async function fetchInitialCounts() {
    try {
      const token = getToken();
      if (!token) return;

      let res = await fetch(`${API_BASE}/api/leads/count`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (res.status === 401) {
        res = await fetch(
          `${API_BASE}/api/leads/count?admin_token=${encodeURIComponent(token)}`
        );
      }

      if (!res.ok) return;

      const body = await res.json().catch(() => ({}));
      if (mountedRef.current && typeof body.unread === "number") {
        setUnread(body.unread);
      }
    } catch {}
  }

  // ======================
  // 🎉 FESTIVIDADES
  // ======================
  async function fetchFestividades() {
    try {
      const res = await fetch(`${API_BASE}/api/festividades`);
      if (!res.ok) return;
      const data = await res.json();

      setFestividades({
        navidad: !!data.navidad,
        halloween: !!data.halloween,
        sanValentin: !!data.sanValentin,
        fourthJuly: !!data.fourthJuly,
      });
    } catch {}
  }

  async function activarFestividad(nombre) {
    if (loading) return;

    const nuevoEstado = {
      navidad: false,
      halloween: false,
      sanValentin: false,
      fourthJuly: false,
      [nombre]: !festividades[nombre],
    };

    setLoading(true);
    setFestividades(nuevoEstado); // UI optimista

    try {
      await fetch(`${API_BASE}/api/festividades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoEstado),
      });
    } catch {
      fetchFestividades(); // rollback seguro
    } finally {
      setLoading(false);
    }
  }

  // ======================
  // EFFECTS
  // ======================
  useEffect(() => {
    mountedRef.current = true;

    initSse();
    fetchInitialCounts();
    fetchFestividades();

    function onCounts(ev) {
      if (!mountedRef.current) return;
      if (typeof ev.detail?.unread === "number") {
        setUnread(ev.detail.unread);
      }
    }

    function handleClickOutside(e) {
      if (
        openFestividades &&
        festividadesRef.current &&
        !festividadesRef.current.contains(e.target)
      ) {
        setOpenFestividades(false);
      }
    }

    window.addEventListener("sse:counts", onCounts);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("sse:counts", onCounts);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openFestividades]);

  // ======================
  // NAV
  // ======================
  function goTo(path) {
    setOpenFestividades(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogout() {
    localStorage.removeItem("blog_token");
    localStorage.removeItem("admin_token");
    navigate("/");
    setTimeout(() => window.location.reload(), 50);
  }

  const active = (p) =>
    location.pathname === p
      ? "text-red-600 font-semibold"
      : "text-white";

  function Switch({ active, onClick }) {
    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`w-12 h-6 rounded-full relative transition ${
          active ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
            active ? "left-6" : "left-1"
          }`}
        />
      </button>
    );
  }

return (
  <header className="bg-black text-white fixed top-0 left-0 w-full z-50">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <img
        src="/logokm.png"
        alt="KM"
        className="h-8 cursor-pointer"
        onClick={() => goTo("/admin")}
      />

      <nav className="flex gap-6 items-center relative">
        <button onClick={() => goTo("/admin")} className={active("/admin")}>
          Inicio
        </button>

        <button
          onClick={() => goTo("/admin/blogs")}
          className={active("/admin/blogs")}
        >
          Blogs
        </button>

        <button
          onClick={() => goTo("/admin/leads")}
          className={`relative flex items-center gap-2 ${active(
            "/admin/leads"
          )}`}
        >
          Leads
          {unread > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-red-600 rounded-full">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {/* 🎉 FESTIVIDADES */}
        <div className="relative" ref={festividadesRef}>
          <button
            onClick={() => setOpenFestividades((v) => !v)}
            className="text-white hover:text-red-500 transition"
          >
            Festividades ▾
          </button>

          {openFestividades && (
            <div className="absolute top-10 left-0 bg-white text-black rounded shadow-lg w-64 p-4 z-50 space-y-3">
              <div className="flex justify-between items-center">
                <span>🎄 Navidad</span>
                <Switch
                  active={festividades.navidad}
                  onClick={() => activarFestividad("navidad")}
                />
              </div>

              <div className="flex justify-between items-center">
                <span>🎃 Halloween</span>
                <Switch
                  active={festividades.halloween}
                  onClick={() => activarFestividad("halloween")}
                />
              </div>

              <div className="flex justify-between items-center">
                <span>💘 San Valentín</span>
                <Switch
                  active={festividades.sanValentin}
                  onClick={() => activarFestividad("sanValentin")}
                />
              </div>

              {/* 🇺🇸 4th of July – ALINEADO CORRECTAMENTE */}
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <img
                    src="https://twemoji.maxcdn.com/v/latest/svg/1f1fa-1f1f8.svg"
                    alt="USA"
                    className="w-5 h-5"
                  />
                  4th of July
                </span>
                <Switch
                  active={festividades.fourthJuly}
                  onClick={() => activarFestividad("fourthJuly")}
                />
              </div>

              <p className="text-xs text-gray-600 pt-2 border-t">
                Solo una festividad puede estar activa al mismo tiempo
              </p>
            </div>
          )}
        </div>
      </nav>

      <button
        onClick={handleLogout}
        className="bg-red-600 px-3 py-1.5 rounded hover:bg-red-700 transition"
      >
        Cerrar sesión
      </button>
    </div>
  </header>
);
}
