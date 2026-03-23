<script>
    let { product, onClose, onAddToCart } = $props();

    function handleBackdropClick() {
        onClose();
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="modal-backdrop fade-in" onclick={handleBackdropClick}>
    <div class="modal-details glass-panel" onclick={(e) => e.stopPropagation()}>
        <button class="btn-close" onclick={onClose}>&times;</button>
        
        <div class="detail-content">
            <div class="detail-image-wrapper">
                {#if product.image}
                    <img src={`/api${product.image}`} alt={product.name} class="detail-image" />
                {:else}
                    <div class="detail-placeholder">🛍️</div>
                {/if}
            </div>
            
            <div class="detail-info">
                <h2>{product.name}</h2>
                <p class="detail-price">${Number(product.price).toFixed(2)}</p>
                <div class="badges">
                    <span class="badge {product.stock > 0 ? 'badge-active' : 'badge-inactive'}">
                        {product.stock > 0 ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                    <span class="badge badge-stock">
                        📦 Stock: {product.stock || 0}
                    </span>
                </div>
                
                <div class="detail-desc">
                    <h3>Descripción</h3>
                    <p>{product.description || "No hay descripción disponible para este producto."}</p>
                </div>

                <div class="detail-actions">
                    <button 
                        class="btn btn-primary w-full btn-large" 
                        onclick={() => { onAddToCart(product); onClose(); }}
                        disabled={product.stock <= 0}>
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
        padding: 1rem;
        backdrop-filter: blur(4px);
    }

    .modal-details {
        position: relative;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2.5rem;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.2);
    }

    .btn-close {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: var(--text-color);
        opacity: 0.6;
        transition: opacity 0.2s;
    }

    .btn-close:hover {
        opacity: 1;
        color: var(--primary-color);
    }

    .detail-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem;
        align-items: start;
    }

    .detail-image-wrapper {
        border-radius: 12px;
        overflow: hidden;
        background: rgba(0,0,0,0.03);
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
    }

    .detail-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .detail-placeholder {
        font-size: 5rem;
    }

    .detail-info {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .detail-info h2 {
        font-size: 2.2rem;
        color: var(--text-color);
        margin-bottom: 0.5rem;
        line-height: 1.2;
    }

    .detail-price {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 1.5rem;
    }

    .badges {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .badge {
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
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
        background: rgba(0, 0, 0, 0.08);
        color: var(--text-color);
    }

    .detail-desc {
        flex: 1;
    }

    .detail-desc h3 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .detail-desc p {
        color: var(--text-color);
        line-height: 1.6;
        font-size: 1.05rem;
    }

    .detail-actions {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
    }

    .btn-large {
        padding: 1.2rem;
        font-size: 1.1rem;
        border-radius: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    @media (max-width: 768px) {
        .detail-content {
            grid-template-columns: 1fr;
        }
        
        .modal-details {
            padding: 1.5rem;
        }

        .btn-close {
            top: 0.5rem;
            right: 1rem;
        }
    }
</style>
