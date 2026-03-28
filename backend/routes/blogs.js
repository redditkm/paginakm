const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

// Middleware para JWT
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'No autorizado' });
  }
}

// Mostrar blogs públicos (máx 6)
router.get('/', async (req, res) => {
  const blogs = await Blog.getAll();
  res.json(blogs);
});

// Crear blog (privado)
router.post('/', auth, async (req, res) => {
  await Blog.create(req.body);
  res.status(201).json({ ok: true });
});

// Actualizar blog
router.put('/:id', auth, async (req, res) => {
  await Blog.update(req.params.id, req.body);
  res.json({ ok: true });
});

// Eliminar blog
router.delete('/:id', auth, async (req, res) => {
  await Blog.remove(req.params.id);
  res.json({ ok: true });
});

module.exports = router;