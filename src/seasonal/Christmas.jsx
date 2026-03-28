import React, { useEffect, useRef } from "react";
import "./seasonal.css";

/**
 * Christmas - canvas-based snow using images (optimizado)
 *
 * Cambios principales:
 * - Usa imágenes pre-cargadas (/navidad/copo1.png, copo2, copo3)
 * - No hay clusters/settling ni detección de botones: los copos caen hacia abajo y se reciclan.
 * - Canvas se sitúa por debajo de los elementos interactivos (z-index bajo) para que botones/navbar estén por encima.
 * - Pausa la animación si document.hidden.
 * - Límites tunados para rendimiento (DPR cap, MAX_FLAKES razonable).
 */

export default function Christmas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const flakesRef = useRef([]);
  const imgsRef = useRef([]);
  const runningRef = useRef(true);

  useEffect(() => {
    // Respeta prefers-reduced-motion
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const IMAGE_PATHS = ["/navidad/copo1.png", "/navidad/copo2.png", "/navidad/copo3.png"];

    // Crear canvas
    const canvas = document.createElement("canvas");
    canvas.className = "christmas-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    // Z-index BAJO para que el resto de la UI (navbar z-50, modals, botones con z) queden por encima.
    canvas.style.zIndex = "5";
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d", { alpha: true });

    // Preload imágenes (usar solo las que carguen)
    function preloadImages(paths) {
      return Promise.all(
        paths.map(
          (p) =>
            new Promise((resolve) => {
              const im = new Image();
              im.crossOrigin = "anonymous";
              im.onload = () => resolve(im);
              im.onerror = () => resolve(null); // si falla, resolvemos con null (ignoraremos)
              im.src = p;
            })
        )
      );
    }

    let DPR = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1)); // cap para rendimiento
    function resize() {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 640;
    const baseCount = isMobile ? 12 : 36;
    const MAX_FLAKES = Math.max(24, Math.round(baseCount * (DPR * 0.95)));

    function rand(a, b) { return a + Math.random() * (b - a); }

    function sizeForDevice() {
      if (isMobile) return rand(10, 20);
      return rand(14, 36);
    }

    function createFlake(opts = {}) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const img = opts.img || imgsRef.current[Math.floor(Math.random() * imgsRef.current.length)];
      if (!img) return null; // si no hay imagen válida, no crear flake
      const size = opts.size ?? sizeForDevice();
      const x = (typeof opts.x === "number") ? opts.x : rand(0, w);
      const y = (typeof opts.y === "number") ? opts.y : rand(-h * 0.6, 0);
      // Velocidad vertical moderada (px/s)
      const vy = opts.vy ?? rand(isMobile ? 18 : 40, isMobile ? 60 : 110);
      // Ligera deriva horizontal pero no exagerada
      const vx = opts.vx ?? rand(-12, 12);
      const rotation = Math.random() * Math.PI * 2;
      const rotationSpeed = rand(-0.6, 0.6);
      const alpha = opts.alpha ?? rand(0.75, 1);
      return { x, y, size, vy, vx, img, rotation, rotationSpeed, alpha };
    }

    function populate() {
      flakesRef.current = [];
      const imgs = imgsRef.current.filter(Boolean);
      if (imgs.length === 0) return;
      for (let i = 0; i < baseCount; i++) {
        const im = imgs[Math.floor(Math.random() * imgs.length)];
        const f = createFlake({ img: im });
        if (f) flakesRef.current.push(f);
      }
    }

    let last = performance.now();

    function drawFlake(f) {
      try {
        const w = f.size;
        const h = f.size * (f.img.naturalHeight / f.img.naturalWidth || 1);
        ctx.save();
        ctx.globalAlpha = Math.max(0.25, Math.min(1, f.alpha));
        // rotación ligera para dar naturalidad pero muy barata
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.drawImage(f.img, -w / 2, -h / 2, w, h);
        ctx.restore();
      } catch (err) {
        // ignorar
      }
    }

    function frame(now) {
      if (!runningRef.current) {
        rafRef.current = requestAnimationFrame(frame);
        last = now;
        return;
      }
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // clear only area (fast)
      ctx.clearRect(0, 0, w, h);

      const fl = flakesRef.current;
      for (let i = 0; i < fl.length; i++) {
        const f = fl[i];
        // update
        f.y += f.vy * dt;
        f.x += f.vx * dt; // sin zig-zag exagerado
        f.rotation += f.rotationSpeed * dt;

        // recycle when out of view
        if (f.y > h + 60) {
          // respawn arriba
          f.y = -rand(20, 140);
          f.x = rand(0, w);
          f.size = sizeForDevice();
          f.vy = rand(isMobile ? 18 : 40, isMobile ? 60 : 110);
          f.vx = rand(-12, 12);
          f.alpha = rand(0.75, 1);
          f.rotation = Math.random() * Math.PI * 2;
          f.rotationSpeed = rand(-0.6, 0.6);
          f.img = imgsRef.current[Math.floor(Math.random() * imgsRef.current.length)];
          // si no hay imagen válida, eliminamos el flake
          if (!f.img) {
            fl.splice(i, 1);
            i--; // ajustar índice
            continue;
          }
        }

        // draw flake (IMAGEN)
        drawFlake(f);
      }

      // cap length (por si acaso)
      if (fl.length > MAX_FLAKES) fl.length = MAX_FLAKES;

      rafRef.current = requestAnimationFrame(frame);
    }

    // visibility handling
    function handleVisibility() {
      runningRef.current = !document.hidden;
    }

    // start
    resize();
    preloadImages(IMAGE_PATHS).then((imgs) => {
      // filtrar nulls
      imgsRef.current = imgs.filter(Boolean);
      // Si no cargo ninguna imagen, no arrancar (evita caer círculos blancos)
      if (imgsRef.current.length === 0) {
        // cleanup canvas y no iniciar animación
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        return;
      }
      populate();
      last = performance.now();
      rafRef.current = requestAnimationFrame(frame);

      // listeners
      window.addEventListener("resize", resize, { passive: true });
      document.addEventListener("visibilitychange", handleVisibility);
    });

    // cleanup
    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}