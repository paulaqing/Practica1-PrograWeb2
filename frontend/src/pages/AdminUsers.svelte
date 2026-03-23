<script>
    import { onMount } from 'svelte';
    import { api } from '../services/api.js';
    import { authState } from '../store/authStore.svelte.js';
    import { router } from '../store/routerStore.svelte.js';

    let users = $state([]);
    let loading = $state(true);
    let error = $state(null);
    let actingOn = $state(null);

    onMount(async () => {
        if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
            router.navigate('/');
            return;
        }
        await loadUsers();
    });

    async function loadUsers() {
        loading = true;
        error = null;
        try {
            const query = `
                query {
                    users {
                        id
                        username
                        role
                        createdAt
                    }
                }
            `;
            const response = await api.post('/graphql', { query });
            if (response.errors) throw new Error(response.errors[0].message);
            users = response.data.users;
        } catch (err) {
            error = err.message || 'Error al cargar usuarios';
        } finally {
            loading = false;
        }
    }

    async function handleRoleChange(userId, newRole) {
        if (!confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;
        actingOn = userId;
        try {
            const query = `
                mutation UpdateRole($id: ID!, $role: String!) {
                    updateUserRole(id: $id, role: $role) {
                        id
                        role
                    }
                }
            `;
            const response = await api.post('/graphql', {
                query,
                variables: { id: userId, role: newRole }
            });
            if (response.errors) throw new Error(response.errors[0].message);
            
            // actualizar en UI
            users = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
        } catch (err) {
            alert(err.message || 'Error al cambiar rol');
        } finally {
            actingOn = null;
        }
    }

    async function handleDelete(userId, username) {
        if (!confirm(`¿PELIGRO: Eliminar permanentemente al usuario ${username}?`)) return;
        actingOn = userId;
        try {
            const query = `
                mutation DeleteUser($id: ID!) {
                    deleteUser(id: $id) {
                        success
                        message
                    }
                }
            `;
            const response = await api.post('/graphql', {
                query,
                variables: { id: userId }
            });
            if (response.errors) throw new Error(response.errors[0].message);
            
            // quitar de UI
            users = users.filter(u => u.id !== userId);
        } catch (err) {
            alert(err.message || 'Error al eliminar usuario');
        } finally {
            actingOn = null;
        }
    }

    function formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    }
</script>

<div class="admin-users fade-in">
    <div class="header">
        <h2>👥 Control de Usuarios</h2>
        <button class="btn btn-primary" onclick={loadUsers} disabled={loading}>
            Actualizar
        </button>
    </div>

    {#if error}
        <div class="error-banner">{error}</div>
    {/if}

    {#if loading && users.length === 0}
        <div class="loading-state">Cargando usuarios...</div>
    {:else}
        <div class="table-container glass-panel">
            <table class="users-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each users as user (user.id)}
                        <tr>
                            <td>
                                <div class="user-info">
                                    <span class="avatar">{user.username.charAt(0).toUpperCase()}</span>
                                    {user.username}
                                    {#if user.id === authState.user?.id || user.username === authState.user?.username}
                                        <span class="badge self">(Tú)</span>
                                    {/if}
                                </div>
                            </td>
                            <td>
                                <span class="badge role-{user.role}">{user.role}</span>
                            </td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td>
                                <div class="actions">
                                    {#if user.username !== authState.user?.username}
                                        <select 
                                            class="role-select" 
                                            value={user.role} 
                                            disabled={actingOn === user.id}
                                            onchange={(e) => handleRoleChange(user.id, e.target.value)}>
                                            <option value="user">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                        <button 
                                            class="btn-delete-sm" 
                                            disabled={actingOn === user.id}
                                            onclick={() => handleDelete(user.id, user.username)}>
                                            🗑️
                                        </button>
                                    {:else}
                                        <span class="text-muted">Sin acciones</span>
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<style>
    .admin-users {
        max-width: 1000px;
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

    .table-container {
        overflow-x: auto;
        padding: 0;
    }

    .users-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    .users-table th, .users-table td {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        color: var(--text-color);
    }

    .users-table th {
        background: rgba(0,0,0,0.2);
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
    }

    .users-table tr:last-child td {
        border-bottom: none;
    }

    .users-table tr:hover td {
        background: rgba(255,255,255, 0.05);
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-weight: 600;
    }

    .avatar {
        width: 35px;
        height: 35px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
    }

    .badge {
        padding: 0.3rem 0.6rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    .badge.self {
        background: rgba(0,0,0,0.1);
        color: var(--text-muted);
    }

    .role-admin {
        background: rgba(236, 72, 153, 0.2);
        color: #ec4899;
    }

    .role-user {
        background: rgba(0,0,0,0.1);
        color: var(--text-muted);
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .role-select {
        padding: 0.4rem 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--primary-color);
        background: rgba(236, 72, 153, 0.1);
        color: var(--primary-color);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .role-select:hover:not(:disabled) {
        background: rgba(236, 72, 153, 0.2);
    }

    .role-select:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.3);
    }

    .btn-delete-sm {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.4rem;
        border-radius: 6px;
        transition: background 0.2s;
    }

    .btn-delete-sm:hover:not(:disabled) {
        background: #fee2e2;
    }

    .btn-delete-sm:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .text-muted {
        color: var(--text-muted);
        font-style: italic;
        font-size: 0.9rem;
    }
</style>
