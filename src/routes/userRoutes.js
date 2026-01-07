const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateJWT, authorizeRole } = require('../middleware/authenticateJWT');

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario por ID (solo admin)
router.get('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

// Actualizar rol de usuario (solo admin)
router.put('/:id/role', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ message: 'Rol actualizado', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

module.exports = router;