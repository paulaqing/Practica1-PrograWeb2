const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

// Registro (solo como user)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Faltan datos.' });

    // Los usuarios siempre se registran como 'user'
    const userRole = 'user';

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: 'Usuario ya existe.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: userRole });
    await newUser.save();

    res.json({ message: `Usuario ${username} registrado correctamente` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar usuario.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user)
      return res.status(400).json({ message: 'Usuario no encontrado.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: 'Contraseña incorrecta.' });

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
});

module.exports = router;