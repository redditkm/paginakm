import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ onOpenCompanies, onOpenCall }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function goHome() {
    setMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  return (
    <header className="bg-black text-white shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2.5">

        {/* LOGO */}
        <img
          src="/logokm.png"
          alt="Logo KM Dinival"
          className="h-9 md:h-10 w-auto object-contain cursor-pointer"
          onClick={goHome}
        />

        {/* MENU ESCRITORIO (Público) */}
        <nav className="hidden md:flex gap-6 text-sm md:text-base">
          <button
            onClick={goHome}
            className="hover:text-red-600 transition bg-transparent"
            type="button"
          >
            Inicio
          </button>

          <a href="#servicios" className="hover:text-red-600 transition">
            Servicios
          </a>

          <button
            onClick={() => onOpenCompanies?.()}
            className="hover:text-red-600 transition bg-transparent"
            type="button"
          >
            Compañías
          </button>

          <a href="#nosotros" className="hover:text-red-600 transition">
            Nosotros
          </a>

          <a href="#contacto" className="hover:text-red-600 transition">
            Contacto
          </a>
        </nav>

        {/* BOTÓN AGENDAR LLAMADA (Público) */}
        <button
          onClick={() => onOpenCall?.()}
          className="bg-red-600 px-4 py-2 rounded-md text-xs md:text-sm font-semibold hover:bg-red-700 transition whitespace-nowrap"
          type="button"
        >
          AGENDAR LLAMADA
        </button>

        {/* HAMBURGUESA MOBILE */}
        <button
          className="md:hidden ml-2 p-2 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen(true)}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </div>

      {/* MENÚ MOBILE */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* FONDO */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* PANEL */}
          <nav className="fixed inset-y-0 right-0 w-full bg-black text-white shadow-2xl flex flex-col pt-16 px-6 gap-3 animate-slidein">

            <button
              onClick={() => { goHome(); setMenuOpen(false); }}
              className="text-left text-base font-semibold py-3 border-b border-gray-700 hover:text-red-500"
            >
              Inicio
            </button>

            <a
              href="#servicios"
              onClick={() => setMenuOpen(false)}
              className="text-left text-base font-semibold py-3 border-b border-gray-700 hover:text-red-500"
            >
              Servicios
            </a>

            <button
              onClick={() => { onOpenCompanies?.(); setMenuOpen(false); }}
              className="text-left text-base font-semibold py-3 border-b border-gray-700 hover:text-red-500"
            >
              Compañías
            </button>

            <a
              href="#nosotros"
              onClick={() => setMenuOpen(false)}
              className="text-left text-base font-semibold py-3 border-b border-gray-700 hover:text-red-500"
            >
              Nosotros
            </a>

            <a
              href="#contacto"
              onClick={() => setMenuOpen(false)}
              className="text-left text-base font-semibold py-3 border-b border-gray-700 hover:text-red-500"
            >
              Contacto
            </a>

            {/* BOTÓN AGENDAR LLAMADA MOBILE */}
            <button
              onClick={() => { onOpenCall?.(); setMenuOpen(false); }}
              className="mt-4 bg-red-600 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              AGENDAR LLAMADA
            </button>

            {/* CERRAR */}
            <button
              onClick={() => setMenuOpen(false)}
              className="mt-6 border border-red-500 text-red-500 rounded-lg py-2 font-semibold hover:bg-red-600 hover:text-white transition"
            >
              Cerrar menú
            </button>
          </nav>
        </div>
      )}

      {/* ANIMACIÓN */}
      <style>{`
        .animate-slidein {
          animation: slidein .25s ease-out both;
        }
        @keyframes slidein {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </header>
  );
}