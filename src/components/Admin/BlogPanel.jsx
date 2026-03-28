import { useState, useEffect } from "react";
import BlogForm from "./BlogForm";

// Helper para recuperar token y salir (logout)
function getToken() {
  return localStorage.getItem("blog_token") || "";
}

export default function BlogPanel() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [leadsCount, setLeadsCount] = useState(null);

  // Obtener blogs con auth (blogs endpoint es público en backend, se mantiene igual)
  async function fetchBlogs() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://192.168.50.14:5000/api/blogs");
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      setError("Error cargando blogs.");
    }
    setLoading(false);
  }

  // Obtener contador de leads (para estadísticas rápidas)
  async function fetchLeadsCount() {
    try {
      const token = getToken();
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await fetch("http://192.168.50.14:5000/api/leads", { headers });

      // Si no autorizado -> limpiar token y forzar login (recargar para mostrar formulario de login)
      if (res.status === 401) {
        // opcional: eliminar token expirado y recargar para mostrar login
        localStorage.removeItem("blog_token");
        setLeadsCount(null);
        // Recargar la página para que el componente padre muestre el LoginForm
        setTimeout(() => window.location.reload(), 50);
        return;
      }

      if (!res.ok) {
        setLeadsCount(null);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setLeadsCount(data.length);
      } else if (typeof data.count === "number") {
        setLeadsCount(data.count);
      } else {
        setLeadsCount(null);
      }
    } catch (err) {
      setLeadsCount(null);
    }
  }

  useEffect(() => {
    fetchBlogs();
    fetchLeadsCount();
    const t = setInterval(() => fetchLeadsCount(), 30_000);
    return () => clearInterval(t);
  }, [showForm]);

  // Crear o editar un blog: abre el form
  function handleEdit(blog) {
    setEditingBlog(blog || null);
    setShowForm(true);
  }

  // Eliminar blog
  async function handleDelete(id) {
    if (!window.confirm("¿Seguro de eliminar este blog?")) return;
    try {
      await fetch(`http://192.168.50.14:5000/api/blogs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + getToken() }
      });
      fetchBlogs();
    } catch {
      alert("No se pudo eliminar.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-black">Panel: Admin Blogs</h2>
          <p className="text-sm text-gray-500">Gestiona los artículos publicados</p>
        </div>

        {/* Información rápida (no navegación — la navegación la provee AdminNavbar) */}
        <div className="text-right">
          {leadsCount !== null && (
            <div className="text-xs text-gray-600">Leads: <span className="font-semibold text-red-600">{leadsCount}</span></div>
          )}
        </div>
      </div>

      {/* CONTROL PARA NUEVO BLOG */}
      <div className="mb-6">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
          onClick={() => handleEdit(null)}
        >
          + Nuevo blog
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No hay blogs aún.</div>
      ) : (
        <table className="w-full text-left mb-16">
          <thead>
            <tr className="border-b">
              <th className="p-2">Título</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Autor</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-semibold">{blog.title}</td>
                <td className="p-2 text-sm">{blog.date}</td>
                <td className="p-2 text-sm">{blog.author}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="text-blue-700 hover:underline mr-2"
                    onClick={() => handleEdit(blog)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(blog.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal para blogform */}
      {showForm && (
        <BlogForm
          blog={editingBlog}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            fetchBlogs();
            fetchLeadsCount();
          }}
        />
      )}
    </div>
  );
}