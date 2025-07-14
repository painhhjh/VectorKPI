// ReactNative/constants/Api.ts
const API_IP = '192.168.3.27'; // IP del backend
const API_PORT = 8000; // Puerto donde corre FastAPI
const API_VERSION = 'v1';

// URL Base sin barra final
const BASE_URL = `http://${API_IP}:${API_PORT}/api/${API_VERSION}`;

console.log(`[API Constants] Conectando a la API en: ${BASE_URL}`);

const ApiConstants = {
    BASE_URL, // URL Base completa

    // Autenticación
    AUTH_LOGIN: 'auth/token',
    AUTH_TEST_TOKEN: 'auth/test-token',
    AUTH_FORGOT_PASSWORD: 'auth/forgot-password',
    AUTH_RESET_PASSWORD: 'auth/reset-password',

    // Usuarios
    USER: 'user', // Para POST (registro) y GET (listar, si es admin)
    USER_ME: 'user/me', // Para GET y PUT del usuario actual

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
export const getUserUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.USER}/${id}`;
export const getCategoryUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.INVENTORY_CATEGORIES}/${id}`;
export const getProductUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.INVENTORY_PRODUCTS}/${id}`;
export const getTransactionUrl = (id: number | string) => `${ApiConstants.BASE_URL}/${ApiConstants.INVENTORY_TRANSACTIONS}/${id}`;

export default ApiConstants;