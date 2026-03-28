const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const router = express.Router();
const geoDataPath = path.resolve(__dirname, "../estados/geo-data.csv");

/**
 * GET /api/zip/:zip
 * Devuelve TODOS los condados del ZIP
 */
router.get("/:zip", (req, res) => {
  const zipCode = req.params.zip;
  const results = [];

  fs.createReadStream(geoDataPath)
    .pipe(csv())
    .on("data", (row) => {
      // 👇 ADAPTADO AL CSV REAL
      if (row.zip === zipCode) {
        results.push({
          county: row.county,
          estado: row.estado_1 || row.estado, // usa abreviatura si existe
        });
      }
    })
    .on("end", () => {
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ error: "ZIP no encontrado" });
      }
    })
    .on("error", (err) => {
      console.error("Error CSV:", err);
      res.status(500).json({ error: "Error leyendo CSV" });
    });
});

module.exports = router;
