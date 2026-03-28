import React, { useEffect, useRef, useState } from "react";

/**
 * ScheduleCallModal
 * - Simple accessible modal to collect: nombres, apellidos, código postal, teléfono.
 * - Blocks background scroll while open and traps Escape.
 * - On submit: basic validation, then (for now) logs the payload and shows a success state.
 *   You can replace the submit handler to post to your API endpoint.
 */

export default function ScheduleCallModal({ onClose }) {
  const panelRef = useRef(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    function onDown(e) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  function validate() {
    if (!firstName.trim() || !lastName.trim()) return "Por favor ingresa nombre y apellido.";
    if (!/^\d{4,10}$/.test(postalCode.trim())) return "Ingresa un código postal válido (solo números).";
    // Very permissive phone check: 7-15 digits
    if (!/^\+?\d{7,15}$/.test(phone.trim())) return "Ingresa un número telefónico válido (solo dígitos, opcional +).";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSending(true);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim(),
        createdAt: new Date().toISOString(),
      };

      // TODO: Reemplaza con tu endpoint real si quieres almacenar citas.
      // Ejemplo:
      // await fetch(import.meta.env.VITE_API_URL + '/api/schedule', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });

      console.log("[ScheduleCall] payload:", payload);

      // fake delay to show progress
      await new Promise((r) => setTimeout(r, 700));
      setSent(true);
      setSending(false);
    } catch (err) {
      setSending(false);
      setError("No se pudo agendar. Intenta de nuevo.");
    }
  }

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4">¡Listo!</h3>
          <p className="text-gray-700 mb-6">Gracias. Tu solicitud de llamada ha sido recibida. Nos pondremos en contacto pronto para agendar una hora.</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Agendar llamada">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <form
        ref={panelRef}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Agendar llamada</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1 rounded hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nombres</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              required
              autoComplete="given-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Apellidos</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              required
              autoComplete="family-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Código postal</label>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="Ej: 33101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Número telefónico</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^+\d]/g, ""))}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="+1XXXXXXXXXX"
              required
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 px-3 py-2 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={sending}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            {sending ? "Enviando..." : "Solicitar llamada"}
          </button>
        </div>
      </form>
    </div>
  );
}