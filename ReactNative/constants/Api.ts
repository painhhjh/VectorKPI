// Ejemplo en constants/Api.ts
const API_IP = '192.168.1.105'; // <-- CAMBIA ESTO POR TU IP LOCAL
const API_PORT = 8000; // Puerto donde corre FastAPI
const API_VERSION = 'v1';

const BASE_URL = `http://${API_IP}:${API_PORT}/api/${API_VERSION}`;

export default {
    BASE_URL,
    AUTH_LOGIN_ENDPOINT: '/auth/token',          // Coincide con auth.py
    AUTH_REGISTER_ENDPOINT: '/users/',           // Coincide con POST /users/ en users.py
    AUTH_FORGOT_PASSWORD_ENDPOINT: '/auth/forgot-password', // <-- Necesitas crear este endpoint en FastAPI
    AUTH_RESET_PASSWORD_ENDPOINT: '/auth/reset-password',   // <-- Necesitas crear este endpoint en FastAPI
    KPI_ENDPOINT: '/kpis',                      // Coincide con kpi.py
    INVENTORY_CATEGORIES_ENDPOINT: '/inventory/categories',
    INVENTORY_PRODUCTS_ENDPOINT: '/inventory/products',
    INVENTORY_TRANSACTIONS_ENDPOINT: '/inventory/transactions',
    AI_ADVICE_ENDPOINT: '/ai/advice',
    USERS_ME_ENDPOINT: '/users/me', // Para obtener datos del usuario actual
};