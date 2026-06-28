const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.get('/me', protect, authController.obtenerPerfil);
router.put('/actualizar-perfil', protect, authController.actualizarPerfil);
router.post('/logout', protect, authController.logout);

module.exports = router;
