const pool = require('../db');

module.exports = {
  async getAll(limit = 6) {
    const [rows] = await pool.query('SELECT * FROM blogs ORDER BY date DESC LIMIT ?', [limit]);
    return rows;
  },
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { title, subtitle, author, summary, content, date, image } = data;
    await pool.query(
      'INSERT INTO blogs (title, subtitle, author, summary, content, date, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle, author, summary, content, date, image]
    );
  },
  async update(id, data) {
    const { title, subtitle, author, summary, content, date, image } = data;
    await pool.query(
      'UPDATE blogs SET title=?, subtitle=?, author=?, summary=?, content=?, date=?, image=?, updated_at=NOW() WHERE id=?',
      [title, subtitle, author, summary, content, date, image, id]
    );
  },
  async remove(id) {
    await pool.query('DELETE FROM blogs WHERE id=?', [id]);
  }
};