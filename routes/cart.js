const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', cartController.obtenerCarrito);
router.post('/agregar', cartController.agregarProducto);
router.put('/actualizar/:productoId', cartController.actualizarCantidad);
router.delete('/eliminar/:productoId', cartController.eliminarProducto);
router.delete('/vaciar', cartController.vaciarCarrito);

module.exports = router;
