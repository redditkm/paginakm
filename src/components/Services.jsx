import { useState } from "react";
import LifeInsuranceModal from "./LifeInsuranceModal";
import lifeInsuranceContent from "./lifeInsuranceContent";
import ObamacareModal from "./ObamacareModal";
import obamacareContent from "./obamacareContent";
import SupplementaryProductsModal from "./SupplementaryProductsModal";

export default function Services() {
  const [openLifeModal, setOpenLifeModal] = useState(false);
  const [openObamacareModal, setOpenObamacareModal] = useState(false);
  const [openSupplementary, setOpenSupplementary] = useState(false);

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-4xl font-bold text-center text-black mb-12">
          Nuestros Servicios
        </h3>

        <div className="grid md:grid-cols-3 gap-10">
          {/* OBAMACARE */}
          <div
            onClick={() => setOpenObamacareModal(true)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenObamacareModal(true)}
            role="button"
            tabIndex={0}
            className="p-6 border rounded-xl shadow hover:shadow-lg transition bg-gray-50 cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-200 flex flex-col justify-between items-center"
          >
            <h4 className="text-2xl font-bold text-red-600 mb-3 text-center">
              Obamacare / ACA
            </h4>
            <p className="text-gray-700 mb-4 text-center">
              Accede a tu seguro médico subsidiado por el gobierno, con ayuda financiera según tus ingresos.
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setOpenObamacareModal(true); }}
              className="inline-block bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition mt-auto"
            >
              Ver más
            </button>
          </div>

          {/* SEGUROS DE VIDA */}
          <div
            onClick={() => setOpenLifeModal(true)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenLifeModal(true)}
            role="button"
            tabIndex={0}
            className="p-6 border rounded-xl shadow hover:shadow-lg transition bg-gray-50 cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-200 flex flex-col justify-between items-center"
          >
            <h4 className="text-2xl font-bold text-red-600 mb-3 text-center">
              Seguros de Vida
            </h4>
            <p className="text-gray-700 mb-4 text-center">
              Protege a tu familia con un seguro de vida a término sencillo y accesible.
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setOpenLifeModal(true); }}
              className="inline-block bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition mt-auto"
            >
              Ver más
            </button>
          </div>

          {/* PLANES SUPLEMENTARIOS */}
          <div className="p-6 border rounded-xl shadow hover:shadow-lg transition bg-gray-50 flex flex-col items-center">
            <h4 className="text-2xl font-bold text-red-600 mb-3 text-center">
              Planes Suplementarios
            </h4>
            <p className="text-gray-700 text-center mb-4">
              Cobertura para accidentes, cáncer, hospitalización, y más. Elige para ver detalles.
            </p>
            <button
              className="inline-block bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition mt-auto"
              onClick={() => setOpenSupplementary(true)}
            >
              Ver productos y detalles
            </button>
          </div>
        </div>
      </div>

      {/* Modal con la información completa del seguro de vida */}
      {openLifeModal && (
        <LifeInsuranceModal
          onClose={() => setOpenLifeModal(false)}
          content={lifeInsuranceContent}
        />
      )}
      {/* Modal con la información completa de Obamacare */}
      {openObamacareModal && (
        <ObamacareModal
          onClose={() => setOpenObamacareModal(false)}
          content={obamacareContent}
        />
      )}
      {/* Modal de productos suplementarios */}
      {openSupplementary && (
        <SupplementaryProductsModal
          onClose={() => setOpenSupplementary(false)}
        />
      )}
    </section>
  );
}