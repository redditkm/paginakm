const express = require("express");
const router = express.Router();

// ⚠️ Temporal: en memoria
// Luego se puede mover a DB
let festividades = {
  navidad: false,
};

// GET estado actual
router.get("/", (req, res) => {
  res.json(festividades);
});

// POST actualizar estado
router.post("/", (req, res) => {
  const { navidad } = req.body;

  if (typeof navidad === "boolean") {
    festividades.navidad = navidad;
  }

  res.json({
    ok: true,
    festividades,
  });
});

module.exports = router;
