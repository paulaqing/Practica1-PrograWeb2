<script>
  import { authService } from '../services/auth';
  import { authState } from '../store/authStore.svelte.js';
  import { router } from '../store/routerStore.svelte.js';

  let username = $state('');
  let password = $state('');
  let isRegistering = $state(false);
  let error = $state('');
  let loading = $state(false);

  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      let res;
      if (isRegistering) {
        res = await authService.register(username, password);
        // Despues de registro exitoso, login automatico
        const loginRes = await authService.login(username, password);
        authState.login(loginRes.token, loginRes.user || { username });
      } else {
        res = await authService.login(username, password);
        authState.login(res.token, res.user || { username });
      }
      
      router.navigate('/products');
    } catch (err) {
      error = err.message || 'Error en la autenticación';
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-wrapper">
  <div class="glass-panel login-card">
    <div class="header">
      <div class="logo">🛍️</div>
      <h1>{isRegistering ? 'Crear Cuenta' : 'Bienvenido de nuevo'}</h1>
      <p>Explora los mejores productos en tiempo real</p>
    </div>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    <form onsubmit={handleSubmit}>
      <div class="input-group">
        <label for="username">Usuario</label>
        <input 
          id="username" 
          type="text" 
          bind:value={username} 
          placeholder="Tu nombre de usuario"
          required 
          autocomplete="username"
        />
      </div>

      <div class="input-group">
        <label for="password">Contraseña</label>
        <input 
          id="password" 
          type="password" 
          bind:value={password} 
          placeholder="••••••••"
          required 
          autocomplete="current-password"
        />
      </div>

      <button type="submit" class="btn btn-primary w-full mt-4" disabled={loading}>
        {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
      </button>
    </form>

    <div class="toggle-mode">
      <p>
        {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
        <button class="text-link" onclick={() => isRegistering = !isRegistering}>
          {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
        </button>
      </p>
    </div>
  </div>
</div>

<style>
  .login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 80px);
    padding: 1rem;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem 2rem;
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 0 10px var(--primary-color-dimmed));
  }

  .header h1 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--text-color), var(--text-muted));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .header p {
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  .input-group {
    margin-bottom: 1.25rem;
  }

  .input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .w-full {
    width: 100%;
  }

  .toggle-mode {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .text-link {
    background: none;
    border: none;
    color: var(--primary-color);
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    padding: 0 0.25rem;
    transition: color 0.3s;
  }

  .text-link:hover {
    color: var(--primary-hover);
    text-decoration: underline;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
