const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: String,
  empresa: String,
  direccion: String,
  direccionComplementaria: String,
  codigoPostal: String,
  ciudad: String,
  pais: { type: String, default: 'España' },
  provincia: String,
  nif: String,
  role: { type: String, default: 'cliente' }
}, { timestamps: true });


// Hash password antes de guardar
clienteSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Cliente', clienteSchema);

