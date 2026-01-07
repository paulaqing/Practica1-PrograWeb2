const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticateJWT, authorizeRole } = require('../middleware/authenticateJWT');

// Obtener todos los pedidos (solo admin)
router.get('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const { status } = req.query; // Filtro opcional por estado
    
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

// Obtener pedidos del usuario actual
router.get('/my-orders', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const orders = await Order.find({ user: user._id })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

// Obtener un pedido por ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username');
    
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Solo el admin o el dueño del pedido pueden verlo
    if (req.user.role !== 'admin' && order.user.username !== req.user.username) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener pedido' });
  }
});

// Actualizar estado de pedido (solo admin)
router.put('/:id/status', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'username');

    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    res.json({ message: 'Estado actualizado', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
});

module.exports = router;