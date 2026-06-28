require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User            = require('./models/User');
const Employee        = require('./models/Employee');
const Supplier        = require('./models/Supplier');
const Product         = require('./models/Product');
const SupplierReceipt = require('./models/SupplierReceipt');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/strawberry-kiss');
  console.log('✅ MongoDB conectado\n');

  // ── 1. Admin user ──────────────────────────────────────────
  let admin = await User.findOne({ email: 'admin@strawberrykiss.com' });
  if (!admin) {
    admin = await User.create({
      nombre: 'Administrador', email: 'admin@strawberrykiss.com',
      password: 'admin1234', rol: 'admin'
    });
    console.log('✅ Admin creado: admin@strawberrykiss.com / admin1234');
  } else { console.log('⏭  Admin ya existe'); }

  // ── 2. Proveedores ──────────────────────────────────────────
  const provData = [
    { empresa:'Harinas del Norte S.A.', contacto:'Juan Pérez',    email:'juan@harinasthenorte.mx', telefono:'5512345678', categorias:['harinas','azúcar'], estado:'activo'   },
    { empresa:'Lácteos La Vaca S.C.',   contacto:'María Gómez',   email:'maria@lacteos.mx',         telefono:'5587654321', categorias:['lácteos','mantequilla'], estado:'activo' },
    { empresa:'Frutas Frescas MX',      contacto:'Carlos López',  email:'carlos@frutas.mx',         telefono:'5598765432', categorias:['frutas','mermeladas'], estado:'activo'  },
    { empresa:'Chocolates Premium',     contacto:'Ana Rodríguez', email:'ana@chocopremium.mx',      telefono:'5511112222', categorias:['chocolate','cacao'], estado:'activo'    },
  ];
  const proveedores = [];
  for (const d of provData) {
    let p = await Supplier.findOne({ empresa: d.empresa });
    if (!p) { p = await Supplier.create(d); console.log(`✅ Proveedor: ${d.empresa}`); }
    else { console.log(`⏭  Proveedor ya existe: ${d.empresa}`); }
    proveedores.push(p);
  }

  // ── 3. Empleados ────────────────────────────────────────────
  const empData = [
    { nombre:'Sofía',   apellido:'Martínez', email:'sofia@sk.mx',   telefono:'5511111111', puesto:'Cajera',     turno:'matutino',    salario:8500,  estado:'activo' },
    { nombre:'Luis',    apellido:'García',   email:'luis@sk.mx',    telefono:'5522222222', puesto:'Panadero',   turno:'matutino',    salario:10000, estado:'activo' },
    { nombre:'Valeria', apellido:'Torres',   email:'vale@sk.mx',    telefono:'5533333333', puesto:'Decoradora', turno:'vespertino',  salario:9500,  estado:'activo' },
    { nombre:'Rodrigo', apellido:'Sánchez',  email:'rodrigo@sk.mx', telefono:'5544444444', puesto:'Repartidor', turno:'completo',    salario:8000,  estado:'activo' },
  ];
  const empleados = [];
  for (const d of empData) {
    let e = await Employee.findOne({ email: d.email });
    if (!e) { e = await Employee.create(d); console.log(`✅ Empleado: ${d.nombre} ${d.apellido}`); }
    else { console.log(`⏭  Empleado ya existe: ${d.nombre}`); }
    empleados.push(e);
  }

  // ── 4. Productos con stock ────────────────────────────────────
  const prodData = [
    { productoId:'frambuesa',  nombre:'Pastel de Frambuesa',  precio:350, emoji:'🍓', categoria:'pasteles',  stock:12, stockMinimo:3,  proveedor: proveedores[2]._id },
    { productoId:'limon',      nombre:'Pain de Limón',        precio:180, emoji:'🍋', categoria:'panaderia', stock:20, stockMinimo:5,  proveedor: proveedores[0]._id },
    { productoId:'redvelvet',  nombre:'Pastel Red Velvet',    precio:420, emoji:'🎂', categoria:'pasteles',  stock:8,  stockMinimo:3,  proveedor: proveedores[1]._id },
    { productoId:'cheesecake', nombre:'Cheesecake de Fresa',  precio:280, emoji:'🍰', categoria:'pasteles',  stock:2,  stockMinimo:4,  proveedor: proveedores[2]._id },
    { productoId:'galletas',   nombre:'Galletas Artesanales', precio:120, emoji:'🍪', categoria:'galletas',  stock:35, stockMinimo:10, proveedor: proveedores[0]._id },
    { productoId:'brownie',    nombre:'Brownie de Chocolate', precio:90,  emoji:'🍫', categoria:'galletas',  stock:18, stockMinimo:8,  proveedor: proveedores[3]._id },
    { productoId:'cupcakes',   nombre:'Cupcakes de Fresa',    precio:150, emoji:'🧁', categoria:'pasteles',  stock:3,  stockMinimo:6,  proveedor: proveedores[2]._id },
    { productoId:'panque',     nombre:'Panqué de Naranja',    precio:160, emoji:'🍊', categoria:'panaderia', stock:14, stockMinimo:5,  proveedor: proveedores[0]._id },
    { productoId:'gelatina',   nombre:'Gelatina de Mosaico',  precio:100, emoji:'🟣', categoria:'gelatinas', stock:22, stockMinimo:8,  proveedor: proveedores[1]._id },
    { productoId:'tresleches', nombre:'Pastel Tres Leches',   precio:380, emoji:'🥛', categoria:'pasteles',  stock:0,  stockMinimo:3,  proveedor: proveedores[1]._id },
  ];
  const productos = [];
  for (const d of prodData) {
    let p = await Product.findOne({ productoId: d.productoId });
    if (!p) { p = await Product.create(d); console.log(`✅ Producto: ${d.nombre} (stock:${d.stock})`); }
    else { console.log(`⏭  Producto ya existe: ${d.nombre}`); }
    productos.push(p);
  }

  // ── 5. Recepciones de ejemplo ────────────────────────────────
  const recCount = await SupplierReceipt.countDocuments();
  if (recCount === 0) {
    await SupplierReceipt.create([
      {
        proveedor: proveedores[0]._id, empleado: empleados[1]._id,
        productos: [
          { producto: productos[1]._id, nombre:'Pain de Limón', cantidad:10, unidad:'pieza' },
          { producto: productos[4]._id, nombre:'Galletas Artesanales', cantidad:20, unidad:'caja' }
        ],
        notas: 'Entrega completa, sin incidencias', estado: 'recibido'
      },
      {
        proveedor: proveedores[2]._id, empleado: empleados[0]._id,
        productos: [
          { producto: productos[0]._id, nombre:'Pastel de Frambuesa', cantidad:5, unidad:'pieza' },
          { producto: productos[3]._id, nombre:'Cheesecake de Fresa', cantidad:3, unidad:'pieza' }
        ],
        notas: 'Faltaron 2 unidades de cheesecake', estado: 'con_incidencia'
      }
    ]);
    console.log('✅ Recepciones de ejemplo creadas');
  } else { console.log('⏭  Recepciones ya existen'); }

  console.log('\n🎉 Seed completado!\n');
  console.log('   👤 Admin: admin@strawberrykiss.com / admin1234');
  console.log('   🌐 Panel: http://localhost:3000/admin.html\n');
  await mongoose.disconnect();
}

main().catch(err => { console.error('❌', err); process.exit(1); });
