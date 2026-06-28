const Cart = require('../models/Cart');

// Obtiene el carrito activo del usuario, o crea uno nuevo si no existe
const obtenerOCrearCarrito = async (usuarioId) => {
  let carrito = await Cart.findOne({ usuario: usuarioId, estado: 'activo' });
  if (!carrito) {
    carrito = await Cart.create({ usuario: usuarioId, productos: [] });
  }
  return carrito;
};

// GET /api/carrito
exports.obtenerCarrito = async (req, res) => {
  try {
    const carrito = await obtenerOCrearCarrito(req.usuario._id);
    res.json({ success: true, carrito });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ success: false, error: 'Error al obtener carrito' });
  }
};

// POST /api/carrito/agregar
exports.agregarProducto = async (req, res) => {
  try {
    const { productoId, nombre, precio, cantidad, imagen, categoria } = req.body;

    if (!productoId || !nombre || precio === undefined || !cantidad) {
      return res.status(400).json({ success: false, error: 'Faltan datos del producto' });
    }

    const carrito = await obtenerOCrearCarrito(req.usuario._id);
    const indice = carrito.productos.findIndex((p) => p.productoId === productoId);

    if (indice >= 0) {
      carrito.productos[indice].cantidad += parseInt(cantidad, 10);
    } else {
      carrito.productos.push({
        productoId,
        nombre,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad, 10),
        imagen: imagen || '',
        categoria: categoria || ''
      });
    }

    await carrito.save();
    res.json({ success: true, mensaje: 'Producto agregado al carrito', carrito });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ success: false, error: 'Error al agregar al carrito' });
  }
};

// PUT /api/carrito/actualizar/:productoId
exports.actualizarCantidad = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;

    if (cantidad === undefined || cantidad < 1) {
      return res.status(400).json({ success: false, error: 'Cantidad inválida' });
    }

    const carrito = await obtenerOCrearCarrito(req.usuario._id);
    const producto = carrito.productos.find((p) => p.productoId === productoId);

    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado en el carrito' });
    }

    producto.cantidad = parseInt(cantidad, 10);
    await carrito.save();

    res.json({ success: true, mensaje: 'Carrito actualizado', carrito });
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar carrito' });
  }
};

// DELETE /api/carrito/eliminar/:productoId
exports.eliminarProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const carrito = await obtenerOCrearCarrito(req.usuario._id);

    carrito.productos = carrito.productos.filter((p) => p.productoId !== productoId);
    await carrito.save();

    res.json({ success: true, mensaje: 'Producto eliminado', carrito });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar producto' });
  }
};

// DELETE /api/carrito/vaciar
exports.vaciarCarrito = async (req, res) => {
  try {
    const carrito = await obtenerOCrearCarrito(req.usuario._id);
    carrito.productos = [];
    await carrito.save();

    res.json({ success: true, mensaje: 'Carrito vaciado', carrito });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ success: false, error: 'Error al vaciar carrito' });
  }
};

// Se exporta para que paymentController pueda reutilizar la misma lógica
exports.obtenerOCrearCarrito = obtenerOCrearCarrito;
