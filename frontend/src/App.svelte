<script>
  import { router } from "./store/routerStore.svelte.js";
  import { authState } from "./store/authStore.svelte.js";
  import { cartState } from "./store/cartStore.svelte.js";

  import Navbar from "./components/Navbar.svelte";
  import Login from "./pages/Login.svelte";
  import Products from "./pages/Products.svelte";
  import Chat from "./pages/Chat.svelte";
  import Profile from "./pages/Profile.svelte";
  import Cart from "./pages/Cart.svelte";
  import Orders from "./pages/Orders.svelte";
  import AdminUsers from "./pages/AdminUsers.svelte";

  // Route protection
  $effect(() => {
    const path = router.path;
    const isAuth = authState.isAuthenticated;

    // Load cart if authenticated, but hasn't been loaded
    if (isAuth && !cartState.loaded && !cartState.loading) {
       cartState.loadCart();
    }

    if (path === "/") {
      router.navigate("/login");
    } else if (!isAuth && path !== "/login") {
      router.navigate("/login");
    }
  });
</script>

<Navbar />

<main>
  {#if router.path === "/login"}
    <Login />
  {:else if router.path === "/products"}
    <Products />
  {:else if router.path === "/profile"}
    <Profile />
  {:else if router.path === "/chat"}
    <Chat />
  {:else if router.path === "/cart"}
    <Cart />
  {:else if router.path === "/orders"}
    <Orders />
  {:else if router.path === "/admin/users"}
    <AdminUsers />
  {:else}
    <div class="container" style="text-align: center; margin-top: 10vh;">
      <div class="glass-panel" style="padding: 3rem;">
        <h2>404 - Página no encontrada</h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          La página a la que intentas acceder no existe.
        </p>
        <button
          class="btn btn-primary"
          onclick={() => router.navigate("/products")}>Volver al Inicio</button
        >
      </div>
    </div>
  {/if}
</main>
