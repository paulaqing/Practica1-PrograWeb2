<script>
    import { onMount } from 'svelte';
    import { ordersService } from '../services/orders.js';
    import { authState } from '../store/authStore.svelte.js';
    import { router } from '../store/routerStore.svelte.js';

    let orders = $state([]);
    let loading = $state(true);
    let error = $state(null);
    let updatingId = $state(null);

    onMount(async () => {
        if (!authState.isAuthenticated) {
            router.navigate('/login');
            return;
        }
        await loadOrders();
    });

    async function loadOrders() {
        loading = true;
        error = null;
        try {
            if (authState.user?.role === 'admin') {
                orders = await ordersService.getAllOrders();
            } else {
                orders = await ordersService.getMyOrders();
            }
        } catch (err) {
            error = err.message || 'Error al cargar los pedidos';
        } finally {
            loading = false;
        }
    }

    async function handleStatusChange(orderId, newStatus) {
        updatingId = orderId;
        try {
            await ordersService.updateStatus(orderId, newStatus);
            // actualizar UI
            orders = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
        } catch (err) {
            alert(err.message || 'Error al actualizar el estado');
        } finally {
            updatingId = null;
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'Fecha desconocida';
        const d = new Date(dateString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
</script>

<div class="orders-container fade-in">
    <div class="header">
        <h2>📦 {authState.user?.role === 'admin' ? 'Gestión de Pedidos' : 'Mis Pedidos'}</h2>
        <button class="btn btn-primary" onclick={loadOrders} disabled={loading}>
            Actualizar
        </button>
    </div>

    {#if error}
        <div class="error-banner">{error}</div>
    {/if}

    {#if loading && orders.length === 0}
        <div class="loading-state">Cargando pedidos...</div>
    {:else if orders.length === 0}
        <div class="empty-state glass-panel">
            <div class="empty-icon">📦</div>
            <h3>No tienes pedidos todavía</h3>
            {#if authState.user?.role !== 'admin'}
                <p>¡Ve a la tienda y realiza tu primera compra!</p>
                <button class="btn btn-primary" onclick={() => router.navigate('/products')}>
                    Ir a la Tienda
                </button>
            {/if}
        </div>
    {:else}
        <div class="orders-list">
            {#each orders as order (order._id)}
                <div class="order-card glass-panel" class:completed={order.status === 'completed'}>
                    <div class="order-header">
                        <div class="order-info">
                            <span class="order-id">Pedido #{order._id.slice(-6).toUpperCase()}</span>
                            <span class="order-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div class="order-status-badge {order.status}">
                            {order.status === 'pending' ? '⏳ Pendiente' : '✅ Completado'}
                        </div>
                    </div>

                    {#if authState.user?.role === 'admin'}
                        <div class="order-user">
                            <strong>Usuario:</strong> {order.user?.username || 'Desconocido'}
                        </div>
                    {/if}

                    <div class="order-products">
                        <h4>Productos:</h4>
                        <ul>
                            {#each order.products as item}
                                <li>
                                    <span class="qty">{item.quantity}x</span> 
                                    {item.name} 
                                    <span class="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            {/each}
                        </ul>
                    </div>

                    <div class="order-footer">
                        <div class="total">
                            Total: <span>${order.total.toFixed(2)}</span>
                        </div>
                        
                        {#if authState.user?.role === 'admin'}
                            <div class="admin-actions">
                                <select 
                                    class="status-select" 
                                    value={order.status}
                                    disabled={updatingId === order._id}
                                    onchange={(e) => handleStatusChange(order._id, e.target.value)}
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="completed">Completado</option>
                                </select>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .orders-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .header h2 {
        color: var(--primary-color);
        font-size: 2rem;
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

    .orders-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .order-card {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
        border-left: 4px solid var(--primary-color);
    }

    .order-card.completed {
        border-left-color: #10b981;
    }

    .order-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .order-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .order-id {
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--text-color);
    }

    .order-date {
        font-size: 0.85rem;
        color: var(--text-muted);
    }

    .order-status-badge {
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .order-status-badge.pending {
        background: rgba(245, 158, 11, 0.2);
        color: #d97706;
    }

    .order-status-badge.completed {
        background: rgba(16, 185, 129, 0.2);
        color: #059669;
    }

    .order-user {
        background: rgba(0,0,0,0.05);
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    .order-products h4 {
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
    }

    .order-products ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .order-products li {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px dashed var(--border-color);
    }

    .order-products li:last-child {
        border-bottom: none;
    }

    .qty {
        font-weight: 700;
        color: var(--primary-color);
        margin-right: 0.75rem;
        min-width: 25px;
    }

    .item-price {
        margin-left: auto;
        font-weight: 600;
    }

    .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
        margin-top: 0.5rem;
    }

    .total {
        font-size: 1.1rem;
        font-weight: 600;
    }

    .total span {
        font-size: 1.4rem;
        color: var(--primary-color);
        margin-left: 0.5rem;
    }

    .status-select {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: rgba(255,255,255, 0.8);
        font-weight: 600;
        cursor: pointer;
    }
</style>
