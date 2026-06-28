const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { protect, autorizar } = require('../middleware/auth');
router.use(protect, autorizar('admin'));
router.get('/dashboard', ctrl.dashboard);
module.exports = router;
