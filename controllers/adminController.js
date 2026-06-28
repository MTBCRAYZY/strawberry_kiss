const User            = require('../models/User');
const Employee        = require('../models/Employee');
const Supplier        = require('../models/Supplier');
const Product         = require('../models/Product');
const Order           = require('../models/Order');
const SupplierReceipt = require('../models/SupplierReceipt');

// GET /api/admin/dashboard
exports.dashboard = async (req, res) => {
  try {
    const [
      totalUsuarios,
      totalEmpleados,
      empleadosActivos,
      totalProveedores,
      proveedoresActivos,
      totalProductos,
      productosStockBajo,
      totalOrdenes,
      ordenesHoy,
      ultimasRecepciones,
      ultimasOrdenes
    ] = await Promise.all([
      User.countDocuments(),
      Employee.countDocuments(),
      Employee.countDocuments({ estado: 'activo' }),
      Supplier.countDocuments(),
      Supplier.countDocuments({ estado: 'activo' }),
      Product.countDocuments({ activo: true }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$stockMinimo'] }, activo: true }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      SupplierReceipt.find()
        .sort({ createdAt: -1 }).limit(5)
        .populate('proveedor','empresa')
        .populate('empleado','nombre apellido'),
      Order.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Ingresos del mes actual
    const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0,0,0,0);
    const ingresosMes = await Order.aggregate([
      { $match: { estado_pago: 'completado', createdAt: { $gte: inicioMes } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      success: true,
      stats: {
        usuarios: totalUsuarios,
        empleados: { total: totalEmpleados, activos: empleadosActivos },
        proveedores: { total: totalProveedores, activos: proveedoresActivos },
        productos: { total: totalProductos, stockBajo: productosStockBajo },
        ordenes: { total: totalOrdenes, hoy: ordenesHoy },
        ingresosMes: ingresosMes[0]?.total || 0
      },
      ultimasRecepciones,
      ultimasOrdenes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener dashboard' });
  }
};
