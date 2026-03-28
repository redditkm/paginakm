/**
 * App.jsx - VERSIÓN COMPLETA INTEGRADA
 * 
 * ✅ Nuevo LoginForm con Argon2
 * ✅ ContentEditorPanel integrado
 * ✅ Rutas públicas dinámicas
 * ✅ Rutas admin protegidas
 * ✅ Manejo de festividades global
 * ✅ Responsive y optimizado
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// =====================
// COMPONENTES PÚBLICOS
// =====================
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/pages/About";
import Footer from "./components/Footer";
import Stats from "./components/Stats";
import ContactButton from "./components/ContactButton";
import Companies from "./components/Companies";
import CompaniesModal from "./components/CompaniesModal";
import Blog from "./components/Blog";
import CallModal from "./components/CallModal";

// =====================
// COMPONENTES ADMIN
// =====================
import LoginForm from "./components/Admin/LoginForm";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminHome from "./components/Admin/AdminHome";
import AdminNavbar from "./components/Admin/AdminNavbar";

// =====================
// PANELES ADMIN
// =====================
import BlogPanel from "./components/Admin/BlogPanel";
import LeadsPanel from "./components/Admin/LeadsPanel";
import ContentEditorPanel from "./components/Admin/ContentEditorPanel";

// =====================
// PÁGINAS LEGALES DINÁMICAS
// =====================
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";
import Disclaimer from "./components/legal/Disclaimer";

// =====================
// UTILIDADES Y MANAGERS
// =====================
import SeasonalManager from "./seasonal/SeasonalManager";

/**
 * Componente principal de la aplicación
 */
export default function App() {
  // =====================
  // STATE
  // =====================
  const [companiesModalOpen, setCompaniesModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  // Obtener token del localStorage
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("blog_token")
      : null;

  // =====================
  // COMPONENTE CONDICIONAL - NAVBAR
  // =====================
  /**
   * Navbar público que se oculta en rutas /admin
   */
  function ConditionalNavbar(props) {
    const location = useLocation();
    
    // No mostrar navbar en admin
    if (location.pathname.startsWith("/admin")) {
      return null;
    }
    
    return (
      <Navbar {...props} />
    );
  }

  // =====================
  // COMPONENTE CONDICIONAL - FOOTER
  // =====================
  /**
   * Footer que se muestra en todas partes excepto admin
   */
  function ConditionalFooter(props) {
    const location = useLocation();
    
    // No mostrar footer en admin
    if (location.pathname.startsWith("/admin")) {
      return null;
    }
    
    return (
      <Footer {...props} />
    );
  }

  // =====================
  // RENDER
  // =====================
  return (
    <BrowserRouter>
      {/* 🎄 MANAGER DE FESTIVIDADES (GLOBAL) */}
      <SeasonalManager checkInterval={60_000} />

      {/* NAVBAR PÚBLICO (Se oculta automáticamente en /admin) */}
      <ConditionalNavbar
        onOpenCompanies={() => setCompaniesModalOpen(true)}
        onOpenCall={() => setCallModalOpen(true)}
      />

      {/* RUTAS PRINCIPALES */}
      <Routes>
        
        {/* =============== PÁGINA PRINCIPAL =============== */}
        <Route
          path="/"
          element={
            <div className="w-full overflow-x-hidden bg-white text-gray-900">
              {/* HERO SECTION */}
              <section className="relative w-screen h-screen overflow-hidden">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <video
                    className="hero-video w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/videofondo.mp4" type="video/mp4" />
                  </video>
                </div>

                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Contenido hero */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                  <h1 className="text-white text-5xl md:text-7xl font-extrabold drop-shadow-xl">
                    KM DINIVAL
                  </h1>

                  <p className="text-white text-xl md:text-3xl mt-4 font-medium drop-shadow-md max-w-3xl">
                    Obtén tu seguro médico con Obamacare y paga menos según tus
                    ingresos.
                    <br />
                    Asesoría gratuita en español · Sin compromiso.
                  </p>

                  <ContactButton />
                </div>
              </section>

              {/* SECCIONES DE CONTENIDO */}
              <Services />
              <Blog />
              <Companies />
              <Stats />

              {/* FOOTER */}
              <Footer onOpenCompanies={() => setCompaniesModalOpen(true)} />

              {/* MODALES */}
              {companiesModalOpen && (
                <CompaniesModal
                  onClose={() => setCompaniesModalOpen(false)}
                />
              )}

              {callModalOpen && (
                <CallModal onClose={() => setCallModalOpen(false)} />
              )}
            </div>
          }
        />

        {/* =============== PÁGINAS LEGALES (DINÁMICAS DESDE BD) =============== */}
        
        <Route 
          path="/privacy-policy" 
          element={
            <>
              <PrivacyPolicy />
              <ConditionalFooter onOpenCompanies={() => setCompaniesModalOpen(true)} />
            </>
          } 
        />

        <Route 
          path="/terms-of-service" 
          element={
            <>
              <TermsOfService />
              <ConditionalFooter onOpenCompanies={() => setCompaniesModalOpen(true)} />
            </>
          } 
        />

        <Route 
          path="/disclaimer" 
          element={
            <>
              <Disclaimer />
              <ConditionalFooter onOpenCompanies={() => setCompaniesModalOpen(true)} />
            </>
          } 
        />

        {/* =============== PÁGINA ABOUT (DINÁMICO) =============== */}
        <Route 
          path="/about" 
          element={
            <>
              <About />
              <ConditionalFooter onOpenCompanies={() => setCompaniesModalOpen(true)} />
            </>
          } 
        />

        {/* =============== PANEL ADMIN =============== */}
        <Route
          path="/admin/*"
          element={
            token ? (
              // Usuario autenticado - mostrar admin layout
              <AdminLayout />
            ) : (
              // No autenticado - mostrar formulario login
              <LoginForm onLogin={() => window.location.reload()} />
            )
          }
        >
          {/* Rutas internas del admin (solo se muestran si hay token) */}
          {token && (
            <>
              {/* Dashboard home */}
              <Route 
                index 
                element={<AdminHome />} 
              />

              {/* Gestión de blogs */}
              <Route 
                path="blogs" 
                element={<BlogPanel />} 
              />

              {/* Gestión de leads */}
              <Route 
                path="leads" 
                element={<LeadsPanel />} 
              />

              {/* ✨ NUEVO: Editor de contenidos */}
              <Route 
                path="content-editor" 
                element={<ContentEditorPanel />} 
              />
            </>
          )}
        </Route>

        {/* =============== PÁGINA 404 =============== */}
        <Route
          path="*"
          element={
            <div className="w-full">
              <div className="max-w-5xl mx-auto px-6 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">404</h1>
                <p className="text-gray-600 mb-8">Página no encontrada</p>
                <a 
                  href="/" 
                  className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Volver al inicio
                </a>
              </div>
              <ConditionalFooter onOpenCompanies={() => setCompaniesModalOpen(true)} />
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}