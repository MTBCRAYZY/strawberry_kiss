const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifica el token JWT y adjunta el usuario a req.usuario
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await User.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }

    if (usuario.estado === 'bloqueado') {
      return res.status(403).json({ success: false, error: 'Cuenta bloqueada' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Token inválido o expirado' });
  }
};

// Restringe una ruta a ciertos roles, ej: autorizar('admin')
exports.autorizar = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ success: false, error: 'No tienes permiso para esta acción' });
    }
    next();
  };
};
