<script>
    import { authState } from "../store/authStore.svelte.js";
    import { cartState } from "../store/cartStore.svelte.js";

    let { product, onEdit, onDelete, onClick } = $props();

    let adding = $state(false);

    async function handleAddToCart() {
        adding = true;
        await cartState.addItem(product._id, 1);
        adding = false;
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="glass-panel product-card fade-in" onclick={() => onClick && onClick()}>
    {#if product.image}
        <div class="image-container">
            <img src={`/api${product.image}`} alt={product.name} />
        </div>
    {:else}
        <div class="image-placeholder">Sin imagen</div>
    {/if}
    <div class="product-content">
        <div class="product-info">
            <h3>{product.name}</h3>
            {#if product.description}
                <p class="description">{product.description}</p>
            {/if}
            <div class="card-meta">
                <span class="price">${Number(product.price).toFixed(2)}</span>
                <div class="badges">
                    <span class="badge {product.stock > 0 ? 'badge-active' : 'badge-inactive'}">
                        {product.stock > 0 ? 'Activo' : 'Inactivo'}
                    </span>
                    <span class="badge badge-stock">Stock: {product.stock || 0}</span>
                </div>
            </div>
        </div>

        <div class="product-actions" onclick={(e) => e.stopPropagation()}>
            {#if authState.isAuthenticated}
                <button
                    class="btn btn-primary w-full"
                    onclick={handleAddToCart}
                    disabled={adding || product.stock <= 0}>
                    {adding ? "Añadiendo..." : "Añadir al Carrito"}
                </button>
            {/if}
            {#if authState.user?.role === 'admin'}
                <div class="admin-actions">
                    <button class="btn btn-edit" onclick={(e) => { e.stopPropagation(); onEdit(product); }}
                        >Editar</button
                    >
                    <button class="btn btn-delete" onclick={(e) => { e.stopPropagation(); onDelete(product._id); }}
                        >Borrar</button
                    >
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .product-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 1.5rem;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        height: 100%;
        cursor: pointer; /* Indicate clickable */
    }

    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }

    .image-container {
        width: calc(100% + 3rem);
        height: 180px;
        margin: -1.5rem -1.5rem 1rem -1.5rem;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.2);
    }

    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .product-card:hover .image-container img {
        transform: scale(1.05);
    }

    .image-placeholder {
        width: calc(100% + 3rem);
        height: 180px;
        margin: -1.5rem -1.5rem 1rem -1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);
        color: var(--text-muted);
        font-size: 0.9rem;
        font-style: italic;
    }

    .product-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        justify-content: space-between;
    }

    .product-info {
        margin-bottom: 1.5rem;
        flex-grow: 1;
    }

    .product-info h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
        line-height: 1.4;
    }

    .description {
        color: var(--text-muted);
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .card-meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 0.75rem 1rem;
        border-radius: 8px;
    }

    .badges {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .badge {
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
        border-radius: 999px;
        font-weight: 600;
        white-space: nowrap;
    }

    .badge-active {
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
    }

    .badge-inactive {
        background: rgba(239, 68, 68, 0.15);
        color: #b91c1c;
    }

    .badge-stock {
        background: rgba(0, 0, 0, 0.05);
        color: var(--text-color);
        border: 1px solid var(--border-color);
    }

    .price {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--primary-color);
    }

    .product-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: auto;
        flex-wrap: wrap;
    }

    .btn {
        flex: 1;
        padding: 0.6rem;
        font-size: 0.9rem;
        min-width: fit-content;
    }

    .btn-cart {
        flex-basis: 100%;
        margin-bottom: 0.5rem;
    }

    .btn-edit {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-color);
    }

    .btn-edit:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-delete {
        background: transparent;
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: var(--danger-color);
    }

    .btn-delete:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: var(--danger-color);
    }
</style>
