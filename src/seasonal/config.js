// Central config para activar/desactivar temporadas
// La prioridad es:
// 1️⃣ Admin (localStorage)
// 2️⃣ Variable de entorno VITE_ACTIVE_SEASON
// 3️⃣ Configuración por código (seasons)

export const seasons = {
  christmas: false,
  halloween: false,
  sanvalentin: false,
  fourthofjuly: false,
};

export function getActiveSeason() {
  // ===============================
  // 1️⃣ Control desde Admin (localStorage)
  // ===============================
  if (typeof window !== "undefined") {
    const adminSeasons = [
      "christmas",
      "halloween",
      "sanvalentin",
      "fourthofjuly",
    ];

    for (const season of adminSeasons) {
      if (localStorage.getItem(`season_${season}`) === "true") {
        return season; // SOLO UNA
      }
    }
  }

  // ===============================
  // 2️⃣ Variable de entorno (.env)
  // ===============================
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_ACTIVE_SEASON
  ) {
    return String(import.meta.env.VITE_ACTIVE_SEASON).toLowerCase();
  }

  // ===============================
  // 3️⃣ Configuración por código
  // ===============================
  const enabled = Object.keys(seasons).find((k) => seasons[k]);
  return enabled ?? "none";
}
