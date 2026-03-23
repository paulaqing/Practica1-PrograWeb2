import { api } from './api';

export const cartService = {
    getCart: async () => {
        return await api.get('/cart');
    },

    addToCart: async (productId, quantity = 1) => {
        return await api.post('/cart/add', { productId, quantity });
    },

    updateQuantity: async (productId, quantity) => {
        return await api.put('/cart/update', { productId, quantity });
    },

    removeFromCart: async (productId) => {
        return await api.delete(`/cart/remove/${productId}`);
    },

    clearCart: async () => {
        return await api.delete('/cart/clear');
    }
};
