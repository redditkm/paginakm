const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findByUsername(username);
  if (!user || !(await User.verifyPassword(user, password))) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });
  res.json({ token, username: user.username });
});

// Endpoint para crear usuario (opcional, para inicializar el admin)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findByUsername(username);
  if (exists) return res.status(409).json({ error: 'Ya existe ese usuario' });
  await User.create(username, password);
  res.json({ ok: true });
});

module.exports = router;