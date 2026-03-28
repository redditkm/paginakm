import React, { useState, useEffect, useRef } from "react";

// --- MODAL universal ---
function Modal({ show, onClose, children }) {
  const ref = useRef(null);

  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (show) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, [show]);

  React.useEffect(() => {
    if (!show) return;
    const modal = ref.current;

    function handleWheel(e) {
      if (!modal) return;
      if (!modal.contains(e.target)) {
        e.preventDefault();
        return;
      }
      const deltaY = e.deltaY;
      const atTop = modal.scrollTop === 0;
      const atBottom = Math.ceil(modal.scrollTop + modal.clientHeight) >= modal.scrollHeight;
      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    }

    let touchStartY = 0;

    function handleTouchStart(e) {
      if (e.touches && e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    }

    function handleTouchMove(e) {
      if (!modal.contains(e.target)) {
        e.preventDefault();
        return;
      }
      const atTop = modal.scrollTop === 0;
      const atBottom = Math.ceil(modal.scrollTop + modal.clientHeight) >= modal.scrollHeight;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY;

      if ((deltaY > 0 && atTop) || (deltaY < 0 && atBottom)) {
        e.preventDefault();
      }
    }

    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleWheel, { passive: false });
      document.removeEventListener("touchstart", handleTouchStart, { passive: true });
      document.removeEventListener("touchmove", handleTouchMove, { passive: false });
    };
  }, [show]);

  React.useEffect(() => {
    const esc = (e) => e.key === "Escape" && show && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose, show]);

  const handleBackDrop = (e) => {
    if (ref.current && !ref.current.contains(e.target)) onClose();
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-8"
      onMouseDown={handleBackDrop}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={ref}
        className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-8 outline-none"
        tabIndex={-1}
      >
        <button
          className="absolute top-3 right-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 8.586l5.293-5.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10l-5.293-5.293A1 1 0 114.707 3.293L10 8.586z" clipRule="evenodd"/>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [showModalIdx, setShowModalIdx] = useState(null);

  useEffect(() => {
    fetch("http://192.168.50.14:5000/api/blogs")
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(e => setPosts([]));
  }, []);

  // Reparte en dos filas
  const firstRow = posts.slice(0, 3);
  const secondRow = posts.slice(3, 6);

  const getModalContent = (idx) => {
    const blog = posts[idx];
    if (!blog) return <div className="text-center text-gray-400 text-lg font-medium py-12">Artículo en construcción. Pronto disponible.</div>;

    return (
      <article className="prose prose-lg prose-red max-w-none leading-relaxed">
        <header>
          <h1 className="mb-2">{blog.title}</h1>
          <p className="text-base text-gray-400 mb-6">
            {blog.author && <span className="font-semibold">{blog.author}</span>}{" "}
            {blog.date && `· ${new Date(blog.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </header>
        {blog.content ? (
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        ) : (
          <p className="text-gray-500">Sin contenido.</p>
        )}
      </article>
    );
  };

  return (
    <section id="blog" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-4xl font-bold text-center text-black mb-12">
          Blog y Noticias
        </h3>
        {[firstRow, secondRow].map((rowPosts, rowIdx) => (
          <div key={rowIdx} className="grid md:grid-cols-3 gap-10 mb-10">
            {rowPosts.map((post, idx) => (
              <div key={idx} className="p-6 border rounded-xl bg-white shadow hover:shadow-lg transition flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-bold text-red-600 mb-2">{post.title}</h4>
                  <div className="text-xs text-gray-400 mb-1">{new Date(post.date).toLocaleDateString('es-ES')}</div>
                  <p className="text-gray-700 mb-4">{post.summary}</p>
                </div>
                <button
                  className="mt-auto bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition text-center"
                  onClick={() => setShowModalIdx(rowIdx * 3 + idx)}
                >
                  Leer más
                </button>
              </div>
            ))}
          </div>
        ))}

        <Modal show={showModalIdx !== null} onClose={() => setShowModalIdx(null)}>
          {showModalIdx !== null ? getModalContent(showModalIdx) : null}
        </Modal>
      </div>
    </section>
  );
}