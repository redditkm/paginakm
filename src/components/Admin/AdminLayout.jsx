import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin navbar (fixed) */}
      <AdminNavbar />

      {/* Espacio superior para compensar el navbar fijo */}
      <main className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}