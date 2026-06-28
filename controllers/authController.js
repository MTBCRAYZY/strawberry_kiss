const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const formatearUsuario = (usuario) => ({
  id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol
});

// POST /api/auth/registro
exports.registro = async (req, res) => {
  try {
    const { nombre, email, password, confirmPassword } = req.body;

    if (!nombre || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Las contraseñas no coinciden' });
    }

    const existente = await User.findOne({ email: email.toLowerCase() });
    if (existente) {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }

    const usuario = await User.create({ nombre, email, password });
    const token = generarToken(usuario);

    res.status(201).json({
      success: true,
      token,
      usuario: formatearUsuario(usuario)
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al registrar usuario' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
    }

    const usuario = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!usuario) {
      return res.status(401).json({ success: false, error: 'Email o contraseña incorrectos' });
    }

    if (usuario.estado === 'bloqueado') {
      return res.status(403).json({ success: false, error: 'Cuenta bloqueada, contacta soporte' });
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(401).json({ success: false, error: 'Email o contraseña incorrectos' });
    }

    const token = generarToken(usuario);

    res.json({
      success: true,
      token,
      usuario: formatearUsuario(usuario)
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
  }
};

// GET /api/auth/me
exports.obtenerPerfil = async (req, res) => {
  res.json({ success: true, usuario: req.usuario });
};

// PUT /api/auth/actualizar-perfil
exports.actualizarPerfil = async (req, res) => {
  try {
    const camposPermitidos = ['nombre', 'telefono', 'direccion', 'ciudad', 'codigoPostal'];
    const actualizaciones = {};

    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        actualizaciones[campo] = req.body[campo];
      }
    });

    const usuario = await User.findByIdAndUpdate(req.usuario._id, actualizaciones, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, usuario });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar perfil' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  // JWT es stateless: el cliente simplemente descarta el token guardado.
  res.json({ success: true, mensaje: 'Sesión cerrada correctamente' });
};
