<script>
    import { onMount } from "svelte";
    import { productsService } from "../services/products";
    import ProductCard from "../components/ProductCard.svelte";
    import ProductForm from "../components/ProductForm.svelte";
    import ProductDetailModal from "../components/ProductDetailModal.svelte"; // New import
    import { authState } from "../store/authStore.svelte.js";
    import { cartState } from "../store/cartStore.svelte.js"; // New import

    let products = $state([]);
    let loading = $state(true);
    let error = $state(null);

    let isFormOpen = $state(false); // Renamed from showModal
    let editingProduct = $state(null);
    let detailProduct = $state(null); // New state for product detail modal

    async function loadProducts() {
        try {
            loading = true;
            const res = await productsService.getAll();
            products = res.data || res;
        } catch (err) {
            error = err.message || "Error al cargar productos";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadProducts();
    });

    function handleCreate() {
        editingProduct = null;
        isFormOpen = true; // Use isFormOpen
    }

    function handleEdit(product) {
        editingProduct = product;
        isFormOpen = true; // Use isFormOpen
    }

    async function handleDelete(id) {
        if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
        try {
            await productsService.delete(id);
            products = products.filter((p) => p._id !== id);
        } catch (err) {
            alert(err.message || "Error al eliminar");
        }
    }

    async function handleSave(productData) {
        try {
            if (editingProduct) {
                const res = await productsService.update(
                    editingProduct._id,
                    productData,
                );
                const updated = res.data || res;
                products = products.map((p) =>
                    p._id === updated._id ? updated : p,
                );
            } else {
                const res = await productsService.create(productData);
                const created = res.data || res;
                products = [...products, created];
            }
            isFormOpen = false; // Use isFormOpen
        } catch (err) {
            alert(err.message || "Error al guardar");
        }
    }

    // New functions for product detail modal and cart
    function viewDetail(product) {
        detailProduct = product;
    }

    function closeDetail() {
        detailProduct = null;
    }

    async function handleAddToCart(product) {
        if (product.stock <= 0) {
            alert("El producto no está disponible para su compra.");
            return;
        }
        await cartState.addItem(product._id || product.id, 1);
        alert("¡Producto añadido al carrito!");
    }
</script>

<div class="container fade-in">
    <div class="header-action">
        <div>
            <h1>Catálogo de Productos</h1>
            <p class="subtitle">
                Gestiona y visualiza tu inventario en tiempo real
            </p>
        </div>
        {#if authState.user?.role === "admin"}
            <button class="btn btn-primary" onclick={handleCreate}>
                + Nuevo Producto
            </button>
        {/if}
    </div>

    {#if error}
        <div class="error-message">
            {error}
            <button class="btn btn-sm" onclick={loadProducts}>Reintentar</button
            >
        </div>
    {/if}

    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando catálogo...</p>
        </div>
    {:else if products.length === 0}
        <div class="empty-state glass-panel">
            <h2>No hay productos</h2>
            <p>Comienza añadiendo tu primer producto al catálogo.</p>
        </div>
    {:else}
        <div class="products-grid">
            {#each products as product (product._id)}
                <ProductCard
                    {product}
                    onEdit={() => handleEdit(product)}
                    onDelete={() => handleDelete(product._id)}
                    onClick={() => viewDetail(product)}
                />
            {/each}
        </div>
    {/if}
</div>

{#if isFormOpen}
    <ProductForm
        product={editingProduct}
        onSave={handleSave}
        onCancel={() => (isFormOpen = false)}
    />
{/if}

{#if detailProduct}
    <ProductDetailModal
        product={detailProduct}
        onClose={closeDetail}
        onAddToCart={handleAddToCart}
    />
{/if}

<style>
    .fade-in {
        animation: fadeIn 0.4s ease-out;
    }

    .header-action {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, var(--text-color), var(--primary-color));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .subtitle {
        color: var(--text-muted);
        font-size: 1.1rem;
    }

    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5rem 0;
        color: var(--text-muted);
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
    }

    .empty-state h2 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .empty-state p {
        color: var(--text-muted);
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        .header-action {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
        }

        h1 {
            font-size: 2rem;
        }
    }
</style>
