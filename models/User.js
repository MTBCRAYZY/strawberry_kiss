const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'El email no es válido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false
    },
    telefono: { type: String, default: '' },
    direccion: { type: String, default: '' },
    ciudad: { type: String, default: '' },
    codigoPostal: { type: String, default: '' },
    rol: {
      type: String,
      enum: ['usuario', 'admin'],
      default: 'usuario'
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo', 'bloqueado'],
      default: 'activo'
    }
  },
  { timestamps: true } // createdAt, updatedAt
);

// Encriptar password antes de guardar (solo si cambió)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparar password ingresada vs hash guardado
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('User', userSchema);
