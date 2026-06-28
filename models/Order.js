const mongoose = require('mongoose');

const direccionEnvioSchema = new mongoose.Schema(
  {
    calle: { type: String, required: true },
    ciudad: { type: String, required: true },
    codigoPostal: { type: String, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    numeroOrden: { type: String, required: true, unique: true },
    productos: { type: Array, required: true },
    direccionEnvio: { type: direccionEnvioSchema, required: true },
    nombreTitular: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    impuesto: { type: Number, required: true },
    total: { type: Number, required: true },
    metodo_pago: {
      type: String,
      enum: ['tarjeta', 'transferencia', 'paypal', 'efectivo'],
      required: true
    },
    referencia_pago: { type: String, default: null },
    estado_pago: {
      type: String,
      enum: ['pendiente', 'completado', 'rechazado'],
      default: 'pendiente'
    },
    estado_envio: {
      type: String,
      enum: ['pendiente', 'preparando', 'enviado', 'entregado'],
      default: 'pendiente'
    },
    notas: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
