export function createAuthStore() {
    let token = $state(localStorage.getItem('token') || null);
    let user = $state(null);

    // Initialize user if token exists (basic decode or fetch profile)
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            user = { id: payload.id, username: payload.username, role: payload.role };
        } catch (e) {
            token = null;
            localStorage.removeItem('token');
        }
    }

    return {
        get token() { return token; },
        get user() { return user; },
        get isAuthenticated() { return !!token; },
        login: (newToken, userData) => {
            token = newToken;
            localStorage.setItem('token', newToken);
            
            // Siempre decodificamos el token para extraer el rol y el ID reales
            try {
                const payload = JSON.parse(atob(newToken.split('.')[1]));
                user = { id: payload.id, username: payload.username, role: payload.role };
            } catch (e) {
                user = userData;
            }
        },
        logout: () => {
            token = null;
            user = null;
            localStorage.removeItem('token');
        }
    };
}

export const authState = createAuthStore();
