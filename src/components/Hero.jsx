export default function Hero() {
  return (
    <section id="inicio" className="bg-gray-100">
      <div className="max-w-7xl mx-auto text-center py-20 px-6">

        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-black">
          Seguros Médicos en Estados Unidos
        </h2>

        <p className="text-xl text-gray-700 mb-8">
          Expertos en Obamacare — Tu salud y la de tu familia es nuestra prioridad.
        </p>

        <a 
          href="#contacto" 
          className="bg-red-600 text-white py-3 px-8 rounded-lg text-xl hover:bg-red-700 transition"
        >
          Cotiza tu seguro ahora
        </a>

      </div>
    </section>
  );
}
