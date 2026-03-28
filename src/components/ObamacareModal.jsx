import React, { useEffect, useRef, useState } from "react";

export default function ObamacareModal({ onClose, content }) {
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarRef = useRef(null); // <--- NUEVO para el resumen rápido
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [showFull, setShowFull] = useState(window.innerWidth >= 1024);

  // Manejo responsive
  useEffect(() => {
    const handleResize = () => {
      const desktopNow = window.innerWidth >= 1024;
      setIsDesktop(desktopNow);
      if (!desktopNow && showFull) setShowFull(false);
      if (desktopNow && !showFull) setShowFull(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showFull]);

  // Scroll locking y wheel/touch exclusivo en áreas scrollables
  useEffect(() => {
    function shouldHandleLocalScroll(target) {
      // Permitir scroll local SOLO si el mouse está en el área principal o el sidebar
      return (
        (contentRef.current && contentRef.current.contains(target)) ||
        (sidebarRef.current && sidebarRef.current.contains(target))
      );
    }

    function preventScroll(e) {
      if (shouldHandleLocalScroll(e.target)) {
        // Logic para scroll SOLO dentro de elemento scrollable
        // Determinar cuál está activo (content o sidebar)
        const areas = [contentRef.current, sidebarRef.current].filter(Boolean);
        let scrollEl = areas.find((el) => el.contains(e.target));
        if (!scrollEl) {
          e.preventDefault();
          return;
        }
        if (e.type === "wheel") {
          const deltaY = e.deltaY;
          const atTop = scrollEl.scrollTop <= 0;
          const atBottom =
            scrollEl.scrollHeight - scrollEl.clientHeight - scrollEl.scrollTop <=
            1;
          // Bloquea el scroll extra si se llegó al borde
          if ((deltaY > 0 && atBottom) || (deltaY < 0 && atTop)) {
            e.preventDefault();
          }
          // Deja pasar el scroll SOLO en el área scrollable
        } else if (e.type === "touchmove") {
          const touch = e.touches?.[0];
          const startY = scrollEl._touchStartY || 0;
          const deltaY = touch ? touch.clientY - startY : 0;
          const atTop = scrollEl.scrollTop <= 0;
          const atBottom =
            scrollEl.scrollHeight - scrollEl.clientHeight - scrollEl.scrollTop <=
            1;
          if ((deltaY > 0 && atBottom) || (deltaY < 0 && atTop)) {
            e.preventDefault();
          }
        }
      } else {
        // Bloquea scroll fuera del modal (fondo)
        e.preventDefault();
      }
    }

    function handleTouchStart(e) {
      const allScrollEls = [contentRef.current, sidebarRef.current].filter(Boolean);
      for (let el of allScrollEls) {
        if (el.contains(e.target) && e.touches && e.touches.length === 1) {
          el._touchStartY = e.touches[0].clientY;
        }
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("wheel", preventScroll, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchmove", preventScroll, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("wheel", preventScroll, { capture: true });
      document.removeEventListener("touchmove", preventScroll, { capture: true });
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // Resumen rápido (solo botón en móvil/pantalla chica)
  const resumen = (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">Obamacare / ACA</h3>
      <p className="text-sm text-gray-700 mb-3">
        Seguro médico subsidiado, ayuda financiera según tus ingresos.<br />
        Te guiamos con el proceso y asesoría gratuita.
      </p>
      <ul className="space-y-2 text-gray-700 mb-6">
        <li>• Seguro a través del Marketplace</li>
        <li>• Subsidio según ingresos y hogar</li>
        <li>• Aplicación online y asesoría gratuita</li>
        <li>• Sin discriminación por preexistencias</li>
      </ul>
      <button
        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition w-full mb-4 mt-2"
        onClick={() => setShowFull(true)}
      >
        Ver más
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Información de Obamacare"
    >
      {/* Backdrop blur + dim */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300"
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src="/obamacare.webp"
              alt="Obamacare"
              className="h-14 w-14 object-contain rounded-md bg-white border"
              loading="lazy"
            />
            <div>
              <h3 className="text-xl font-semibold">Obamacare / ACA</h3>
              <p className="text-sm text-gray-500">
                Seguro médico subsidiado y regulado por el gobierno
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/18006839337"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
            >
              Solicita tu seguro
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Cerrar modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707A1 1 0 114.707 3.293L10 8.586z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Solo resumen rápido en móvil/pantalla chica */}
          {!showFull && <div className="w-full">{resumen}</div>}

          {/* Desktop o ver más */}
          {showFull && (
            <>
              {/* Main content scrollable */}
              <div
                ref={contentRef}
                className="col-span-2 p-6 overflow-auto max-h-[70vh] prose prose-sm sm:prose overscroll-none w-full"
              >
                <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
                {/* SOLO mostrar el botón si NO hay sidebar visible (pantalla chica) */}
                {!isDesktop && (
                  <a
                    href="https://www.youtube.com/watch?v=j9tRVESzJ1M"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-red-600 text-white mt-8 py-2 px-4 rounded-lg hover:bg-red-700 transition text-center w-full"
                  >
                    Más información oficial
                  </a>
                )}
              </div>

              {/* Sidebar: solo en desktop, scrollable local */}
              {isDesktop && (
                <aside
                  ref={sidebarRef}
                  className="p-6 border-l hidden lg:block col-span-1 overflow-auto max-h-[70vh]"
                >
                  <div className="sticky top-6">
                    <h4 className="text-lg font-semibold mb-3">
                      Resumen rápido
                    </h4>
                    <p className="text-gray-700 mb-4">
                      Accede a tu seguro médico subsidiado, con ayuda financiera de acuerdo a tus ingresos. Te orientamos sobre el proceso y sobre ayudas como Medicaid/CHIP en caso de no calificar.
                    </p>
                    <ul className="space-y-2 text-gray-700 mb-6">
                      <li>• Seguro a través del Marketplace</li>
                      <li>• Subsidio según ingresos y hogar</li>
                      <li>• Aplicación online y asesoría gratuita</li>
                      <li>• Sin discriminación por preexistencias o sexo</li>
                    </ul>
                    <a
                      href="https://www.youtube.com/watch?v=j9tRVESzJ1M"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex justify-center items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
                    >
                      Más información oficial
                    </a>
                    <button
                      onClick={onClose}
                      className="mt-2 inline-flex justify-center items-center border border-gray-200 bg-white text-gray-700 py-2 px-4 rounded-md hover:shadow-sm transition"
                    >
                      Cerrar
                    </button>
                    <p className="text-xs text-gray-400 mt-4">
                      Verifica tu elegibilidad y subsidios antes de inscribirte.
                      Estamos para asesorarte en todos los pasos.
                    </p>
                  </div>
                </aside>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}