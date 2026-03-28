import React, { useEffect, useState } from "react";
import { getActiveSeason } from "./config";

/**
 * SeasonalManager
 * - Consulta el backend (/api/festividades)
 * - Guarda el estado en localStorage
 * - Decide qué temporada cargar (Christmas, Halloween, etc.)
 * - Garantiza que SOLO una festividad esté activa
 * - Monta / desmonta automáticamente el componente
 */

const API_BASE = "http://localhost:5000";

export default function SeasonalManager({ checkInterval = 60000 }) {
  const [SeasonComponent, setSeasonComponent] = useState(null);
  const [activeSeason, setActiveSeason] = useState("none");

  // ===============================
  // 🔄 Sincronizar con backend
  // ===============================
  async function syncFestividades() {
    try {
      const res = await fetch(`${API_BASE}/api/festividades`);
      if (!res.ok) return;

      const data = await res.json();

      /**
       * El backend debe devolver algo como:
       * {
       *   navidad: true,
       *   halloween: false,
       *   sanvalentin: false,
       *   fourthofjuly: false
       * }
       */

      const seasons = {
        christmas: !!data.navidad,
        halloween: !!data.halloween,
        sanvalentin: !!data.sanvalentin,
        fourthofjuly: !!data.fourthofjuly,
      };

      // 🔥 SOLO UNA ACTIVA (la primera true gana)
      let activated = false;

      Object.entries(seasons).forEach(([key, value]) => {
        if (value && !activated) {
          localStorage.setItem(`season_${key}`, "true");
          activated = true;
        } else {
          localStorage.setItem(`season_${key}`, "false");
        }
      });

      // Recalcular temporada activa
      const season = getActiveSeason();
      setActiveSeason(season);
    } catch {
      // silencio intencional (no romper la UI)
    }
  }

  // ===============================
  // ⏱️ Polling al backend
  // ===============================
  useEffect(() => {
    syncFestividades(); // al montar

    const id = setInterval(syncFestividades, checkInterval);
    return () => clearInterval(id);
  }, [checkInterval]);

  // ===============================
  // 🎄 Cargar componente de temporada
  // ===============================
  useEffect(() => {
    let mounted = true;

    if (!activeSeason || activeSeason === "none") {
      setSeasonComponent(null);
      return;
    }

    const loaders = {
      christmas: () => import("./Christmas.jsx"),
      halloween: () => import("./Halloween.jsx"),
      sanvalentin: () => import("./SanValentin.jsx"),
      fourthofjuly: () => import("./FourthOfJuly.jsx"),
    };

    const loader = loaders[activeSeason];

    if (!loader) {
      console.warn(
        `[SeasonalManager] temporada desconocida: ${activeSeason}`
      );
      setSeasonComponent(null);
      return;
    }

    loader()
      .then((mod) => {
        if (!mounted) return;
        setSeasonComponent(() => mod.default ?? null);
      })
      .catch((err) => {
        console.error(
          "[SeasonalManager] error cargando temporada:",
          err
        );
        setSeasonComponent(null);
      });

    return () => {
      mounted = false;
    };
  }, [activeSeason]);

  if (!SeasonComponent) return null;
  return <SeasonComponent />;
}
