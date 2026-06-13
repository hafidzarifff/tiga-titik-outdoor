// resources/js/services/api.js

import axios from 'axios';

/**
 * Pre-configured Axios instance for the Laravel REST API.
 *
 * BaseURL points to the versioned API endpoint.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    headers: {
        Accept: 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('tto_auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('tto_auth_token');
            if (window.location.pathname !== '/login') {
                // Ignore redirect for the login API call itself
                if (!error.config.url.includes('/auth/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const getEquipments = (params) => api.get('/equipments', { params });
export const login = (data) => api.post('/login', data, { baseURL: '/api' });
export const register = (data) => api.post('/register', data, { baseURL: '/api' });
export const getProfile = () => api.get('/user', { baseURL: '/api' });
export const updateProfile = (data) => api.put('/profile', data, { baseURL: '/api' });
export const getCategories = () => api.get('/categories', { baseURL: '/api' });
export const createBooking = (data) => api.post('/bookings', data);

export default api;
