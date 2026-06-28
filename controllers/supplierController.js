const Supplier        = require('../models/Supplier');
const SupplierReceipt = require('../models/SupplierReceipt');
const Product         = require('../models/Product');

// GET /api/proveedores
exports.listar = async (req, res) => {
  try {
    const proveedores = await Supplier.find().sort({ empresa: 1 });
    res.json({ success: true, proveedores });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// GET /api/proveedores/:id
exports.obtener = async (req, res) => {
  try {
    const p = await Supplier.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
    res.json({ success: true, proveedor: p });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// POST /api/proveedores
exports.crear = async (req, res) => {
  try {
    const { empresa, contacto, email, telefono, direccion, categorias, notas } = req.body;
    if (!empresa || !contacto) return res.status(400).json({ success: false, error: 'Empresa y contacto son obligatorios' });
    const p = await Supplier.create({ empresa, contacto, email, telefono, direccion, categorias: categorias || [], notas });
    res.status(201).json({ success: true, proveedor: p });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// PUT /api/proveedores/:id
exports.actualizar = async (req, res) => {
  try {
    const campos = ['empresa','contacto','email','telefono','direccion','categorias','estado','notas'];
    const datos = {};
    campos.forEach(c => { if (req.body[c] !== undefined) datos[c] = req.body[c]; });
    const p = await Supplier.findByIdAndUpdate(req.params.id, datos, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
    res.json({ success: true, proveedor: p });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// DELETE /api/proveedores/:id
exports.eliminar = async (req, res) => {
  try {
    const p = await Supplier.findByIdAndUpdate(req.params.id, { estado: 'suspendido' }, { new: true });
    if (!p) return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
    res.json({ success: true, mensaje: 'Proveedor suspendido' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// ── Recepciones ──────────────────────────────────────────────

// GET /api/proveedores/recepciones  (todas las recepciones)
exports.listarRecepciones = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.proveedor) filtro.proveedor = req.query.proveedor;
    if (req.query.empleado)  filtro.empleado  = req.query.empleado;
    const recs = await SupplierReceipt.find(filtro)
      .populate('proveedor','empresa contacto')
      .populate('empleado','nombre apellido puesto')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, recepciones: recs });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// POST /api/proveedores/recepciones  (registrar nueva recepción y actualizar stock)
exports.crearRecepcion = async (req, res) => {
  try {
    const { proveedor, empleado, productos, notas, estado } = req.body;
    if (!proveedor || !empleado || !productos?.length)
      return res.status(400).json({ success: false, error: 'Proveedor, empleado y productos son obligatorios' });

    // Verificar que existan proveedor y empleado
    const [prov, emp] = await Promise.all([
      Supplier.findById(proveedor),
      require('../models/Employee').findById(empleado)
    ]);
    if (!prov) return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
    if (!emp)  return res.status(404).json({ success: false, error: 'Empleado no encontrado' });

    // Crear la recepción
    const recepcion = await SupplierReceipt.create({ proveedor, empleado, productos, notas, estado });

    // Actualizar stock de cada producto recibido
    for (const item of productos) {
      await Product.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } });
    }

    await recepcion.populate('proveedor','empresa contacto');
    await recepcion.populate('empleado','nombre apellido puesto');

    res.status(201).json({ success: true, recepcion, mensaje: 'Recepción registrada y stock actualizado' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// GET /api/proveedores/recepciones/:id
exports.obtenerRecepcion = async (req, res) => {
  try {
    const r = await SupplierReceipt.findById(req.params.id)
      .populate('proveedor','empresa contacto telefono')
      .populate('empleado','nombre apellido puesto');
    if (!r) return res.status(404).json({ success: false, error: 'Recepción no encontrada' });
    res.json({ success: true, recepcion: r });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};
