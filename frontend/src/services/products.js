import { api } from './api';
import { authState } from '../store/authStore.svelte.js';
export const productsService = {
    getAll: async () => {
        return await api.get('/products');
    },

    getById: async (id) => {
        return await api.get(`/products/${id}`);
    },

    create: async (formData) => {
        const token = authState.token;
        const res = await fetch('/api/products', {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Error al crear producto');
        return await res.json();
    },

    update: async (id, formData) => {
        const token = authState.token;
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Error al actualizar producto');
        return await res.json();
    },

    delete: async (id) => {
        return await api.delete(`/products/${id}`);
    }
};
