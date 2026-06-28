const mongoose = require('mongoose');

const itemRecibidoSchema = new mongoose.Schema({
  producto:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  nombre:     { type: String, required: true },
  cantidad:   { type: Number, required: true, min: 1 },
  unidad:     { type: String, default: 'pieza' }
}, { _id: false });

const supplierReceiptSchema = new mongoose.Schema({
  proveedor:  { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  empleado:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  productos:  { type: [itemRecibidoSchema], required: true },
  fecha:      { type: Date, default: Date.now },
  folio:      { type: String, unique: true },
  estado:     { type: String, enum: ['recibido','pendiente','con_incidencia'], default: 'recibido' },
  notas:      { type: String, default: '' }
}, { timestamps: true });

// Auto-generar folio antes de guardar
supplierReceiptSchema.pre('save', function (next) {
  if (!this.folio) {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    this.folio = `REC-${ymd}-${Date.now().toString().slice(-5)}`;
  }
  next();
});

module.exports = mongoose.model('SupplierReceipt', supplierReceiptSchema);
