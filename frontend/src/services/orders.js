import { api } from './api';

export const ordersService = {
  // REST: Obtener historial propio (usuarios)
  getMyOrders: async () => {
    return await api.get('/orders/my-orders');
  },

  // REST: Obtener todos los pedidos (admins)
  getAllOrders: async (statusFilter = '') => {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    return await api.get(`/orders${query}`);
  },

  // REST: Actualizar estado del pedido (admins)
  updateStatus: async (orderId, newStatus) => {
    return await api.put(`/orders/${orderId}/status`, { status: newStatus });
  },

  // GRAPHQL: Crear pedido desde el carrito
  createOrder: async (cartItems) => {
    // Transformar items de la cesta al formato de GraphQL: [{ productId, quantity }]
    const productsInput = cartItems.map(item => ({
      productId: item.product._id || item.product.id,
      quantity: item.quantity
    }));

    const query = `
      mutation CreateOrder($products: [OrderProductInput!]!) {
        createOrder(products: $products) {
          id
          total
          status
          createdAt
        }
      }
    `;

    const response = await api.post('/graphql', {
      query,
      variables: { products: productsInput }
    });

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message);
    }

    return response.data.createOrder;
  }
};
