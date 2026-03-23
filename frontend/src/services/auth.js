import { api } from './api';

export const authService = {
    login: async (username, password) => {
        return await api.post('/auth/login', { username, password });
    },

    register: async (username, password, role = 'user') => {
        return await api.post('/auth/register', { username, password, role });
    }
};
