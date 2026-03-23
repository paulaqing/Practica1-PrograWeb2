<script>
    import { onMount } from "svelte";
    import { productsService } from "../services/products";
    import ProductCard from "../components/ProductCard.svelte";
    import ProductForm from "../components/ProductForm.svelte";
    import ProductDetailModal from "../components/ProductDetailModal.svelte"; // New import
    import { authState } from "../store/authStore.svelte.js";
    import { cartState } from "../store/cartStore.svelte.js"; // New import
    import { toastState } from "../store/toastStore.svelte.js";

    let allProducts = $state([]);
    let searchQuery = $state("");
    let minPrice = $state(null);
    let maxPrice = $state(null);
    let currentPage = $state(1);
    let itemsPerPage = 8;
    
    let loading = $state(true);
    let error = $state(null);

    let isFormOpen = $state(false); // Renamed from showModal
    let editingProduct = $state(null);
    let detailProduct = $state(null); // New state for product detail modal

    async function loadProducts() {
        try {
            loading = true;
            const res = await productsService.getAll();
            allProducts = res.data || res;
        } catch (err) {
            error = err.message || "Error al cargar productos";
        } finally {
            loading = false;
        }
    }

    let activeRole = $derived(authState.user?.role);
    
    // Uso de $derived() para computar la lista filtrada de productos, se actualiza automáticamente si cambia algún state implicado
    let products = $derived(
        allProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMin = minPrice === null || minPrice === '' || p.price >= minPrice;
            const matchesMax = maxPrice === null || maxPrice === '' || p.price <= maxPrice;
            return matchesSearch && matchesMin && matchesMax;
        })
    );

    // Reiniciar página a la primera si cambian los resultados aplicados del filtro
    $effect(() => {
        searchQuery; minPrice; maxPrice; // dependencias
        currentPage = 1;
    });

    let totalPages = $derived(Math.max(1, Math.ceil(products.length / itemsPerPage)));
    let paginatedProducts = $derived(products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));

    // Uso de $effect() para recargar datos cuando cambia un filtro importante o rol
    $effect(() => {
        const role = activeRole; // Leemos la dependencia para suscribirnos
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
            allProducts = allProducts.filter((p) => p._id !== id);
            toastState.add("Producto eliminado correctamente", "success");
        } catch (err) {
            toastState.add(err.message || "Error al eliminar", "error");
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
                allProducts = allProducts.map((p) =>
                    p._id === updated._id ? updated : p,
                );
            } else {
                const res = await productsService.create(productData);
                const created = res.data || res;
                allProducts = [...allProducts, created];
            }
            isFormOpen = false; // Use isFormOpen
            toastState.add("Producto guardado", "success");
        } catch (err) {
            toastState.add(err.message || "Error al guardar", "error");
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
            toastState.add("El producto no está disponible para su compra.", "error");
            return;
        }
        await cartState.addItem(product._id || product.id, 1);
        toastState.add("¡Producto añadido al carrito!", "success");
    }
</script>

<div class="container fade-in">
    <div class="header-action">
        <div>
            <h1>Cafetería con Servicio a Domicilio</h1>
            <p class="subtitle">
                Disfruta de nuestros mejores cafés y dulces en casa
            </p>
        </div>
        {#if authState.user?.role === "admin"}
            <button class="btn btn-primary" onclick={handleCreate}>
                + Nuevo Producto
            </button>
        {/if}
    </div>

    <!-- Buscador de productos usando bind:value y reaccionando mediante $derived -->
    <div class="filters-section glass-panel">
        <div class="filter-group">
            <input 
                type="text" 
                bind:value={searchQuery} 
                placeholder="Buscar productos por nombre..." 
                class="search-input"
            />
        </div>
        <div class="filter-group price-filters">
            <span class="price-label">Precio:</span>
            <input 
                type="number" 
                bind:value={minPrice} 
                placeholder="Mínimo" 
                class="search-input price-input"
                min="0"
            />
            <span>-</span>
            <input 
                type="number" 
                bind:value={maxPrice} 
                placeholder="Máximo" 
                class="search-input price-input"
                min="0"
            />
        </div>
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
            <p>No se encontraron productos con los filtros actuales.</p>
        </div>
    {:else}
        <div class="products-grid">
            {#each paginatedProducts as product (product._id)}
                <ProductCard
                    {product}
                    onEdit={() => handleEdit(product)}
                    onDelete={() => handleDelete(product._id)}
                    onClick={() => viewDetail(product)}
                />
            {/each}
        </div>
        
        {#if totalPages > 1}
            <div class="pagination">
                <button 
                    class="btn btn-sm" 
                    disabled={currentPage === 1}
                    onclick={() => currentPage--}>
                    Anterior
                </button>
                <span class="page-info">Página {currentPage} de {totalPages} ({products.length} resultados)</span>
                <button 
                    class="btn btn-sm" 
                    disabled={currentPage === totalPages}
                    onclick={() => currentPage++}>
                    Siguiente
                </button>
            </div>
        {/if}
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

    .filters-section {
        margin-bottom: 2rem;
        padding: 1rem;
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        min-width: 300px;
    }

    .price-filters {
        flex: 1;
        min-width: 320px;
        white-space: nowrap;
        color: var(--text-color);
        justify-content: flex-end;
    }

    .price-label {
        font-weight: 600;
        margin-right: 0.5rem;
    }

    .price-input {
        min-width: 110px;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-color);
        transition: border-color 0.3s;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
        margin-top: 3rem;
    }

    .page-info {
        color: var(--text-color);
        font-weight: 500;
        font-size: 0.95rem;
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
