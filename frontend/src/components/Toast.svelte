<script>
    import { toastState } from "../store/toastStore.svelte.js";
</script>

<div class="toast-container">
    {#each toastState.toasts as toast (toast.id)}
        <div class="toast toast-{toast.type} fade-in">
            <span>{toast.message}</span>
            <button class="close-btn" onclick={() => toastState.remove(toast.id)}>
                &times;
            </button>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 9999;
    }

    .toast {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 250px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        color: white;
        font-weight: 500;
        backdrop-filter: blur(10px);
    }

    .toast-info {
        background: rgba(59, 130, 246, 0.9);
        border: 1px solid rgba(59, 130, 246, 1);
    }

    .toast-success {
        background: rgba(16, 185, 129, 0.9);
        border: 1px solid rgba(16, 185, 129, 1);
    }

    .toast-error {
        background: rgba(239, 68, 68, 0.9);
        border: 1px solid rgba(239, 68, 68, 1);
    }

    .close-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: 1rem;
    }

    .close-btn:hover {
        color: white;
    }

    .fade-in {
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }
</style>
