import React, { useRef, useEffect, useState } from "react";
import supplementaryProducts from "./supplementaryProducts";

// Modal detalle profesional con cierre por click fuera y scroll interno bloqueando chaining
function SupplementaryProductDetailModal({ product, onClose }) {
  const modalPanelRef = useRef(null);
  const contentRef = useRef(null);

  // Cerrar al hacer click fuera del modal
  useEffect(() => {
    const onBackdropClick = (e) => {
      if (!modalPanelRef.current) return;
      if (!modalPanelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onBackdropClick);
    return () => document.removeEventListener("mousedown", onBackdropClick);
  }, [onClose]);

  // Bloqueo chaining SOLO en contenido interno scrollable
  useEffect(() => {
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    const content = contentRef.current;
    if (!content) return;
    const onWheel = (e) => {
      const deltaY = e.deltaY;
      const atTop = content.scrollTop === 0;
      const atBottom = Math.ceil(content.scrollTop + content.clientHeight) >= content.scrollHeight;
      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    };
    content.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      content.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={modalPanelRef}
        className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full"
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Top bar */}
        <div className="relative border-b px-6 py-5 flex items-center gap-4" style={{ minHeight: 64 }}>
          <img
            src={product.icon}
            alt={product.title}
            className="h-12 w-12 object-contain rounded-md bg-white p-1"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{product.title}</h2>
            <span className="text-sm text-gray-600 block">{product.taglineShort}</span>
          </div>
          <a
            href="https://wa.me/18006839337"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
          >
            Cotizar ahora
          </a>
          {/* X CIERRA, en la esquina */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Cerrar detalles"
            style={{ zIndex: 10 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10l-5.293-5.293A1 1 0 114.707 3.293L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {/* Aquí va el contenido scrollable */}
        <div
          ref={contentRef}
          className="px-8 pb-6 pt-8 overflow-auto flex-1"
        >
          <div className="mb-3">
            <span
              className="inline-block text-xs font-semibold text-white px-3 py-1 rounded mb-2"
              style={{ backgroundColor: product.color || "#333" }}
            >
              {product.shortBadge}
            </span>
          </div>
          <p className="text-gray-800 mb-3">{product.resume}</p>
          <h5 className="font-bold mb-1">Puntos clave</h5>
          <ul className="list-disc pl-5 text-gray-800 mb-5">
            {product.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.details }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupplementaryProductsModal({ onClose }) {
  const panelRef = useRef(null);
  const [selectedKey, setSelectedKey] = useState(supplementaryProducts[0]?.key);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    const onWheelGlobal = (e) => {
      if (!panelRef.current || panelRef.current.contains(e.target)) return;
      e.preventDefault();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("wheel", onWheelGlobal, { passive: false });
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      document.removeEventListener("wheel", onWheelGlobal);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const selected = supplementaryProducts.find((p) => p.key === selectedKey);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cerrar el modal si se hace clic fuera para el modal principal
  useEffect(() => {
    const onBackdropClick = (e) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onBackdropClick);
    return () => document.removeEventListener("mousedown", onBackdropClick);
  }, [onClose]);

  // Bloqueo chaining para el modal principal
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onWheel = (e) => {
      const deltaY = e.deltaY;
      const atTop = panel.scrollTop === 0;
      const atBottom = Math.ceil(panel.scrollTop + panel.clientHeight) >= panel.scrollHeight;
      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    };
    panel.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      panel.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        role="document"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">Planes Suplementarios
            <span className="ml-3 text-sm text-gray-500 hidden sm:inline">
              Explora nuestras coberturas y compara rápidamente.
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 transition"
            aria-label="Cerrar modal de productos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10l-5.293-5.293A1 1 0 114.707 3.293L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          <div className="md:w-80 w-full border-r bg-white flex-shrink-0 flex flex-col relative">
            <div className="p-4 block">
              <div className="text-sm text-gray-500 mb-2">
                {supplementaryProducts.length} producto(s)
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-0">
              {supplementaryProducts.map((product, idx) => {
                const isSelected = selectedKey === product.key;
                return (
                  <React.Fragment key={product.key}>
                    <button
                      onClick={() => {
                        setSelectedKey(product.key);
                        setShowDetails(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition min-w-0 ${
                        isSelected
                          ? "bg-green-50 ring-2 ring-green-200"
                          : "hover:bg-gray-50"
                      }`}
                      type="button"
                    >
                      <img
                        src={product.icon}
                        alt={product.title}
                        className="h-12 w-12 object-contain rounded-md bg-white p-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{product.title}</div>
                        <div className="text-xs text-gray-500 truncate">{product.taglineShort}</div>
                      </div>
                      <div
                        className="text-xs font-semibold text-white px-2 py-0.5 rounded"
                        style={{ backgroundColor: product.color }}
                      >
                        {product.shortBadge}
                      </div>
                    </button>
                    {isMobile && isSelected && (
                      <div className="w-full my-4 rounded-xl shadow border p-4 bg-white">
                        <img
                          src={product.icon}
                          alt={product.title}
                          className="h-14 w-14 object-contain rounded-md bg-white p-1 mb-2"
                        />
                        <h4 className="text-xl font-bold mb-1">{product.title}</h4>
                        <span
                          className="inline-block text-xs font-semibold text-white px-3 py-1 rounded"
                          style={{ backgroundColor: product.color || "#333" }}
                        >
                          {product.shortBadge}
                        </span>
                        <p className="mt-2 text-gray-800">{product.resume}</p>
                        <h5 className="mt-3 font-semibold">Por qué elegirlo</h5>
                        <ul className="list-disc pl-5 text-gray-800 space-y-1 mt-2">
                          {product.points.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                        {product.footerNote && (
                          <p className="text-sm text-gray-500 mt-2">{product.footerNote}</p>
                        )}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => setShowDetails(true)}
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
                        {showDetails && (
                          <SupplementaryProductDetailModal
                            product={product}
                            onClose={() => setShowDetails(false)}
                          />
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          {/* Panel derecho en md+ */}
          {!isMobile && selected && (
            <div className="flex-1 p-4 min-w-0">
              <div className="max-w-2xl mx-auto min-w-0 bg-white rounded-xl p-4 shadow border">
                <img
                  src={selected.icon}
                  alt={selected.title}
                  className="h-14 w-14 object-contain rounded-md bg-white p-1 mb-2"
                />
                <h4 className="text-xl font-bold mb-1">{selected.title}</h4>
                <span
                  className="inline-block text-xs font-semibold text-white px-3 py-1 rounded"
                  style={{ backgroundColor: selected.color || "#333" }}
                >
                  {selected.shortBadge}
                </span>
                <p className="mt-2 text-gray-800">{selected.resume}</p>
                <h5 className="mt-3 font-semibold">Por qué elegirlo</h5>
                <ul className="list-disc pl-5 text-gray-800 space-y-1 mt-2">
                  {selected.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
                {selected.footerNote && (
                  <p className="text-sm text-gray-500 mt-2">{selected.footerNote}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setShowDetails(true)}
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
                {showDetails && (
                  <SupplementaryProductDetailModal
                    product={selected}
                    onClose={() => setShowDetails(false)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}