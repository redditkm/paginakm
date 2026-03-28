// components/pages/About.jsx

import React, { useEffect, useState } from "react";
import { contentApi } from "../../utils/contentApi";

export default function About() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      setLoading(true);
      setError("");
      const data = await contentApi.getBySlug("about-us");
      setContent(data);
    } catch (err) {
      setError("No pudimos cargar la página de información");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center text-gray-500">Cargando...</div>
      </section>
    );
  }

  if (error || !content) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center text-red-600">{error || "Contenido no encontrado"}</div>
      </section>
    );
  }

  const metadata = content.metadata || {};
  const textAlign = metadata.alignment || "center";
  const fontFamily = metadata.font || "inherit";
  const fontSize = metadata.fontSize || "18px";
  const textColor = metadata.color || "#1f2937";
  const bgColor = metadata.bgColor || "transparent";

  return (
    <section
      className="max-w-5xl mx-auto px-6 py-16 text-gray-800 rounded-lg"
      style={{
        textAlign: textAlign,
        fontFamily: fontFamily,
        fontSize: fontSize,
        color: textColor,
        backgroundColor: bgColor
      }}
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{content.title}</h1>
      
      {content.subtitle && (
        <h2 className="text-xl md:text-2xl font-semibold mb-8 text-gray-600">{content.subtitle}</h2>
      )}

      {content.featured_image && (
        <img
          src={content.featured_image}
          alt={content.title}
          className="w-full max-h-96 object-cover rounded-lg mb-8"
        />
      )}

      <div
        className="prose prose-lg max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Última actualización: {new Date(content.updated_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </p>
      </div>
    </section>
  );
}