const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateJWT, authorizeRole } = require('../middleware/authenticateJWT');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Obtener todos los productos (todos los usuarios pueden ver)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Crear producto con imagen (solo admin)
router.post('/', authenticateJWT, authorizeRole('admin'), upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  try {
    const productData = {
      name,
      description,
      price: parseFloat(price)
    };

    // Si se subió una imagen, guardar la ruta
    if (req.file) {
      productData.image = '/uploads/' + req.file.filename;
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Editar producto con opción de cambiar imagen (solo admin)
router.put('/:id', authenticateJWT, authorizeRole('admin'), upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Actualizar datos básicos
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? parseFloat(price) : product.price;

    // Si se subió una nueva imagen
    if (req.file) {
      // Eliminar la imagen anterior si existe
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.image = '/uploads/' + req.file.filename;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// Eliminar producto y su imagen (solo admin)
router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Eliminar imagen si existe
    if (product.image) {
      const imagePath = path.join(__dirname, '..', 'public', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;