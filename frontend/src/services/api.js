import { authState } from '../store/authStore.svelte.js';

const API_BASE_URL = '/api';

export async function fetchApi(endpoint, options = {}) {
    const token = authState.token;

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const url = endpoint.startsWith('/graphql') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, config);

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const textData = await response.text();
            throw new Error(`Error en el servidor: ${response.status}. Por favor revisa que el backend esté ejecutándose en el puerto correcto.`);
        }

        if (!response.ok) {
            if (response.status === 401) {
                authState.logout();
            }
            throw new Error(data?.message || 'Error en la petición API');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export const api = {
    get: (endpoint) => fetchApi(endpoint, { method: 'GET' }),
    post: (endpoint, body) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => fetchApi(endpoint, { method: 'DELETE' })
};
