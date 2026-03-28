import companies from "./companiesData";

export default function Companies() {
  return (
    <section className="w-full bg-white py-12 overflow-hidden">
      <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-center mb-6 sm:mb-8 px-4 leading-tight">
        Compañías que confían en nosotros
      </h2>

      <div className="max-w-7xl mx-auto px-6">
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center gap-16 animate-scroll">
            {companies.map((c) => (
              <img
                key={c.key}
                src={`/${c.logo}`}
                alt={c.name}
                className="h-16 md:h-20 object-contain opacity-80 hover:opacity-100 transition"
              />
            ))}

            {/* Duplicado para animación infinita */}
            {companies.map((c) => (
              <img
                key={c.key + "-dup"}
                src={`/${c.logo}`}
                alt={c.name}
                className="h-16 md:h-20 object-contain opacity-80 hover:opacity-100 transition"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}