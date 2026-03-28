import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * LoginForm.jsx - VERSIÓN COMPLETA CON ARGON2
 * 
 * Características:
 * - Login simple: usuario + contraseña
 * - Validación Argon2 en backend
 * - JWT en localStorage
 * - Limpieza de tokens expirados
 * - UI profesional y responsiva
 * - Manejo robusto de errores
 * - Prevención de múltiples clicks
 */

const API_BASE = "http://localhost:5000"; //

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // =====================
  // EFFECT - Limpiar tokens expirados en mount
  // =====================
  useEffect(() => {
    const token = localStorage.getItem("blog_token");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("blog_token");
      localStorage.removeItem("blog_user");
      console.log("✅ Token expirado removido");
    }
  }, []);

  // =====================
  // VERIFICAR SI TOKEN HA EXPIRADO
  // =====================
  function isTokenExpired(token) {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return true;

      // Decodificar JWT payload (sin validar firma, solo para lectura)
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      );

      if (!payload.exp) return false;

      // payload.exp está en segundos, Date.now() está en milisegundos
      const isExpired = Date.now() / 1000 >= payload.exp;
      
      if (isExpired) {
        console.log("🔴 Token expirado");
      }
      
      return isExpired;
    } catch (err) {
      console.error("Error validando token:", err);
      return true;
    }
  }

  // =====================
  // MANEJO DE INPUT
  // =====================
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError("");
  }

  // =====================
  // SUBMIT - LOGIN
  // =====================
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validación básica
    if (!form.username.trim()) {
      setError("Por favor ingresa tu usuario");
      return;
    }

    if (!form.password) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Limpiar token expirado antes de intentar login
      const oldToken = localStorage.getItem("blog_token");
      if (oldToken && isTokenExpired(oldToken)) {
        localStorage.removeItem("blog_token");
        localStorage.removeItem("blog_user");
      }

      // Realizar login
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password
        })
      });

      // Parsear respuesta
      let body;
      try {
        body = await res.json();
      } catch {
        setError("Error al procesar la respuesta del servidor");
        setLoading(false);
        return;
      }

      // Validar respuesta
      if (!res.ok) {
        const errorMessage = body?.error || body?.message || "Credenciales inválidas";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Extraer token (puede estar en body.token o body.data.token)
      const token = body.token || body?.data?.token;
      if (!token) {
        setError("Error: No se recibió token del servidor");
        setLoading(false);
        return;
      }

      // Validar que sea un JWT válido
      if (!isValidJWT(token)) {
        setError("Token inválido recibido del servidor");
        setLoading(false);
        return;
      }

      // Guardar en localStorage
      localStorage.setItem("blog_token", token);
      
      // Guardar datos del usuario si están disponibles
      if (body?.data?.user?.username) {
        localStorage.setItem("blog_user", body.data.user.username);
      } else if (body?.user?.username) {
        localStorage.setItem("blog_user", body.user.username);
      }

      console.log("✅ Login exitoso");

      // Callback o redireccionamiento
      if (typeof onLogin === "function") {
        onLogin();
      } else {
        navigate("/admin");
        // Recargar para que App.jsx lea el nuevo token
        setTimeout(() => window.location.reload(), 50);
      }
    } catch (err) {
      console.error("❌ Error en login:", err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // VALIDAR JWT
  // =====================
  function isValidJWT(token) {
    try {
      const parts = token.split(".");
      return parts.length === 3; // Un JWT válido tiene 3 partes
    } catch {
      return false;
    }
  }

  // =====================
  // RENDER
  // =====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 py-8">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Contenedor */}
      <div className="w-full max-w-md relative z-10">
        {/* Card Principal */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Decorativo */}
          <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-orange-600"></div>

          {/* Contenido */}
          <div className="p-8">
            {/* Logo y título */}
            <div className="text-center mb-8">
              <img 
                src="/logokm.png" 
                alt="KM DINIVAL" 
                className="h-12 mx-auto mb-4 drop-shadow-sm"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Panel Admin
              </h1>
              <p className="text-sm text-gray-600">
                KM DINIVAL Insurance
              </p>
            </div>

            {/* Alert de Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Usuario */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Usuario
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none transition duration-200 placeholder-gray-400"
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                />
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none transition duration-200 placeholder-gray-400"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition"
                    title={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white transition duration-200 transform ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-95"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            {/* Info de seguridad */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <span className="font-bold">🔐 Seguridad:</span> Tu contraseña se protege con Argon2. Nunca la compartas con nadie.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-600">
              <p>¿Problemas para acceder?</p>
              <p>Contacta al equipo de soporte</p>
            </div>
          </div>

          {/* Footer adicional */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-600">
            © 2026 KM DINIVAL Insurance. Todos los derechos reservados.
          </div>
        </div>

        {/* Tip para usuario */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Usuario demo: <strong>admin</strong> | Contraseña: <strong>Admin123!@#</strong></p>
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}