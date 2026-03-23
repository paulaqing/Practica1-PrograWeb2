import { cartService } from '../services/cart.js';
import { authState } from './authStore.svelte.js';

export const cartState = $state({
    items: [],
    total: 0,
    loading: false,
    error: null,

    async loadCart() {
        if (!authState.isAuthenticated) {
            this.items = [];
            this.total = 0;
            this.loaded = false; // Reset loaded state
            return;
        }
        
        this.loading = true;
        this.error = null;
        try {
            const res = await cartService.getCart();
            this.items = res.cart || [];
            this.total = res.total || 0;
            this.loaded = true; // Set loaded to true on success
        } catch (err) {
            this.error = err.message || 'Error al cargar el carrito';
            console.error(err);
            this.loaded = false; // Keep loaded false on error
        } finally {
            this.loading = false;
        }
    },

    async addItem(productId, quantity = 1) {
        if (!authState.isAuthenticated) return;
        this.loading = true;
        try {
            await cartService.addToCart(productId, quantity);
            await this.loadCart(); // recargar para tener subtotales actualizados
        } catch (err) {
            this.error = err.message || 'Error al añadir al carrito';
            alert(this.error);
        } finally {
            this.loading = false;
        }
    },

    async updateItem(productId, quantity) {
        if (!authState.isAuthenticated) return;
        this.loading = true;
        try {
            await cartService.updateQuantity(productId, quantity);
            await this.loadCart();
        } catch (err) {
            this.error = err.message || 'Error al actualizar el carrito';
            alert(this.error);
        } finally {
            this.loading = false;
        }
    },

    async removeItem(productId) {
        if (!authState.isAuthenticated) return;
        this.loading = true;
        try {
            await cartService.removeFromCart(productId);
            await this.loadCart();
        } catch (err) {
            this.error = err.message || 'Error al eliminar del carrito';
            alert(this.error);
        } finally {
            this.loading = false;
        }
    },

    async clear() {
        if (!authState.isAuthenticated) return;
        this.loading = true;
        try {
            await cartService.clearCart();
            this.items = [];
            this.total = 0;
            this.loaded = false; // Reset loaded state after clearing
        } catch (err) {
            this.error = err.message || 'Error al vaciar el carrito';
            alert(this.error);
        } finally {
            this.loading = false;
        }
    },

    get totalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
});
