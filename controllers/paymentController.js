const crypto = require('crypto');
const Order = require('../models/Order');
const { obtenerOCrearCarrito } = require('./cartController');

const METODOS_PAGO = [
  { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito', icono: '💳' },
  { id: 'transferencia', nombre: 'Transferencia Bancaria', icono: '🏦' },
  { id: 'paypal', nombre: 'PayPal', icono: '🅿️' },
  { id: 'efectivo', nombre: 'Efectivo a la Entrega', icono: '💵' }
];

const generarNumeroOrden = () => {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `SK${yyyy}${mm}${dd}-${Date.now()}`;
};

const generarReferenciaPago = () => crypto.randomBytes(8).toString('hex').toUpperCase();

// GET /api/pagos/metodos-disponibles
exports.metodosDisponibles = (req, res) => {
  res.json({ success: true, metodos: METODOS_PAGO });
};

// POST /api/pagos/procesar
exports.procesarPago = async (req, res) => {
  try {
    const { metodo_pago, numeroTarjeta, cvv, nombreTitular, direccionEnvio, notas } = req.body;

    if (!metodo_pago || !nombreTitular || !direccionEnvio) {
      return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
    }

    const metodoValido = METODOS_PAGO.some((m) => m.id === metodo_pago);
    if (!metodoValido) {
      return res.status(400).json({ success: false, error: 'Método de pago no válido' });
    }

    if (!direccionEnvio.calle || !direccionEnvio.ciudad || !direccionEnvio.codigoPostal) {
      return res.status(400).json({ success: false, error: 'Dirección de envío incompleta' });
    }

    // Validación de tarjeta (solo si el método es 'tarjeta')
    if (metodo_pago === 'tarjeta') {
      if (!numeroTarjeta || !cvv) {
        return res.status(400).json({ success: false, error: 'Datos de tarjeta incompletos' });
      }
      if (!/^\d{16}$/.test(numeroTarjeta.replace(/\s/g, ''))) {
        return res.status(400).json({ success: false, error: 'Número de tarjeta inválido' });
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        return res.status(400).json({ success: false, error: 'CVV inválido' });
      }
    }

    const carrito = await obtenerOCrearCarrito(req.usuario._id);

    if (!carrito.productos || carrito.productos.length === 0) {
      return res.status(400).json({ success: false, error: 'El carrito está vacío' });
    }

    // Simulador de pago:
    // - tarjeta / paypal: se resuelve al instante (85% de éxito)
    // - transferencia / efectivo: queda 'pendiente' de confirmación manual
    let estado_pago;
    let referencia_pago = null;

    if (metodo_pago === 'tarjeta' || metodo_pago === 'paypal') {
      const pagoExitoso = Math.random() < 0.85;
      estado_pago = pagoExitoso ? 'completado' : 'rechazado';
      if (pagoExitoso) referencia_pago = generarReferenciaPago();
    } else {
      estado_pago = 'pendiente';
      referencia_pago = generarReferenciaPago();
    }

    const orden = await Order.create({
      usuario: req.usuario._id,
      numeroOrden: generarNumeroOrden(),
      productos: carrito.productos,
      direccionEnvio,
      nombreTitular,
      subtotal: carrito.subtotal,
      impuesto: carrito.impuesto,
      total: carrito.total,
      metodo_pago,
      referencia_pago,
      estado_pago,
      notas: notas || ''
    });

    if (estado_pago === 'rechazado') {
      // Carrito se conserva activo para que el usuario pueda reintentar el pago
      return res.status(402).json({
        success: false,
        error: 'El pago fue rechazado, intenta nuevamente',
        orden
      });
    }

    // Pago completado o pendiente de confirmación: se marca el carrito como comprado
    carrito.estado = 'comprado';
    await carrito.save();

    res.status(201).json({
      success: true,
      mensaje: 'Pago procesado correctamente',
      orden
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({ success: false, error: 'Error al procesar el pago' });
  }
};

// GET /api/pagos/ordenes
exports.obtenerOrdenes = async (req, res) => {
  try {
    const ordenes = await Order.find({ usuario: req.usuario._id }).sort({ createdAt: -1 });
    res.json({ success: true, ordenes });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener órdenes' });
  }
};

// GET /api/pagos/orden/:id
exports.obtenerOrden = async (req, res) => {
  try {
    const orden = await Order.findOne({ _id: req.params.id, usuario: req.usuario._id });
    if (!orden) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada' });
    }
    res.json({ success: true, orden });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ success: false, error: 'Error al obtener la orden' });
  }
};

// POST /api/pagos/cancelar-orden/:orderId
exports.cancelarOrden = async (req, res) => {
  try {
    const orden = await Order.findOne({ _id: req.params.orderId, usuario: req.usuario._id });

    if (!orden) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada' });
    }

    if (orden.estado_pago !== 'pendiente') {
      return res
        .status(400)
        .json({ success: false, error: 'Solo se pueden cancelar órdenes con pago pendiente' });
    }

    orden.estado_pago = 'rechazado';
    orden.notas = (orden.notas ? orden.notas + ' | ' : '') + 'Cancelada por el usuario';
    await orden.save();

    res.json({ success: true, mensaje: 'Orden cancelada', orden });
  } catch (error) {
    console.error('Error al cancelar orden:', error);
    res.status(500).json({ success: false, error: 'Error al cancelar la orden' });
  }
};
