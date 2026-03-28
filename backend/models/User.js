const pool = require('../db');
const bcrypt = require('bcrypt');

module.exports = {
  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },
  async create(username, password) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
  },
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
};