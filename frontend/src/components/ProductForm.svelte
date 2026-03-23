<script>
    let { product = null, onSave, onCancel } = $props();

    let formData = $state({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price || 0,
        stock: product?.stock || 0
    });

    let imageFile = $state(null);
    let loading = $state(false);

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        try {
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("description", formData.description);
            submitData.append("price", formData.price);
            submitData.append("stock", formData.stock);
            if (imageFile) {
                submitData.append("image", imageFile);
            }
            await onSave(submitData);
        } finally {
            loading = false;
        }
    }
</script>

<div class="modal-backdrop" onclick={onCancel}>
    <div class="glass-panel modal-content" onclick={(e) => e.stopPropagation()}>
        <h2>{product ? "Editar Producto" : "Nuevo Producto"}</h2>

        <form onsubmit={handleSubmit}>
            <div class="input-group">
                <label for="name">Nombre</label>
                <input
                    id="name"
                    type="text"
                    bind:value={formData.name}
                    required
                />
            </div>

            <div class="input-group">
                <label for="desc">Descripción</label>
                <textarea id="desc" rows="3" bind:value={formData.description}
                ></textarea>
            </div>

            <div class="row">
                <div class="input-group">
                    <label for="price">Precio ($)</label>
                    <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        bind:value={formData.price}
                        required
                    />
                </div>
                <div class="input-group">
                    <label for="stock">Stock</label>
                    <input
                        id="stock"
                        type="number"
                        min="0"
                        bind:value={formData.stock}
                        required
                    />
                </div>
            </div>

            <div class="input-group">
                <label for="image">Imagen del Producto</label>
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onchange={(e) => (imageFile = e.target.files[0])}
                />
                {#if product?.image}
                    <small
                        style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.2rem; display: block;"
                    >
                        Imagen actual: {product.image}
                    </small>
                {/if}
            </div>

            <div class="actions">
                <button
                    type="button"
                    class="btn btn-cancel"
                    onclick={onCancel}
                    disabled={loading}>Cancelar</button
                >
                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Guardando..." : "Guardar"}
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        width: 100%;
        max-width: 500px;
        padding: 2rem;
        animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    h2 {
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        color: var(--text-color);
    }

    .input-group {
        margin-bottom: 1.25rem;
    }

    .input-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-muted);
    }

    .row {
        display: flex;
        gap: 1rem;
    }

    .row .input-group {
        flex: 1;
    }

    .checkbox-group {
        margin-bottom: 1.5rem;
    }

    .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.95rem;
    }

    .checkbox-group input {
        width: auto;
        accent-color: var(--primary-color);
        transform: scale(1.2);
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
    }

    .btn-cancel {
        background: transparent;
        color: var(--text-gray);
        border: 1px solid var(--border-color);
    }

    .btn-cancel:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>
