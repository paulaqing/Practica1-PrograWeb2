<script>
    import { onMount, onDestroy } from "svelte";
    import { io } from "socket.io-client";
    import { authState } from "../store/authStore.svelte.js";
    import { toastState } from '../store/toastStore.svelte.js';
    import { router } from "../store/routerStore.svelte.js";

    let socket = null;
    let availableUsers = $state([]);
    let messages = $state([]);
    let currentChatUser = $state(null);
    let currentRoom = $state(null);
    let newMessage = $state("");

    let messagesContainer;

    onMount(() => {
        if (!authState.isAuthenticated || !authState.user) {
            toastState.add("Debes iniciar sesión para usar el chat", "error");
            router.navigate("/");
            return;
        }

        socket = io("/", {
            auth: { token: authState.token },
        });

        socket.on("connect", () => {
            console.log("✅ Conectado al servidor de chat");
            socket.emit("getAvailableUsers");
        });

        socket.on("availableUsers", (users) => {
            availableUsers = users;
        });

        socket.on("messageHistory", (history) => {
            messages = history;
            scrollToBottom();
        });

        socket.on("chatmessage", (data) => {
            messages = [...messages, data];
            scrollToBottom();
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    });

    function selectUser(username) {
        currentChatUser = username;

        const users = [authState.user.username, username].sort();
        currentRoom = `chat-${users[0]}-${users[1]}`;

        socket.emit("joinRoom", currentRoom);
    }

    function sendMessage(e) {
        e.preventDefault();
        const text = newMessage.trim();
        if (text && currentRoom && socket) {
            socket.emit("chatmessage", {
                message: text,
                room: currentRoom,
            });
            newMessage = "";
        }
    }

    function scrollToBottom() {
        setTimeout(() => {
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 10);
    }

    let adminUsers = $derived(availableUsers.filter((u) => u.role === "admin"));
    let regularUsers = $derived(
        availableUsers.filter((u) => u.role === "user"),
    );
</script>

<div class="chat-container fade-in">
    <div class="sidebar glass-panel">
        <h3 class="sidebar-title">👥 Usuarios</h3>

        {#if availableUsers.length === 0}
            <div class="empty-state">No hay usuarios disponibles</div>
        {:else}
            {#if adminUsers.length > 0}
                <div class="section-header">👔 Administradores</div>
                {#each adminUsers as u}
                    <button
                        class="user-item"
                        class:active={currentChatUser === u.username}
                        onclick={() => selectUser(u.username)}
                    >
                        <span>👔 {u.username}</span>
                        <span class="user-badge admin-badge">Admin</span>
                    </button>
                {/each}
            {/if}

            {#if regularUsers.length > 0}
                <div class="section-header" style="margin-top: 1rem;">
                    👤 Usuarios
                </div>
                {#each regularUsers as u}
                    <button
                        class="user-item"
                        class:active={currentChatUser === u.username}
                        onclick={() => selectUser(u.username)}
                    >
                        <span>👤 {u.username}</span>
                        <span class="user-badge">User</span>
                    </button>
                {/each}
            {/if}
        {/if}
    </div>

    <div class="chat-area glass-panel">
        <div class="chat-header">
            {#if currentChatUser}
                <span>Chat con {currentChatUser}</span>
            {:else}
                <span>Selecciona un usuario para comenzar</span>
            {/if}
        </div>

        <div class="messages-list" bind:this={messagesContainer}>
            {#if !currentChatUser}
                <div class="welcome-message">
                    <h3>👋 ¡Bienvenido al Chat!</h3>
                    <p>
                        Selecciona un usuario de la lista para comenzar a
                        conversar
                    </p>
                </div>
            {:else if messages.length === 0}
                <div class="welcome-message">
                    <h3>Inicia la conversación</h3>
                    <p>Escribe el primer mensaje</p>
                </div>
            {:else}
                {#each messages as msg}
                    <div
                        class="message-wrapper"
                        class:own={msg.name === authState.user?.username}
                    >
                        <div class="message bubble">
                            <span class="msg-name"
                                >{msg.name === authState.user?.username
                                    ? "Tú"
                                    : msg.name}</span
                            >
                            <span class="msg-text">{msg.msg}</span>
                            <span class="msg-time"
                                >{msg.timestamp || "Ahora"}</span
                            >
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

        <form class="chat-form" onsubmit={sendMessage}>
            <input
                type="text"
                placeholder="Escribe un mensaje..."
                bind:value={newMessage}
                disabled={!currentChatUser}
                autocomplete="off"
            />
            <button
                type="submit"
                class="btn btn-primary"
                disabled={!currentChatUser || !newMessage.trim()}
            >
                Enviar
            </button>
        </form>
    </div>
</div>

<style>
    .fade-in {
        animation: fadeIn 0.4s ease-out;
    }

    .chat-container {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
        height: calc(100vh - 180px);
        min-height: 500px;
    }

    .sidebar {
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        overflow-y: auto;
    }

    .sidebar-title {
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        font-size: 1.25rem;
        font-weight: 700;
    }

    .section-header {
        font-weight: 600;
        color: var(--secondary-color);
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .user-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.8rem 1rem;
        border: none;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 12px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        color: var(--text-color);
        font-family: inherit;
        font-size: 0.95rem;
    }

    .user-item:hover {
        background: rgba(255, 255, 255, 0.8);
        transform: translateX(4px);
    }

    .user-item.active {
        background: linear-gradient(
            135deg,
            var(--primary-color),
            var(--secondary-color)
        );
        color: white;
        box-shadow: 0 4px 15px rgba(236, 72, 153, 0.2);
    }

    .user-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.1);
        font-weight: 600;
    }

    .admin-badge {
        background: rgba(236, 72, 153, 0.2);
        color: #ec4899;
    }

    .user-item.active .user-badge {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }

    .chat-area {
        display: flex;
        flex-direction: column;
        padding: 0;
        overflow: hidden;
    }

    .chat-header {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.5);
        border-bottom: 1px solid var(--border-color);
        font-weight: 600;
        color: var(--text-color);
        font-size: 1.1rem;
    }

    .messages-list {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .welcome-message {
        text-align: center;
        color: var(--text-muted);
        margin: auto;
    }

    .welcome-message h3 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .message-wrapper {
        display: flex;
        width: 100%;
    }

    .message-wrapper.own {
        justify-content: flex-end;
    }

    .bubble {
        max-width: 70%;
        padding: 0.75rem 1rem;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
    }

    .message-wrapper.own .bubble {
        background: linear-gradient(
            135deg,
            var(--primary-color),
            var(--secondary-color)
        );
        color: white;
        border-bottom-right-radius: 4px;
    }

    .message-wrapper:not(.own) .bubble {
        border-bottom-left-radius: 4px;
        color: #050505;
        font-weight: 500;
    }

    .msg-name {
        font-weight: 700;
        font-size: 0.8rem;
        opacity: 0.8;
        margin-bottom: 0.25rem;
    }

    .msg-text {
        word-wrap: break-word;
        line-height: 1.4;
    }

    .msg-time {
        font-size: 0.7rem;
        opacity: 0.6;
        text-align: right;
        margin-top: 0.5rem;
    }

    .chat-form {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.5);
        border-top: 1px solid var(--border-color);
    }

    .chat-form input {
        flex: 1;
        padding: 0.75rem 1.25rem;
        border-radius: 999px;
        border: 1px solid var(--border-color);
        background: rgba(255, 255, 255, 0.8);
        font-size: 1rem;
        color: #050505;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .chat-form input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        background: white;
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
        .chat-container {
            grid-template-columns: 1fr;
            height: auto;
        }

        .sidebar {
            max-height: 300px;
        }

        .messages-list {
            height: 400px;
        }
    }
</style>
