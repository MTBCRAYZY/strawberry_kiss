const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productoId:   { type: String, required: true, unique: true },
  nombre:       { type: String, required: true, trim: true },
  precio:       { type: Number, required: true, min: 0 },
  emoji:        { type: String, default: '🍰' },
  categoria:    { type: String, default: 'general' },
  descripcion:  { type: String, default: '' },
  stock:        { type: Number, default: 0, min: 0 },
  stockMinimo:  { type: Number, default: 5 },  // alerta si baja de aquí
  unidad:       { type: String, default: 'pieza' }, // pieza, caja, kg
  proveedor:    { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  activo:       { type: Boolean, default: true }
}, { timestamps: true });

// Virtual: ¿stock bajo?
productSchema.virtual('stockBajo').get(function () {
  return this.stock <= this.stockMinimo;
});

module.exports = mongoose.model('Product', productSchema);
