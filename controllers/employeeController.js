const Employee        = require('../models/Employee');
const SupplierReceipt = require('../models/SupplierReceipt');

// GET /api/empleados
exports.listar = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado) filtro.estado = req.query.estado;
    const empleados = await Employee.find(filtro).sort({ nombre: 1 });
    res.json({ success: true, empleados });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// GET /api/empleados/:id
exports.obtener = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
    res.json({ success: true, empleado: emp });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// POST /api/empleados
exports.crear = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, puesto, turno, salario, fechaIngreso, notas } = req.body;
    if (!nombre || !apellido || !email || !puesto)
      return res.status(400).json({ success: false, error: 'Nombre, apellido, email y puesto son obligatorios' });
    const existente = await Employee.findOne({ email: email.toLowerCase() });
    if (existente) return res.status(400).json({ success: false, error: 'Ya existe un empleado con ese email' });
    const emp = await Employee.create({ nombre, apellido, email, telefono, puesto, turno, salario, fechaIngreso, notas });
    res.status(201).json({ success: true, empleado: emp });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// PUT /api/empleados/:id
exports.actualizar = async (req, res) => {
  try {
    const campos = ['nombre','apellido','email','telefono','puesto','turno','salario','estado','notas'];
    const datos = {};
    campos.forEach(c => { if (req.body[c] !== undefined) datos[c] = req.body[c]; });
    const emp = await Employee.findByIdAndUpdate(req.params.id, datos, { new: true, runValidators: true });
    if (!emp) return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
    res.json({ success: true, empleado: emp });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// DELETE /api/empleados/:id
exports.eliminar = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, { estado: 'baja' }, { new: true });
    if (!emp) return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
    res.json({ success: true, mensaje: 'Empleado dado de baja', empleado: emp });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// GET /api/empleados/:id/recepciones – recepciones que atendió este empleado
exports.recepciones = async (req, res) => {
  try {
    const recs = await SupplierReceipt.find({ empleado: req.params.id })
      .populate('proveedor', 'empresa contacto')
      .sort({ createdAt: -1 });
    res.json({ success: true, recepciones: recs });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};
