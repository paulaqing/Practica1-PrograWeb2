<script>
    import { authState } from "../store/authStore.svelte.js";
</script>

<div class="container fade-in">
    <div class="glass-panel profile-card">
        <div class="avatar">
            {authState.user?.username?.charAt(0).toUpperCase() || "?"}
        </div>

        <h2>{authState.user?.username}</h2>

        <div class="info-group">
            <div class="label">Rol</div>
            <div class="value role-badge">{authState.user?.role || "user"}</div>
        </div>

        <div class="info-group">
            <div class="label">ID de Usuario</div>
            <div class="value id-text">
                {authState.user?.id || "No disponible"}
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <h3>Sesión</h3>
                <p>Activa</p>
            </div>
            <div class="stat-box">
                <h3>Último acceso</h3>
                <p>Hoy</p>
            </div>
        </div>
    </div>
</div>

<style>
    .fade-in {
        animation: fadeIn 0.4s ease-out;
        display: flex;
        justify-content: center;
        padding-top: 2rem;
    }

    .profile-card {
        width: 100%;
        max-width: 500px;
        padding: 3rem 2rem;
        text-align: center;
    }

    .avatar {
        width: 100px;
        height: 100px;
        margin: 0 auto 1.5rem;
        border-radius: 50%;
        background: linear-gradient(
            135deg,
            var(--primary-color),
            var(--secondary-color)
        );
        color: white;
        font-size: 3rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
    }

    h2 {
        font-size: 2rem;
        margin-bottom: 2rem;
        color: var(--text-color);
    }

    .info-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .info-group .label {
        color: var(--text-muted);
        font-weight: 500;
    }

    .info-group .value {
        font-weight: 600;
    }

    .role-badge {
        background: var(--primary-color-dimmed);
        color: var(--primary-color);
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .id-text {
        font-family: monospace;
        color: var(--text-muted);
        font-size: 0.9rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 2rem;
    }

    .stat-box {
        background: rgba(0, 0, 0, 0.2);
        padding: 1.5rem;
        border-radius: 12px;
    }

    .stat-box h3 {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
    }

    .stat-box p {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--secondary-color);
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
</style>
