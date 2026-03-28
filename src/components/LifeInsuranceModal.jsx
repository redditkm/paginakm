import React, { useEffect, useRef } from "react";

export default function LifeInsuranceModal({ onClose, content }) {
  const panelRef = useRef(null);
  const contentRef = useRef(null);

  // Helper: find nearest scrollable ancestor between start and boundary (inclusive)
  function findScrollableAncestor(startEl, boundaryEl) {
    let el = startEl;
    while (el && el !== boundaryEl && el !== document.body) {
      try {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        const canScroll = el.scrollHeight > el.clientHeight && overflowY !== "hidden" && overflowY !== "visible" ? true : el.scrollHeight > el.clientHeight && (overflowY === "auto" || overflowY === "scroll");
        if (canScroll) return el;
      } catch (err) {
        // ignore cross-origin/frame weirdness
      }
      el = el.parentElement;
    }
    // check boundary itself too
    if (boundaryEl) {
      try {
        const styleB = window.getComputedStyle(boundaryEl);
        const overflowYB = styleB.overflowY;
        const canScrollB = boundaryEl.scrollHeight > boundaryEl.clientHeight && (overflowYB === "auto" || overflowYB === "scroll");
        if (canScrollB) return boundaryEl;
      } catch (err) {}
    }
    return null;
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
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

    // lock page scroll via body overflow
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Document-level wheel: allow only when the wheel/target will scroll an element inside the modal.
    const onDocWheel = (e) => {
      const target = e.target;
      const panel = panelRef.current;
      if (!panel) {
        e.preventDefault();
        return;
      }

      // If event comes from within the modal panel...
      if (panel.contains(target)) {
        // find nearest scrollable ancestor from the pointer target up to the panel
        const scrollable = findScrollableAncestor(target, panel);
        if (scrollable) {
          // allow default only if the scrollable ancestor can be scrolled in the delta direction.
          const deltaY = e.deltaY;
          const atTop = scrollable.scrollTop <= 0;
          const atBottom = scrollable.scrollHeight - scrollable.clientHeight - scrollable.scrollTop <= 1;
          if ((deltaY > 0 && atBottom) || (deltaY < 0 && atTop)) {
            // if trying to scroll beyond its bounds, prevent to avoid page scroll
            e.preventDefault();
          } else {
            // allow scrolling the internal element
            return;
          }
        } else {
          // no scrollable element under pointer inside modal -> prevent page scroll
          e.preventDefault();
        }
      } else {
        // outside modal -> always prevent page scrolling while modal open
        e.preventDefault();
      }
    };

    // Document-level touchmove: similar idea to wheel
    const onDocTouchMove = (e) => {
      const touch = e.touches && e.touches[0];
      if (!touch) {
        e.preventDefault();
        return;
      }
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const panel = panelRef.current;
      if (!panel) {
        e.preventDefault();
        return;
      }

      if (panel.contains(el)) {
        const scrollable = findScrollableAncestor(el, panel);
        if (scrollable) {
          // allow; the contentRef will handle overscroll chaining prevention
          return;
        } else {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", onKey);
    // capture + passive:false so we can call preventDefault before browser scrolls
    document.addEventListener("wheel", onDocWheel, { passive: false, capture: true });
    document.addEventListener("touchmove", onDocTouchMove, { passive: false, capture: true });

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("wheel", onDocWheel, { capture: true });
      document.removeEventListener("touchmove", onDocTouchMove, { capture: true });
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Prevent overscroll chaining inside the modal's main scrollable area
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onWheel = (e) => {
      const deltaY = e.deltaY;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;
      if ((deltaY > 0 && atBottom) || (deltaY < 0 && atTop)) {
        e.preventDefault();
      }
      // otherwise let it scroll the content
    };

    let startY = 0;
    const onTouchStart = (e) => {
      if (e.touches && e.touches.length === 1) startY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const delta = startY - currentY;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;
      if ((delta > 0 && atBottom) || (delta < 0 && atTop)) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Información de Seguro de Vida"
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
              src="/Safeguard.jpg"
              alt="Safeguard"
              className="h-14 w-auto object-contain rounded-md"
            />
            <div>
              <h3 className="text-xl font-semibold">Seguro de Vida — SafeGuard</h3>
              <p className="text-sm text-gray-500">Cobertura a término con opción de beneficio por enfermedad grave</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707A1 1 0 114.707 3.293L10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body: two-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: content scrollable */}
          <div
            ref={contentRef}
            className="col-span-2 p-6 overflow-auto max-h-[70vh] prose prose-sm sm:prose overscroll-none"
          >
            <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
          </div>

          {/* Right: sidebar summary + bullets + CTA (sticky) */}
          <aside className="p-6 border-l hidden lg:block">
            <div className="sticky top-6">
              <h4 className="text-lg font-semibold mb-3">Resumen ejecutivo</h4>
              <p className="text-gray-700 mb-4">
                Seguro de vida a término, diseñado para proteger económicamente a tu familia ante fallecimiento o diagnósticos graves. Coberturas simples, renovables y con opciones según necesidad.
              </p>

              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• Plazos típicos: 10 o 20 años</li>
                <li>• Opción de Beneficio por Enfermedad Grave (pago único)</li>
                <li>• Renovación anual hasta 75 años</li>
                <li>• Primas competitivas; pueden cambiar tras el plazo inicial</li>
              </ul>

              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/18006839337"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex justify-center items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
                >
                  Cotizar ahora
                </a>

                <button
                  onClick={onClose}
                  className="mt-2 inline-flex justify-center items-center border border-gray-200 bg-white text-gray-700 py-2 px-4 rounded-md hover:shadow-sm transition"
                >
                  Cerrar
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Resumen informativo — la póliza completa especifica términos, exclusiones y requisitos.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}