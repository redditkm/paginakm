import { Link } from "react-router-dom";

export default function Footer({ onOpenCompanies }) {
  const phoneNumber = "18006839337";
  const emailAddress = "info@kmdinival.com";

  const isMobile = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handlePhoneClick = (e) => {
    e.preventDefault();
    if (isMobile()) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      window.open(`https://wa.me/${phoneNumber}`, "_blank");
    }
  };

  const handleEmailClick = (e) => {
    e.preventDefault();
    window.location.href = `mailto:${emailAddress}`;
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white">
      {/* GRID FIJO 4 COLUMNAS */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-4 gap-6 sm:gap-8">

        {/* CONTACTO */}
        <div className="min-w-[70px]">
          <h4 className="text-[11px] sm:text-xs font-semibold mb-2 text-red-600 uppercase">
            Contacto
          </h4>

          <button
            onClick={handlePhoneClick}
            className="block text-[10px] sm:text-xs text-gray-300 leading-snug hover:text-red-500 transition"
          >
            +1 (800) 683-9337
          </button>

          <button
            onClick={handleEmailClick}
            className="mt-1 block text-[10px] sm:text-xs text-gray-300 leading-snug hover:text-red-500 transition"
          >
            info@kmdinival.com
          </button>
        </div>

        {/* REDES */}
        <div className="min-w-[70px]">
          <h4 className="text-[11px] sm:text-xs font-semibold mb-2 text-red-600 uppercase">
            Redes
          </h4>

          <ul className="space-y-1 text-[10px] sm:text-xs text-gray-300 leading-snug">
            <li>
              <a
                href="https://www.facebook.com/p/KM-Dinival-Insurance-100092952045797/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/kmdinival/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@kmdinival"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition"
              >
                TikTok
              </a>
            </li>
          </ul>
        </div>

        {/* MENÚ */}
        <div className="min-w-[70px]">
          <h4 className="text-[11px] sm:text-xs font-semibold mb-2 text-red-600 uppercase">
            Menú
          </h4>

          <ul className="space-y-1 text-[10px] sm:text-xs text-gray-300 leading-snug">
            <li>
              <button
                onClick={handleScrollToTop}
                className="hover:text-red-500 transition"
              >
                Inicio
              </button>
            </li>
            <li>
              <a href="#servicios" className="hover:text-red-500 transition">
                Servicios
              </a>
            </li>
            <li>
              <button
                onClick={() => onOpenCompanies?.()}
                className="hover:text-red-500 transition"
              >
                Compañías
              </button>
            </li>
            <li>
              <a href="#contacto" className="hover:text-red-500 transition">
                Contacto
              </a>
            </li>
          </ul>
        </div>

        {/* CONFIANZA */}
        <div className="min-w-[70px]">
          <h4 className="text-[11px] sm:text-xs font-semibold mb-2 text-red-600 uppercase">
            ¿Por qué confiar?
          </h4>

          <ul className="space-y-1 text-[10px] sm:text-xs text-gray-300 leading-snug">
            <li>✔ Asesores certificados</li>
            <li>✔ Atención 100% en español</li>
            <li>✔ Sin costo por asesoría</li>
            <li>✔ Acompañamiento durante todo el año</li>
            <li>✔ Ayuda con cambios y renovaciones</li>
          </ul>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="border-t border-gray-800 py-2 text-center text-[10px] sm:text-xs text-gray-500">
        © {new Date().getFullYear()} KM Dinival Insurance — Todos los derechos reservados.

        {/* LINKS LEGALES */}
        <div className="mt-2 flex justify-center gap-4 text-[10px] sm:text-xs">
          <Link to="/privacy-policy" className="hover:text-red-500 transition">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="hover:text-red-500 transition">
            Terms of Service
          </Link>
          <Link to="/disclaimer" className="hover:text-red-500 transition">
            Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
}
