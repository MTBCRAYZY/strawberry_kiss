const path     = require('path');
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Intento2-PAGINAWEB')));

// ── Rutas API ──────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/carrito',     require('./routes/cart'));
app.use('/api/pagos',       require('./routes/payment'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/empleados',   require('./routes/employees'));
app.use('/api/proveedores', require('./routes/suppliers'));
app.use('/api/productos',   require('./routes/products'));

// Ping / healthcheck
app.get('/api/ping', (_req, res) => res.json({
  success: true, mensaje: '✅ Strawberry Kiss API',
  timestamp: new Date().toISOString(),
  db: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
}));

app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Ruta no encontrada' }));

// SPA fallback
app.get('*', (_req, res) =>
  res.sendFile(path.join(__dirname, 'Intento2-PAGINAWEB', 'index.html'))
);

// Error handler global
app.use((err, _req, res, _next) => {
  console.error('❌', err.message);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

// ── Arrancar ──────────────────────────────────────────────
async function iniciar() {
  const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/strawberry-kiss';
  try {
    await mongoose.connect(URI);
    console.log('✅ MongoDB conectado →', URI);
    app.listen(PORT, () => {
      console.log(`\n🍓 ═══════════════════════════════════════`);
      console.log(`   Strawberry Kiss  →  http://localhost:${PORT}`);
      console.log(`   Panel Admin      →  http://localhost:${PORT}/admin.html`);
      console.log(`🍓 ═══════════════════════════════════════\n`);
    });
  } catch (err) {
    console.error('❌ No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  }
}
iniciar();
module.exports = app;
