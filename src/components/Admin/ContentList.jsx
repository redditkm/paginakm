// components/Admin/ContentList.jsx

import React from "react";

export default function ContentList({ contents, selectedId, onSelect, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando contenidos...</div>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No hay contenidos aún</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Título</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((content, idx) => (
              <tr
                key={content.id}
                className={`border-b hover:bg-gray-50 cursor-pointer transition ${
                  selectedId === content.id ? "bg-red-50" : ""
                }`}
                onClick={() => onSelect(content)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-sm text-gray-900">{content.title}</div>
                  {content.subtitle && (
                    <div className="text-xs text-gray-500">{content.subtitle}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{content.slug}</code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium">
                    {content.type === "page" && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Página</span>}
                    {content.type === "legal" && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Legal</span>}
                    {content.type === "section" && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Sección</span>}
                    {content.type === "blog" && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Blog</span>}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {content.is_published ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Publicado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      ✗ Borrador
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(content.created_at).toLocaleDateString("es-ES")}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(content);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("¿Eliminar este contenido?")) {
                          onDelete(content.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}