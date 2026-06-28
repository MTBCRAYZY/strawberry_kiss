const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  empresa:      { type: String, required: true, trim: true },
  contacto:     { type: String, required: true, trim: true }, // nombre del representante
  email:        { type: String, default: '', trim: true },
  telefono:     { type: String, default: '' },
  direccion:    { type: String, default: '' },
  categorias:   [{ type: String }], // ej: ['harinas', 'lácteos', 'frutas']
  estado:       { type: String, enum: ['activo','inactivo','suspendido'], default: 'activo' },
  notas:        { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
