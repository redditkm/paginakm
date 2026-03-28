import React, { useEffect, useRef, useState } from "react";
import companies from "./companiesData";
import CompanyModal from "./CompanyModal";

export default function CompaniesModal({ onClose }) {
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(companies);
  const [selectedKey, setSelectedKey] = useState(companies[0]?.key || null);
  const [openCompanyModal, setOpenCompanyModal] = useState(false);

  // --- Bloqueo global de scroll fondo y overscroll chaining ---
  useEffect(() => {
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    // Bloquea wheel y touchmove fuera del panel de modal principal (¡incluye detalles!)
    const onWheelGlobal = (e) => {
      // Si está abierto el modal de detalle (CompanyModal), no bloquea aquí (CompanyModal tendrá su propio bloqueo)
      if (openCompanyModal) return;
      const panel = panelRef.current;
      if (!panel) return;
      if (!panel.contains(e.target)) {
        e.preventDefault();
      }
    };
    const onTouchMoveGlobal = (e) => {
      if (openCompanyModal) return;
      const panel = panelRef.current;
      if (!panel) return;
      const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      if (!panel.contains(el)) {
        e.preventDefault();
      }
    };
    document.addEventListener("wheel", onWheelGlobal, { passive: false });
    document.addEventListener("touchmove", onTouchMoveGlobal, { passive: false });

    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      document.removeEventListener("wheel", onWheelGlobal);
      document.removeEventListener("touchmove", onTouchMoveGlobal);
    };
  }, [openCompanyModal]);

  // --- Bloqueo de overscroll chaining en scroll del panel principal de modal ---
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const onWheel = (e) => {
      const deltaY = e.deltaY;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop < 1;
      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // --- Teclas para navegación y trap tab ---
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const getFocusable = () =>
      panel.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (filtered.length === 0) return;
        const idx = filtered.findIndex((c) => c.key === selectedKey);
        const next = filtered[(idx + 1 + filtered.length) % filtered.length];
        setSelectedKey(next.key);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (filtered.length === 0) return;
        const idx = filtered.findIndex((c) => c.key === selectedKey);
        const prev = filtered[(idx - 1 + filtered.length) % filtered.length];
        setSelectedKey(prev.key);
      } else if (e.key === "Enter") {
        if (selectedKey) setOpenCompanyModal(true);
      } else if (e.key === "Tab") {
        const focusable = getFocusable();
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [filtered, selectedKey, onClose, openCompanyModal]);

  // Lógica de filtro y scroll a seleccionado
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const f = q
      ? companies.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.taglineShort && c.taglineShort.toLowerCase().includes(q)) ||
            c.shortBadge.toLowerCase().includes(q)
        )
      : companies;
    setFiltered(f);
    if (!f.find((c) => c.key === selectedKey)) {
      setSelectedKey(f[0]?.key ?? null);
    }
  }, [query, selectedKey]);

  useEffect(() => {
    if (!selectedKey || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-key="${selectedKey}"]`);
    if (el) el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedKey]);

  const selectedCompany = companies.find((c) => c.key === selectedKey) || filtered[0] || null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
        aria-label="Compañías — detalles"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
        {/* Modal principal */}
        <div
          ref={panelRef}
          className="relative z-10 w-full max-w-7xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
          role="document"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">Compañías Asociadas</h3>
              <p className="text-sm text-gray-500 hidden sm:block">
                Explora nuestras aseguradoras y compara rápidamente.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100 transition"
                aria-label="Cerrar modal de compañías"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707A1 1 0 114.707 3.293L10 8.586z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
            {/* Lista sin scroll */}
            <div className="lg:w-80 w-full border-r bg-white flex-shrink-0 flex flex-col">
              <div className="p-4 block">
                <div className="relative">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar compañías..."
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    aria-label="Buscar compañías (lista)"
                  />
                  <div className="text-xs text-gray-500 mt-2">{filtered.length} resultado(s)</div>
                </div>
              </div>
              <div ref={listRef} className="p-2 space-y-2 min-h-0">
                {filtered.map((c) => {
                  const isSelected = c.key === selectedKey;
                  return (
                    <button
                      key={c.key}
                      data-key={c.key}
                      onClick={() => setSelectedKey(c.key)}
                      onDoubleClick={() => { setSelectedKey(c.key); setOpenCompanyModal(true); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition min-w-0 ${
                        isSelected ? "bg-red-50 ring-2 ring-red-200" : "hover:bg-gray-50"
                      }`}
                      type="button"
                      aria-current={isSelected ? "true" : "false"}
                    >
                      <img src={`/${c.logo}`} alt={c.name} className="h-12 w-12 object-contain rounded-md bg-white p-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm truncate">{c.name}</div>
                          <div
                            className="text-xs font-semibold text-white px-2 py-0.5 rounded"
                            style={{ backgroundColor: c.color }}
                          >
                            {c.shortBadge}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 truncate">{c.taglineShort}</div>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="p-4 text-gray-500 text-sm">No se encontraron compañías.</div>
                )}
              </div>
            </div>
            {/* Panel derecho */}
            <div className="flex-1 p-4 min-w-0">
              {selectedCompany ? (
                <div className="max-w-4xl mx-auto min-w-0 bg-white rounded-xl p-4 shadow">
                  <div className="flex items-center gap-4">
                    <img src={`/${selectedCompany.logo}`} alt={selectedCompany.name} className="h-16 w-16 object-contain rounded-md bg-white p-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold">{selectedCompany.name}</h4>
                      <p className="text-gray-600">{selectedCompany.taglineShort}</p>
                      <span className="inline-block text-xs font-semibold text-white px-3 py-1 rounded mt-2"
                            style={{ backgroundColor: selectedCompany.color }}>
                        {selectedCompany.shortBadge}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">{selectedCompany.descriptionIntro}</p>
                  {selectedCompany.points && (
                    <>
                      <h5 className="mt-3 font-semibold">Por qué elegirlos</h5>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                        {selectedCompany.points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {selectedCompany.footerNote && (
                    <p className="text-sm text-gray-500 mt-2">{selectedCompany.footerNote}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setOpenCompanyModal(true)}
                      className="inline-flex items-center justify-center border border-gray-200 bg-white text-gray-700 py-2 px-4 rounded-md hover:shadow transition"
                    >
                      Ver detalle
                    </button>
                    <button
                      onClick={onClose}
                      className="inline-flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 py-2 px-3"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  Selecciona una compañía para ver detalles.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {openCompanyModal && selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => setOpenCompanyModal(false)}
        />
      )}
    </>
  );
}