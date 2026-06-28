const Product = require('../models/Product');

// GET /api/productos
exports.listar = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.categoria) filtro.categoria = req.query.categoria;
    if (req.query.activo !== undefined) filtro.activo = req.query.activo === 'true';
    if (req.query.stockBajo === 'true') filtro.$expr = { $lte: ['$stock', '$stockMinimo'] };
    const productos = await Product.find(filtro)
      .populate('proveedor','empresa contacto')
      .sort({ nombre: 1 });
    res.json({ success: true, productos });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// GET /api/productos/:id
exports.obtener = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).populate('proveedor','empresa');
    if (!p) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, producto: p });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// POST /api/productos
exports.crear = async (req, res) => {
  try {
    const { productoId, nombre, precio, emoji, categoria, descripcion, stock, stockMinimo, unidad, proveedor } = req.body;
    if (!productoId || !nombre || precio === undefined)
      return res.status(400).json({ success: false, error: 'ID, nombre y precio son obligatorios' });
    const existe = await Product.findOne({ productoId });
    if (existe) return res.status(400).json({ success: false, error: 'Ya existe un producto con ese ID' });
    const p = await Product.create({ productoId, nombre, precio, emoji, categoria, descripcion, stock: stock||0, stockMinimo: stockMinimo||5, unidad, proveedor: proveedor||null });
    res.status(201).json({ success: true, producto: p });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// PUT /api/productos/:id
exports.actualizar = async (req, res) => {
  try {
    const campos = ['nombre','precio','emoji','categoria','descripcion','stock','stockMinimo','unidad','proveedor','activo'];
    const datos = {};
    campos.forEach(c => { if (req.body[c] !== undefined) datos[c] = req.body[c]; });
    const p = await Product.findByIdAndUpdate(req.params.id, datos, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, producto: p });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// PATCH /api/productos/:id/stock  – ajuste rápido de stock
exports.ajustarStock = async (req, res) => {
  try {
    const { cantidad, operacion } = req.body; // operacion: 'set' | 'add' | 'sub'
    if (cantidad === undefined) return res.status(400).json({ success: false, error: 'Cantidad requerida' });
    let update;
    if (operacion === 'add') update = { $inc: { stock:  cantidad } };
    else if (operacion === 'sub') update = { $inc: { stock: -cantidad } };
    else update = { stock: cantidad };
    const p = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!p) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, producto: p, mensaje: `Stock actualizado a ${p.stock}` });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// DELETE /api/productos/:id  (desactivar)
exports.eliminar = async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!p) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, mensaje: 'Producto desactivado' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};
