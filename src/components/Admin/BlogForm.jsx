import { useState } from "react";

// Helper para obtener el token JWT guardado
function getToken() {
  return localStorage.getItem("blog_token") || "";
}

export default function BlogForm({ blog, onClose, onSaved }) {
  // Si es edición, precarga los datos
  const [title, setTitle] = useState(blog?.title || "");
  const [subtitle, setSubtitle] = useState(blog?.subtitle || "");
  const [author, setAuthor] = useState(blog?.author || "");
  const [summary, setSummary] = useState(blog?.summary || "");
  const [content, setContent] = useState(blog?.content || "");
  const [date, setDate] = useState(blog?.date || new Date().toISOString().slice(0,10));
  const [image, setImage] = useState(blog?.image || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = blog
        ? `http://192.168.10.149:5000/api/blogs/${blog.id}`
        : "http://192.168.10.149:5000/api/blogs";
      const method = blog ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + getToken(),
        },
        body: JSON.stringify({ title, subtitle, author, summary, content, date, image }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el blog.");
      }
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl relative overflow-auto max-h-[90vh]"
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-500 text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6">{blog ? "Editar" : "Nuevo"} Blog</h2>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Título</label>
            <input
              className="w-full border px-3 py-2 rounded-lg"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Subtítulo</label>
            <input
              className="w-full border px-3 py-2 rounded-lg"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Autor</label>
            <input
              className="w-full border px-3 py-2 rounded-lg"
              value={author}
              onChange={e => setAuthor(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Imagen (url o nombre de archivo)</label>
            <input
              className="w-full border px-3 py-2 rounded-lg"
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="ejemplo.jpg"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Fecha</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded-lg"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Resumen</label>
            <textarea
              className="w-full border px-3 py-2 rounded-lg"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block mb-1 font-medium">Contenido <span className="font-normal text-gray-400 text-xs">(Puede usar HTML básico)</span></label>
          <textarea
            className="w-full border px-3 py-2 rounded-lg font-mono"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            required
            placeholder="<p>Texto, <b>enriquecido</b>, listas, etc</p>"
          />
        </div>
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Guardando..." : blog ? "Guardar cambios" : "Publicar"}
          </button>
          <button
            type="button"
            className="bg-gray-200 px-4 py-2 rounded-lg font-bold text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}