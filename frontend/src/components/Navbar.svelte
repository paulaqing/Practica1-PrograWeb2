<script>
  import { router } from "../store/routerStore.svelte.js";
  import { authState } from "../store/authStore.svelte.js";
  import { cartState } from "../store/cartStore.svelte.js";

  function nav(e, path) {
    e.preventDefault();
    router.navigate(path);
  }

  function handleLogout(e) {
    e.preventDefault();
    authState.logout();
    router.navigate("/login");
  }

  let isLightMode = $state(localStorage.getItem('theme') === 'light');

  $effect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem('theme', 'dark');
    }
  });

  function toggleTheme() {
    isLightMode = !isLightMode;
  }
</script>

<nav class="navbar">
  <div class="brand" onclick={(e) => nav(e, "/")}>🛍️ Portal Productos</div>

  {#if authState.isAuthenticated}
    <div class="nav-links">
      <a
        href="/products"
        class:active={router.path === "/products" || router.path === "/"}
        onclick={(e) => nav(e, "/products")}
      >
        Productos
      </a>
      <a
        href="/chat"
        class:active={router.path === "/chat"}
        onclick={(e) => nav(e, "/chat")}
      >
        Chat
      </a>
      <a
        href="/profile"
        class:active={router.path === "/profile"}
        onclick={(e) => nav(e, "/profile")}
      >
        Mi Perfil
      </a>
      <a
        href="/orders"
        class:active={router.path === "/orders"}
        onclick={(e) => nav(e, "/orders")}
      >
        Pedidos
      </a>
      {#if authState.user?.role === 'admin'}
        <a
          href="/admin/users"
          class:active={router.path === "/admin/users"}
          onclick={(e) => nav(e, "/admin/users")}
        >
          Usuarios
        </a>
      {/if}
      {#if authState.user?.role !== 'admin'}
        <a
          href="/cart"
          class:active={router.path === "/cart"}
          class="cart-link"
          onclick={(e) => nav(e, "/cart")}
        >
          🛒 Carrito
          {#if cartState.totalItems > 0}
            <span class="cart-badge">{cartState.totalItems}</span>
          {/if}
        </a>
      {/if}
      <button class="theme-toggle" onclick={toggleTheme} aria-label="Cambiar tema">
          {isLightMode ? '🌙' : '☀️'}
      </button>
      <button
        class="btn-logout"
        aria-label="Cerrar Sessión"
        onclick={handleLogout}>Salir</button
      >
    </div>
  {:else}
    <div class="nav-links">
      <a
        href="/login"
        class:active={router.path === "/login"}
        onclick={(e) => nav(e, "/login")}
      >
        Login
      </a>
    </div>
  {/if}
</nav>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .brand {
    font-size: 1.5rem;
    font-weight: 700;
    cursor: pointer;
    color: var(--text-color);
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  .nav-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 8px;
  }

  .nav-links a:hover {
    color: var(--primary-color);
    background: rgba(255, 255, 255, 0.05);
  }

  .nav-links a.active {
    color: var(--text-color);
    background: var(--primary-color-dimmed);
    border: 1px solid var(--primary-color);
  }

  .cart-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
  }

  .cart-badge {
    background: var(--primary-color);
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.15rem 0.4rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-logout {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--text-color);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn-logout:hover {
    background: #ef4444;
    border-color: #ef4444;
  }

  .theme-toggle {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    transition: transform 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-toggle:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.1);
  }
</style>
