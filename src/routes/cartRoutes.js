const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticateJWT } = require('../middleware/authenticateJWT');

// Obtener el carrito del usuario
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username })
      .populate('cart.product');
    
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Calcular total
    const cart = user.cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({ cart, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
});

// Añadir producto al carrito
router.post('/add', authenticateJWT, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'ProductId es requerido' });
    }

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Verificar si el producto ya está en el carrito
    const existingItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      // Incrementar cantidad
      existingItem.quantity += quantity;
    } else {
      // Añadir nuevo producto
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    await user.populate('cart.product');

    res.json({ message: 'Producto añadido al carrito', cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al añadir al carrito' });
  }
});

// Actualizar cantidad de un producto en el carrito
router.put('/update', authenticateJWT, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'ProductId y quantity son requeridos' });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: 'Cantidad no puede ser negativa' });
    }

    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const cartItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    if (quantity === 0) {
      // Eliminar del carrito si cantidad es 0
      user.cart = user.cart.filter(
        item => item.product.toString() !== productId
      );
    } else {
      cartItem.quantity = quantity;
    }

    await user.save();
    await user.populate('cart.product');

    res.json({ message: 'Carrito actualizado', cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el carrito' });
  }
});

// Eliminar producto del carrito
router.delete('/remove/:productId', authenticateJWT, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();
    await user.populate('cart.product');

    res.json({ message: 'Producto eliminado del carrito', cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar del carrito' });
  }
});

// Vaciar el carrito
router.delete('/clear', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.cart = [];
    await user.save();

    res.json({ message: 'Carrito vaciado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al vaciar el carrito' });
  }
});

module.exports = router;