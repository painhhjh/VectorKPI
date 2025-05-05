// ReactNative/constants/Api.ts
const API_IP = '192.168.3.231'; // Cambia esto por tu IP local si es necesario
const API_PORT = 8000; // Puerto donde corre FastAPI
const API_VERSION = 'v1';

// URL Base sin barra final
const BASE_URL = `http://${API_IP}:${API_PORT}/api/${API_VERSION}`;

console.log(`[API Constants] Conectando a la API en: ${BASE_URL}`);

const ApiConstants = {
    BASE_URL, // URL Base completa

    // Rutas relativas (sin barra inicial)
    // Autenticación
    AUTH_LOGIN: 'auth/token',
    AUTH_TEST_TOKEN: 'auth/test-token',
    AUTH_FORGOT_PASSWORD: 'auth/forgot-password',
    AUTH_RESET_PASSWORD: 'auth/reset-password',

    // Usuarios
    USERS: 'users', // Para POST (registro) y GET (listar, si es admin)
    USERS_ME: 'users/me', // Para GET y PUT del usuario actual

    // Inventario
    INVENTORY_CATEGORIES: 'inventory/categories',
    INVENTORY_PRODUCTS: 'inventory/products',
    INVENTORY_TRANSACTIONS: 'inventory/transactions',

    // KPIs
    KPIS: 'kpis',

    // IA
    AI_ADVICE: 'ai/advice'
};

// Funciones helper para URLs dinámicas
export const getKpiUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.KPIS}/${id}`;
export const getUserUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.USERS}/${id}`;
export const getCategoryUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.INVENTORY_CATEGORIES}/${id}`;
export const getProductUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.INVENTORY_PRODUCTS}/${id}`;
export const getTransactionUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.INVENTORY_TRANSACTIONS}/${id}`;

export default ApiConstants;