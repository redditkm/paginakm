// components/Admin/ContentEditorPanel.jsx

import React, { useState, useEffect, useRef } from "react";
import ContentList from "./ContentList";
import ContentForm from "./ContentForm";

const API_BASE = "http://192.168.10.149:5000";

export default function ContentEditorPanel() {
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterType, setFilterType] = useState("");
  const [stats, setStats] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    fetchContents();
    fetchStats();

    return () => {
      mountedRef.current = false;
    };
  }, [filterType]);

  async function fetchContents() {
    setListLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("blog_token");
      const url = filterType
        ? `${API_BASE}/api/admin/contents?type=${filterType}`
        : `${API_BASE}/api/admin/contents`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          localStorage.removeItem("blog_token");
          window.location.href = "/";
          return;
        }
        throw new Error("Error al cargar contenidos");
      }

      const data = await res.json();
      if (mountedRef.current) {
        setContents(Array.isArray(data.data) ? data.data : data);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "Error cargando contenidos");
      }
    } finally {
      if (mountedRef.current) {
        setListLoading(false);
      }
    }
  }

  async function fetchStats() {
    try {
      const token = localStorage.getItem("blog_token");
      const res = await fetch(`${API_BASE}/api/admin/contents/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (mountedRef.current) {
          setStats(data.data || data);
        }
      }
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  }

  async function handleSave(formData) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("blog_token");
      const endpoint = selectedContent
        ? `${API_BASE}/api/admin/contents/${selectedContent.id}`
        : `${API_BASE}/api/admin/contents`;
      const method = selectedContent ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al guardar");
      }

      if (mountedRef.current) {
        setSuccess(
          selectedContent
            ? "Contenido actualizado exitosamente ✓"
            : "Contenido creado exitosamente ✓"
        );
        setTimeout(() => {
          if (mountedRef.current) {
            setSuccess("");
          }
        }, 3000);
      }

      handleCancel();
      fetchContents();
      fetchStats();
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "Error al guardar contenido");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  async function handleDelete(id) {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("blog_token");
      const res = await fetch(`${API_BASE}/api/admin/contents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Error al eliminar");
      }

      if (mountedRef.current) {
        setSuccess("Contenido eliminado exitosamente ✓");
        setTimeout(() => {
          if (mountedRef.current) {
            setSuccess("");
          }
        }, 3000);
      }

      setSelectedContent(null);
      setShowForm(false);
      fetchContents();
      fetchStats();
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "Error al eliminar");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  function handleNew() {
    setSelectedContent(null);
    setShowForm(true);
  }

  function handleEdit(content) {
    setSelectedContent(content);
    setShowForm(true);
  }

  function handleCancel() {
    setSelectedContent(null);
    setShowForm(false);
    setError("");
  }

  return (
    <div className="max-w-7xl mx-auto my-12 p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Editor de Contenido</h2>
        <p className="text-gray-600">Gestiona todas las páginas y contenidos de tu sitio</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total de Contenidos</p>
            <p className="text-3xl font-bold text-blue-900">{stats.total || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Publicados</p>
            <p className="text-3xl font-bold text-green-900">{stats.published || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Borradores</p>
            <p className="text-3xl font-bold text-yellow-900">{stats.drafts || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Vistas Totales</p>
            <p className="text-3xl font-bold text-purple-900">{stats.total_views || 0}</p>
          </div>
        </div>
      )}

      {/* Alertas */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button
          onClick={handleNew}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
        >
          + Nuevo Contenido
        </button>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="page">Páginas</option>
          <option value="legal">Legales</option>
          <option value="section">Secciones</option>
          <option value="blog">Blog</option>
        </select>
      </div>

      {/* Contenido Principal */}
      {showForm ? (
        <div className="mb-8">
          <ContentForm
            content={selectedContent}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      ) : (
        <div>
          <ContentList
            contents={contents}
            selectedId={selectedContent?.id}
            onSelect={setSelectedContent}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={listLoading}
          />
        </div>
      )}
    </div>
  );
}