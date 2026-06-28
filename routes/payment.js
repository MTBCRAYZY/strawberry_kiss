const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Pública: cualquiera puede ver los métodos de pago disponibles
router.get('/metodos-disponibles', paymentController.metodosDisponibles);

// Resto de rutas de pago requieren estar autenticado
router.use(protect);
router.post('/procesar', paymentController.procesarPago);
router.get('/ordenes', paymentController.obtenerOrdenes);
router.get('/orden/:id', paymentController.obtenerOrden);
router.post('/cancelar-orden/:orderId', paymentController.cancelarOrden);

module.exports = router;
