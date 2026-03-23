<script>
    import { cartState } from '../store/cartStore.svelte.js';
    import { router } from '../store/routerStore.svelte.js';
    import { ordersService } from '../services/orders.js';
    import { toastState } from '../store/toastStore.svelte.js';

    let checkingOut = $state(false);

    async function handleUpdateQuantity(productId, newQty) {
        if (newQty < 1) return;
        await cartState.updateItem(productId, newQty);
    }

    async function handleRemove(productId) {
        if (confirm("¿Eliminar este producto del carrito?")) {
            await cartState.removeItem(productId);
        }
    }

    async function handleClear() {
        if (confirm("¿Seguro que quieres vaciar el carrito?")) {
            await cartState.clear();
        }
    }

    async function handleCheckout() {
        if (items.length === 0) return;
        checkingOut = true;
        try {
            await ordersService.createOrder(items);
            await cartState.clear();
            toastState.add("¡Pedido completado con éxito!", "success");
            router.navigate('/orders');
        } catch (err) {
            toastState.add(err.message || 'Error al procesar la compra', 'error');
        } finally {
            checkingOut = false;
        }
    }

    let items = $derived(cartState.items);
    let total = $derived(cartState.total);
</script>

<div class="cart-container fade-in">
    <div class="cart-header">
        <h2>🛒 Mi Carrito</h2>
        {#if items.length > 0}
            <button class="btn btn-delete btn-sm" onclick={handleClear} disabled={cartState.loading}>
                Vaciar Carrito
            </button>
        {/if}
    </div>

    {#if cartState.error}
        <div class="error-banner">{cartState.error}</div>
    {/if}

    {#if cartState.loading && items.length === 0}
        <div class="loading-state">Cargando carrito...</div>
    {:else if items.length === 0}
        <div class="empty-state glass-panel">
            <div class="empty-icon">🛒</div>
            <h3>Tu carrito está vacío</h3>
            <p>¡Explora nuestros productos y añade algo increíble!</p>
            <button class="btn btn-primary" onclick={() => router.navigate('/products')}>
                Ver Productos
            </button>
        </div>
    {:else}
        <div class="cart-content">
            <div class="cart-items">
                {#each items as item (item.product._id)}
                    <div class="cart-item glass-panel">
                        <div class="item-image">
                            {#if item.product.image}
                                <img src={`/api${item.product.image}`} alt={item.product.name} />
                            {:else}
                                <div class="placeholder-img">🛍️</div>
                            {/if}
                        </div>
                        <div class="item-details">
                            <h3>{item.product.name}</h3>
                            <p class="price">{item.product.price.toFixed(2)} €</p>
                        </div>
                        <div class="item-actions">
                            <div class="qty-controls">
                                <button 
                                    class="btn-qty" 
                                    onclick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || cartState.loading}>
                                    -
                                </button>
                                <span class="qty-display">{item.quantity}</span>
                                <button 
                                    class="btn-qty" 
                                    onclick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                    disabled={item.quantity >= item.product.stock || cartState.loading}>
                                    +
                                </button>
                            </div>
                            <button 
                                class="btn-remove" 
                                onclick={() => handleRemove(item.product._id)}
                                disabled={cartState.loading}
                                aria-label="Eliminar producto"
                            >
                                🗑️
                            </button>
                        </div>
                        <div class="item-subtotal">
                            {(item.product.price * item.quantity).toFixed(2)} €
                        </div>
                    </div>
                {/each}
            </div>

            <div class="cart-summary glass-panel">
                <h3>Resumen de Compra</h3>
                <div class="summary-row">
                    <span>Productos ({cartState.totalItems})</span>
                    <span>{total.toFixed(2)} €</span>
                </div>
                <!-- Aquí podrías añadir envío o impuestos después -->
                <div class="summary-total">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                </div>
                <button 
                    class="btn btn-primary btn-checkout" 
                    onclick={handleCheckout}
                    disabled={cartState.loading || checkingOut}>
                    {checkingOut ? 'Procesando...' : 'Finalizar Compra'}
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .cart-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
    }

    .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .cart-header h2 {
        color: var(--primary-color);
        font-size: 2rem;
    }

    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }

    .empty-icon {
        font-size: 4rem;
        opacity: 0.5;
    }

    .empty-state p {
        color: var(--text-muted);
        font-size: 1.1rem;
    }

    .cart-content {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 2rem;
        align-items: start;
    }

    .cart-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .cart-item {
        display: grid;
        grid-template-columns: 80px 1fr auto auto;
        gap: 1.5rem;
        align-items: center;
        padding: 1rem 1.5rem;
    }

    .item-image {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(0,0,0,0.05);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .placeholder-img {
        font-size: 2rem;
    }

    .item-details h3 {
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
        color: var(--text-color);
    }

    .item-details .price {
        color: var(--primary-color);
        font-weight: 600;
    }

    .item-actions {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .qty-controls {
        display: flex;
        align-items: center;
        background: rgba(255,255,255,0.5);
        border-radius: 999px;
        padding: 0.25rem;
        border: 1px solid var(--border-color);
    }

    .btn-qty {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: none;
        background: white;
        color: var(--text-color);
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .btn-qty:hover:not(:disabled) {
        background: var(--primary-color);
        color: white;
    }

    .btn-qty:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .qty-display {
        min-width: 30px;
        text-align: center;
        font-weight: 600;
    }

    .btn-remove {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.5rem;
        border-radius: 8px;
        transition: background 0.2s;
        opacity: 0.7;
    }

    .btn-remove:hover:not(:disabled) {
        background: #fee2e2;
        opacity: 1;
    }

    .item-subtotal {
        font-weight: 700;
        font-size: 1.1rem;
        min-width: 80px;
        text-align: right;
    }

    .cart-summary {
        padding: 1.5rem;
        position: sticky;
        top: 100px;
    }

    .cart-summary h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        color: var(--text-color);
    }

    .summary-total {
        display: flex;
        justify-content: space-between;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 2px solid var(--border-color);
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--primary-color);
        margin-bottom: 2rem;
    }

    .btn-checkout {
        width: 100%;
        padding: 1rem;
        font-size: 1.1rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }

    .error-banner {
        background: #fee2e2;
        border-left: 4px solid #ef4444;
        color: #b91c1c;
        padding: 1rem;
        border-radius: 0 8px 8px 0;
        margin-bottom: 1.5rem;
    }

    @media (max-width: 900px) {
        .cart-content {
            grid-template-columns: 1fr;
        }
        
        .cart-item {
            grid-template-columns: 60px 1fr auto;
            grid-template-rows: auto auto;
        }
        
        .item-subtotal {
            grid-column: 1 / -1;
            text-align: left;
            padding-top: 1rem;
            border-top: 1px dashed var(--border-color);
        }
    }
</style>
