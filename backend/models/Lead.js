// Reescrito para usar pool (../db) y formatear createdAt a formato MySQL compatible
const pool = require("../db");

function toMySQLDatetime(input) {
  const d = input instanceof Date ? input : new Date(input);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const Lead = {
  // Obtener todos los leads (orden descendente por createdAt)
  async getAll() {
    const [rows] = await pool.query(`SELECT * FROM leads ORDER BY createdAt DESC`);
    return rows;
  },

  // Obtener lead por id
  async getById(id) {
    const [rows] = await pool.query(`SELECT * FROM leads WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  // Crear un lead
  async create(payload = {}) {
    const {
      nombre = "",
      apellidos = "",
      codigoPostal = "",
      telefono = "",
      condado = "",
      estado = "",
      email = null,
      createdAt = new Date(),
    } = payload;

    // Asegurar formato compatible con MySQL DATETIME: "YYYY-MM-DD HH:MM:SS"
    const createdForDb = toMySQLDatetime(createdAt);

    const [result] = await pool.query(
      `INSERT INTO leads (nombre, apellidos, codigoPostal, telefono, condado, estado, email, createdAt, \`read\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellidos, codigoPostal, telefono, condado, estado, email || null, createdForDb, 0]
    );

    return result.insertId;
  },

  // Eliminar lead por id (funciona con MySQL)
  async remove(id) {
    await pool.query(`DELETE FROM leads WHERE id = ?`, [id]);
    return true;
  },

  // Contar todos los leads
  async count() {
    const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM leads`);
    return rows[0].cnt || 0;
  },

  // Contar leads no leídos
  async countUnread() {
    const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM leads WHERE \`read\` = 0`);
    return rows[0].cnt || 0;
  },

  // Marcar lead como leído
  async markRead(id) {
    await pool.query(`UPDATE leads SET \`read\` = 1 WHERE id = ?`, [id]);
    return true;
  },

  // Marcar lead como no leído
  async markUnread(id) {
    await pool.query(`UPDATE leads SET \`read\` = 0 WHERE id = ?`, [id]);
    return true;
  },

  // Alternar estado leído/no leído
  async toggleRead(id) {
    const lead = await this.getById(id);
    if (!lead) throw new Error("Lead not found");
    const newState = lead.read ? 0 : 1;
    await pool.query(`UPDATE leads SET \`read\` = ? WHERE id = ?`, [newState, id]);
    return newState;
  },
};

module.exports = Lead;