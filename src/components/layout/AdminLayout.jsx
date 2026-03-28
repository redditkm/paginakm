// components/layout/AdminLayout.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContentEditorPanel from "../Admin/ContentEditorPanel";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("contents");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("blog_token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("blog_token");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Admin */}
      <header className="bg-black text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-red-600">KM</span> DINIVAL - Admin
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Tabs de Navegación */}
      <nav className="bg-white border-b shadow">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          <button
            onClick={() => setActiveTab("contents")}
            className={`py-4 px-2 font-semibold border-b-2 transition ${
              activeTab === "contents"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📄 Contenidos
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-4 px-2 font-semibold border-b-2 transition ${
              activeTab === "settings"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            ⚙️ Configuración
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto">
        {activeTab === "contents" && <ContentEditorPanel />}
        
        {activeTab === "settings" && (
          <div className="my-12 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Configuración del Sitio</h2>
            <div className="text-gray-600">
              <p>Sección de configuración en desarrollo...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}