const mongoose = require('mongoose');

const IVA = 0.16; // 16% IVA México

const productoSchema = new mongoose.Schema(
  {
    productoId: { type: String, required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    cantidad: { type: Number, required: true, min: 1 },
    imagen: { type: String, default: '' },
    categoria: { type: String, default: '' }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productos: { type: [productoSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    impuesto: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    estado: {
      type: String,
      enum: ['activo', 'comprado', 'cancelado'],
      default: 'activo'
    }
  },
  { timestamps: true }
);

// Redondea a 2 decimales
const redondear = (num) => Math.round(num * 100) / 100;

cartSchema.methods.calcularTotales = function () {
  this.subtotal = redondear(
    this.productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0)
  );
  this.impuesto = redondear(this.subtotal * IVA);
  this.total = redondear(this.subtotal + this.impuesto);
};

// Recalcular automáticamente antes de cada guardado
cartSchema.pre('save', function (next) {
  this.calcularTotales();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
