// components/Admin/ContentForm.jsx

import React, { useState, useEffect } from "react";
import WYSIWYGEditor from "./WYSIWYGEditor";

export default function ContentForm({ content, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState({
    slug: "",
    type: "page",
    title: "",
    subtitle: "",
    content: "",
    format: "html",
    metadata: {
      font: "Arial",
      fontSize: "16px",
      alignment: "left",
      color: "#000000"
    },
    featured_image: "",
    seo_description: "",
    seo_keywords: "",
    is_published: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (content) {
      setFormData({
        ...content,
        metadata: content.metadata || formData.metadata
      });
    }
  }, [content]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleMetadataChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value
      }
    }));
  }

  function handleContentChange(content) {
    setFormData((prev) => ({
      ...prev,
      content: content
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.slug.trim()) {
      newErrors.slug = "El slug es requerido";
    } else if (formData.slug.length < 3) {
      newErrors.slug = "El slug debe tener al menos 3 caracteres";
    }

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    } else if (formData.title.length < 3) {
      newErrors.title = "El título debe tener al menos 3 caracteres";
    }

    if (!formData.content.trim()) {
      newErrors.content = "El contenido es requerido";
    } else if (formData.content.length < 10) {
      newErrors.content = "El contenido debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg">
      {/* Slug */}
      <div>
        <label className="block font-semibold text-sm mb-2">Slug *</label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="ej: privacy-policy"
          className={`w-full border rounded px-3 py-2 ${
            errors.slug ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.slug && <p className="text-red-600 text-xs mt-1">{errors.slug}</p>}
      </div>

      {/* Tipo */}
      <div>
        <label className="block font-semibold text-sm mb-2">Tipo</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="page">Página</option>
          <option value="legal">Legal</option>
          <option value="section">Sección</option>
          <option value="blog">Blog</option>
        </select>
      </div>

      {/* Título */}
      <div>
        <label className="block font-semibold text-sm mb-2">Título *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Título del contenido"
          className={`w-full border rounded px-3 py-2 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* Subtítulo */}
      <div>
        <label className="block font-semibold text-sm mb-2">Subtítulo</label>
        <input
          type="text"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleChange}
          placeholder="Subtítulo (opcional)"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* Opciones de Formato */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-sm mb-4">Opciones de Formato</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Fuente</label>
            <select
              name="font"
              value={formData.metadata.font}
              onChange={handleMetadataChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Tamaño</label>
            <input
              type="text"
              name="fontSize"
              value={formData.metadata.fontSize}
              onChange={handleMetadataChange}
              placeholder="16px"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Alineación</label>
            <select
              name="alignment"
              value={formData.metadata.alignment}
              onChange={handleMetadataChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Color</label>
            <input
              type="color"
              name="color"
              value={formData.metadata.color}
              onChange={handleMetadataChange}
              className="w-full border border-gray-300 rounded px-2 py-1 h-9 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Contenido WYSIWYG */}
      <div>
        <label className="block font-semibold text-sm mb-2">Contenido *</label>
        <WYSIWYGEditor
          value={formData.content}
          onChange={handleContentChange}
          placeholder="Escribe el contenido aquí..."
        />
        {errors.content && <p className="text-red-600 text-xs mt-1">{errors.content}</p>}
      </div>

      {/* SEO */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-sm mb-4">SEO</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Descripción SEO</label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              placeholder="Breve descripción para meta tags"
              rows="2"
              maxLength="160"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.seo_description.length}/160 caracteres
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Palabras clave</label>
            <input
              type="text"
              name="seo_keywords"
              value={formData.seo_keywords}
              onChange={handleChange}
              placeholder="privacidad, datos, protección"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Publicado */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="is_published"
          id="is_published"
          checked={formData.is_published}
          onChange={handleChange}
          className="w-4 h-4 cursor-pointer"
        />
        <label htmlFor="is_published" className="text-sm cursor-pointer">
          Publicar este contenido
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded font-semibold text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Guardando..." : content ? "Actualizar" : "Crear"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded font-semibold bg-gray-300 hover:bg-gray-400 text-gray-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}