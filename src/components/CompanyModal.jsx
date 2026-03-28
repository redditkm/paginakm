import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * CompanyModal.jsx (portal)
 * - Renderiza en document.body para evitar problemas de stacking context.
 * - Muestra únicamente el botón "Cotizar ahora" en la parte superior derecha del modal (junto al cierre).
 * - No cierra al clickear el backdrop; cerrar con Escape o el icono de cerrar.
 * - Bloquea scroll de fondo y previene overscroll chaining.
 *
 * Props:
 * - company: object from companiesData (company.key used to select detailed content)
 * - onClose: function to call when closing
 */
export default function CompanyModal({ company, onClose }) {
  const panelRef = useRef(null);

  // BLOQUEO GLOBAL DE SCROLL Y OVERSCROLL CHAINING
  useEffect(() => {
    if (!company) return;
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    // Rueda fuera del modal: bloquea siempre
    const onWheelGlobal = (e) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (!panel.contains(e.target)) {
        e.preventDefault();
      }
    };
    // Touch fuera del modal: bloquea siempre
    const onTouchMoveGlobal = (e) => {
      const panel = panelRef.current;
      if (!panel) return;
      const el = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
      if (!panel.contains(el)) {
        e.preventDefault();
      }
    };
    document.addEventListener("wheel", onWheelGlobal, { passive: false });
    document.addEventListener("touchmove", onTouchMoveGlobal, { passive: false });

    // Limpieza
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      document.removeEventListener("wheel", onWheelGlobal);
      document.removeEventListener("touchmove", onTouchMoveGlobal);
    };
  }, [company]);

  // CONTROL DE OVERSCROLL CHAINING EN PANEL SCROLLABLE
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
      // Deja scrollear solo el contenido del modal
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // TECLADO: Escape para cerrar y trap de tab
  useEffect(() => {
    if (!company) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable =
          panelRef.current?.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
          ) || [];
        if (focusable.length === 0) return;
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
  }, [company, onClose]);

  if (!company) return null;

  // Detailed content mapping (as before)
  const details = {
    united: {
      title: "UnitedHealthcare — Detalles ampliados y específicos",
      sections: [
        {
          heading: "Beneficios básicos garantizados (beneficios esenciales ACA)",
          content: [
            "Los planes de UHC bajo el mercado ACA cubren los llamados “beneficios esenciales de salud”. Esto incluye al menos lo siguiente:",
            "Atención médica ambulatoria (consultas médicas sin hospitalización).",
            "Servicios de emergencia.",
            "Hospitalización (cirugías, estadías, intervenciones).",
            "Cuidado de maternidad y atención al recién nacido.",
            "Servicios de salud mental y tratamiento por uso de sustancias o problemas conductuales (psicoterapia, terapias, tratamiento especializado).",
            "Medicamentos con receta (cuando están incluidos en el formulario del plan).",
            "Servicios de rehabilitación y habilitación, así como dispositivos médicos o suministros especializados cuando sean necesarios.",
            "Servicios de laboratorio, análisis clínicos, imágenes diagnósticas (rayos, laboratorios, pruebas, etc.), cuando sean relevantes.",
            "Atención preventiva y medicina preventiva / bienestar / manejo de enfermedades crónicas.",
            "Atención pediátrica (para hijos) incluyendo, cuando aplique, cuidado de la vista y odontología pediátrica."
          ],
          summary:
            "En resumen: con UHC estás cubierto contra lo “esencial” — desde consultas o emergencias, hasta medicamentos y maternidad — siempre que el servicio esté dentro de la red correspondiente."
        },
        {
          heading: "Beneficios adicionales / ventajas que muchos planes ofrecen (según modalidad)",
          content: [
            "Telemedicina / Telehealth: servicios médicos y de salud mental vía video o audio, con la misma cobertura que una consulta en persona.",
            "Continuidad de cuidado y apoyo tras hospitalización: rehabilitación, seguimiento, terapia, cuidados especializados post-hospitalarios y suministro de dispositivos cuando se requiere.",
            "Cobertura de trasplantes y tratamientos especializados en los planes donde aplique (si cumplen criterios médicos reconocidos).",
            "Opciones de acceso a médicos especialistas o secundarios — dependiendo del plan (PPO, HMO, EPO) — con distintos niveles de flexibilidad.",
            "Planes para distintas necesidades: desde cobertura básica hasta opciones más completas, permitiendo ajustar prima, red y beneficios."
          ]
        }
      ]
    },
    // ...otros detalles igual...
    ambetter: {/* ... */},
    oscar: {/* ... */},
    cigna: {/* ... */},
    kaiser: {/* ... */},
    bcbs: {/* ... */}
  };

  const detail = details[company.key] || {
    title: company.name,
    sections: [
      {
        heading: "Información",
        content: [company.descriptionIntro || ""]
      }
    ]
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${company.name} — detalles ampliados`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel principal: UN SOLO SCROLL vertical */}
      <div
        ref={panelRef}
        className="relative z-20 w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <img src={`/${company.logo}`} alt={company.name} className="h-14 w-14 object-contain rounded-md bg-white p-1" />
            <div>
              <h2 className="text-xl font-bold">{company.name}</h2>
              {company.taglineShort && <p className="text-sm text-gray-600">{company.taglineShort}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/18006839337"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
            >
              Cotizar ahora
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Cerrar detalles"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 8.586L15.293 3.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707A1 1 0 114.707 3.293L10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        {/* Body: UNA sola columna con badge, intro, puntos clave y detalles ampliados */}
        <div className="p-6">
          {/* Badge */}
          <div className="mb-4">
            <span
              className="inline-block text-xs font-semibold text-white px-3 py-1 rounded"
              style={{ backgroundColor: company.color || "#333" }}
            >
              {company.shortBadge || company.name}
            </span>
          </div>
          {/* Intro */}
          <p className="text-sm text-gray-700 mb-4">{company.descriptionIntro}</p>
          {/* Puntos clave: Solo mostrar si existen */}
          {company.points && (
            <>
              <h4 className="text-sm font-semibold mb-2">Puntos clave</h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-4">
                {company.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </>
          )}
          {company.footerNote && <p className="text-xs text-gray-500 mt-4">{company.footerNote}</p>}
          {/* Detalle ampliado */}
          <h3 className="text-lg font-semibold mb-3">{detail.title}</h3>
          {detail.sections.map((sec, si) => (
            <section key={si} className="mb-6">
              {sec.heading && <h4 className="font-semibold mb-2">{sec.heading}</h4>}
              {sec.content && (
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  {sec.content.map((line, li) => (
                    <li key={li}>{line}</li>
                  ))}
                </ul>
              )}
              {sec.summary && <p className="mt-3 text-gray-700">{sec.summary}</p>}
              {sec.note && <p className="mt-3 text-sm text-gray-500">{sec.note}</p>}
            </section>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}