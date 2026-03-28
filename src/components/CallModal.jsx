import { useState } from "react";

export default function CallModal({ onClose }) {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    codigoPostal: "",
    telefono: "",
    condado: "",
    estado: "",
  });

  const [condados, setCondados] = useState([]);
  const [error, setError] = useState("");
  const [loadingZips, setLoadingZips] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleZipChange(e) {
    const raw = e.target.value;
    // sólo dígitos, máximo 5 (ZIP simple)
    const zip = raw.replace(/\D/g, "").slice(0, 5);

    setForm((prev) => ({
      ...prev,
      codigoPostal: zip,
      condado: "",
      estado: "",
    }));
    setCondados([]);
    setError("");

    if (zip.length === 5) {
      setLoadingZips(true);
      try {
        const res = await fetch(`http://192.168.50.14:5000/api/zip/${zip}`);
        if (res.ok) {
          const data = await res.json();
          setCondados(data);

          // Si solo hay un condado → asignar automáticamente
          if (Array.isArray(data) && data.length === 1) {
            setForm((prev) => ({
              ...prev,
              condado: data[0].county,
              estado: data[0].estado,
            }));
          }
        } else {
          setCondados([]);
        }
      } catch (err) {
        console.error("Error fetching ZIP data:", err);
        setCondados([]);
      } finally {
        setLoadingZips(false);
      }
    }
  }

  function validateForm() {
    // ZIP obligatorio y válido: 5 dígitos
    if (!/^\d{5}$/.test(form.codigoPostal)) {
      return "Por favor ingresa un código postal (ZIP) válido de 5 dígitos.";
    }
    // Si hay múltiples condados en la respuesta, debe seleccionarse uno
    if (condados.length > 1 && !form.condado) {
      return "Por favor selecciona el condado correspondiente al ZIP.";
    }
    // Nombre/apellidos
    if (!form.nombre.trim() || !form.apellidos.trim()) {
      return "Por favor ingresa nombre y apellidos.";
    }
    // Teléfono: comprobación básica (7-15 dígitos, opcional +)
    if (!/^\+?\d{7,15}$/.test(form.telefono.trim())) {
      return "Ingresa un número telefónico válido (solo dígitos, opcional +).";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      codigoPostal: form.codigoPostal,
      condado: form.condado,
      estado: form.estado,
      telefono: form.telefono.trim(),
      createdAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      const res = await fetch("http://192.168.10.149:5000/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Error al enviar la solicitud.");
      }

      const body = await res.json();
      // éxito
      alert("Solicitud enviada correctamente. Nos pondremos en contacto pronto.");
      // opcional: limpiar formulario
      setForm({
        nombre: "",
        apellidos: "",
        codigoPostal: "",
        telefono: "",
        condado: "",
        estado: "",
      });
      setCondados([]);
      onClose();
    } catch (err) {
      console.error("Error submitting lead:", err);
      setError(err.message || "Error al enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fadein">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Agendar llamada
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}

          <input
            type="text"
            name="nombre"
            placeholder="Nombres"
            required
            value={form.nombre}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          />

          <input
            type="text"
            name="apellidos"
            placeholder="Apellidos"
            required
            value={form.apellidos}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          />

          <input
            type="text"
            name="codigoPostal"
            placeholder="Código postal (ZIP) - 5 dígitos"
            required
            value={form.codigoPostal}
            onChange={handleZipChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
          />

          {/* CONDADOS */}
          {loadingZips && (
            <div className="text-sm text-gray-500">Buscando condados...</div>
          )}

          {condados.length > 0 && (
            <>
              {condados.length === 1 && (
                <div className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-700">
                  {condados[0].county} ({condados[0].estado})
                </div>
              )}

              {condados.length > 1 && (
                <select
                  name="condado"
                  value={form.condado}
                  required
                  onChange={(e) => {
                    const selected = condados.find((c) => c.county === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      condado: selected.county,
                      estado: selected.estado,
                    }));
                  }}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">Selecciona condado</option>
                  {condados.map((c, i) => (
                    <option key={i} value={c.county}>
                      {c.county} ({c.estado})
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          <input
            type="tel"
            name="telefono"
            placeholder="Número telefónico"
            required
            value={form.telefono}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, telefono: e.target.value.replace(/[^+\d]/g, "") }))
            }
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          />

          <button
            type="submit"
            disabled={submitting}
            className={`w-full ${submitting ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"} text-white py-2.5 rounded-lg font-semibold transition`}
          >
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>

        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <style>{`
        .animate-fadein {
          animation: fadein .2s ease-out both;
        }
        @keyframes fadein {
          from { opacity: 0; transform: scale(.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}