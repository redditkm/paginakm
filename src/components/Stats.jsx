import { useState, useEffect, useRef } from "react";

export default function Stats() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const stats = [
    { number: 30, label: "Compañías" },
    { number: 7247, label: "Clientes" },
    { number: 17, label: "Agentes" },
    { number: 175, label: "Asesores" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-16 px-4 text-center"
    >
      <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-10">
        Encuentre cobertura con KM Dinival
      </h2>

      {/* GRID SIEMPRE 4 COLUMNAS */}
      <div className="grid grid-cols-4 gap-4 sm:gap-8 max-w-6xl mx-auto">

        {stats.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center min-w-[60px]"
          >
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-red-600 leading-tight">
              {visible ? <AnimatedNumber value={item.number} /> : "0"}
            </h3>

            <p className="text-[10px] sm:text-sm md:text-lg text-gray-700 font-semibold mt-1 leading-snug text-center">
              {item.label}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
}

function AnimatedNumber({ value }) {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= value) {
        clearInterval(counter);
        setNumber(value);
      } else {
        setNumber(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value]);

  return <span>{number.toLocaleString()}</span>;
}
