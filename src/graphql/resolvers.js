const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const rootResolver = {
  // ========== QUERIES ==========
  
  // Productos
  products: async () => {
    return await Product.find().sort({ createdAt: -1 });
  },

  product: async ({ id }) => {
    return await Product.findById(id);
  },

  // Pedidos
  orders: async (args, context) => {
    if (!context.user || context.user.role !== 'admin') {
      throw new Error('No autorizado');
    }
    return await Order.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 });
  },

  order: async ({ id }, context) => {
    const order = await Order.findById(id).populate('user', 'username');
    
    if (!context.user) throw new Error('No autenticado');
    if (context.user.role !== 'admin' && order.user._id.toString() !== context.user.id) {
      throw new Error('No autorizado');
    }
    
    return order;
  },

  myOrders: async (args, context) => {
    if (!context.user) throw new Error('No autenticado');
    return await Order.find({ user: context.user.id })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
  },

  // Usuarios
  users: async (args, context) => {
    if (!context.user || context.user.role !== 'admin') {
      throw new Error('No autorizado');
    }
    const users = await User.find().select('-password');
    return users.map(u => ({
      id: u._id.toString(),
      username: u.username,
      role: u.role,
      createdAt: u.createdAt?.toISOString()
    }));
  },

  user: async ({ id }, context) => {
    if (!context.user || context.user.role !== 'admin') {
      throw new Error('No autorizado');
    }
    const user = await User.findById(id).select('-password');
    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      createdAt: user.createdAt?.toISOString()
    };
  },

  // ========== MUTATIONS ==========

  // Crear pedido
  createOrder: async ({ products }, context) => {
    if (!context.user) throw new Error('No autenticado');

    // Buscar el usuario completo para obtener su ObjectId
    const user = await User.findOne({ username: context.user.username });
    if (!user) throw new Error('Usuario no encontrado');

    const orderProducts = [];
    let total = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      orderProducts.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const order = new Order({
      user: user._id,
      products: orderProducts,
      total,
      status: 'pending'
    });

    await order.save();
    return await Order.findById(order._id).populate('user', 'username');
  },

  // Actualizar estado de pedido
  updateOrderStatus: async ({ id, status }, context) => {
    if (!context.user || context.user.role !== 'admin') {
      throw new Error('No autorizado');
    }

    if (!['pending', 'completed'].includes(status)) {
      throw new Error('Estado inválido');
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'username');

    if (!order) throw new Error('Pedido no encontrado');
    return order;
  },

  // Eliminar usuario
  deleteUser: async ({ id }, context) => {
    if (!context.user || context.user.role !== 'admin') {
      throw new Error('No autorizado');
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    return { success: true, message: 'Usuario eliminado correctamente' };
  },

  // Cambiar rol de usuario
  updateUserRole: async ({ id, role }, context) => {
    if (!context.user || context.user.role !== 'admin') {
      throw new Error('No autorizado');
    }

    if (!['user', 'admin'].includes(role)) {
      throw new Error('Rol inválido');
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) throw new Error('Usuario no encontrado');
    
    return {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt?.toISOString()
    };
  }
};

module.exports = rootResolver;