const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  nombre:       { type: String, required: true, trim: true },
  apellido:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  telefono:     { type: String, default: '' },
  puesto:       { type: String, required: true, trim: true }, // ej: "Cajero", "Panadero", "Repartidor"
  turno:        { type: String, enum: ['matutino','vespertino','nocturno','completo'], default: 'matutino' },
  salario:      { type: Number, default: 0 },
  fechaIngreso: { type: Date, default: Date.now },
  estado:       { type: String, enum: ['activo','inactivo','vacaciones','baja'], default: 'activo' },
  notas:        { type: String, default: '' }
}, { timestamps: true });

employeeSchema.virtual('nombreCompleto').get(function () {
  return `${this.nombre} ${this.apellido}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
