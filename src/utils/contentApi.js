// utils/contentApi.js

const API_BASE = "http://192.168.10.149:5000";

export const contentApi = {
  /**
   * Obtener contenido por slug (público)
   */
  async getBySlug(slug) {
    try {
      const res = await fetch(`${API_BASE}/api/contents/${slug}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error(`Error obteniendo contenido ${slug}:`, err);
      throw err;
    }
  },

  /**
   * Obtener todos los contenidos (público)
   */
  async getAll(type = null) {
    try {
      const url = type ? `${API_BASE}/api/contents?type=${type}` : `${API_BASE}/api/contents`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error("Error obteniendo contenidos:", err);
      throw err;
    }
  },

  /**
   * Buscar contenidos (público)
   */
  async search(query) {
    try {
      const res = await fetch(`${API_BASE}/api/contents/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error("Error buscando contenidos:", err);
      throw err;
    }
  },

  /**
   * Obtener todos los contenidos (admin)
   */
  async adminGetAll(type = null, token = null) {
    try {
      const authToken = token || localStorage.getItem("blog_token");
      if (!authToken) {
        throw new Error("Token no disponible");
      }

      const url = type
        ? `${API_BASE}/api/admin/contents?type=${type}`
        : `${API_BASE}/api/admin/contents`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("blog_token");
          throw new Error("Sesión expirada");
        }
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error("Error obteniendo contenidos admin:", err);
      throw err;
    }
  },

  /**
   * Obtener contenido por ID (admin)
   */
  async adminGetById(id, token = null) {
    try {
      const authToken = token || localStorage.getItem("blog_token");
      if (!authToken) {
        throw new Error("Token no disponible");
      }

      const res = await fetch(`${API_BASE}/api/admin/contents/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error(`Error obteniendo contenido ${id}:`, err);
      throw err;
    }
  },

  /**
   * Crear contenido (admin)
   */
  async create(formData, token = null) {
    try {
      const authToken = token || localStorage.getItem("blog_token");
      if (!authToken) {
        throw new Error("Token no disponible");
      }

      const res = await fetch(`${API_BASE}/api/admin/contents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error("Error creando contenido:", err);
      throw err;
    }
  },

  /**
   * Actualizar contenido (admin)
   */
  async update(id, formData, token = null) {
    try {
      const authToken = token || localStorage.getItem("blog_token");
      if (!authToken) {
        throw new Error("Token no disponible");
      }

      const res = await fetch(`${API_BASE}/api/admin/contents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error("Error actualizando contenido:", err);
      throw err;
    }
  },

  /**
   * Eliminar contenido (admin)
   */
  async delete(id, token = null) {
    try {
      const authToken = token || localStorage.getItem("blog_token");
      if (!authToken) {
        throw new Error("Token no disponible");
      }

      const res = await fetch(`${API_BASE}/api/admin/contents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error eliminando contenido:", err);
      throw err;
    }
  },

  /**
   * Publicar/Despublicar contenido (admin)
   */
  async togglePublish(id, isPublished, token = null) {
    try {
      const authToken = token || localStorage.getItem("blog_token");
      if (!authToken) {
        throw new Error("Token no disponible");
      }

      const res = await fetch(`${API_BASE}/api/admin/contents/${id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ is_published: isPublished })
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error actualizando estado de publicación:", err);
      throw err;
    }
  },

  /**
   * Obtener contenidos por tipo (admin)
   */
  async getByType(type, token = null) {
    try {
      const authToken = token || localStorage.getItem("blog_token");
      if (!authToken) {
        throw new Error("Token no disponible");
      }

      const res = await fetch(`${API_BASE}/api/admin/contents/type/${type}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error(`Error obteniendo contenidos de tipo ${type}:`, err);
      throw err;
    }
  },

  /**
   * Obtener estadísticas (admin)
   */
  async getStats(token = null) {
    try {
      const authToken = token || localStorage.getItem("blog_token");
      if (!authToken) {
        throw new Error("Token no disponible");
      }

      const res = await fetch(`${API_BASE}/api/admin/contents/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.error("Error obteniendo estadísticas:", err);
      throw err;
    }
  }
};

export default contentApi;