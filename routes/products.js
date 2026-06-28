const router = require('express').Router();
const ctrl   = require('../controllers/productController');
const { protect, autorizar } = require('../middleware/auth');
router.get('/', ctrl.listar);                                      // pública (catálogo)
router.use(protect, autorizar('admin'));                            // el resto solo admin
router.post('/',               ctrl.crear);
router.get('/:id',             ctrl.obtener);
router.put('/:id',             ctrl.actualizar);
router.patch('/:id/stock',     ctrl.ajustarStock);
router.delete('/:id',          ctrl.eliminar);
module.exports = router;
