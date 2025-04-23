// Ejemplo en constants/Api.ts
const API_IP = '192.168.3.231'; // <-- CAMBIA ESTO POR TU IP LOCAL
const API_PORT = 8000; // Puerto donde corre FastAPI
const API_VERSION = 'v1';

const BASE_URL = `http://${API_IP}:${API_PORT}/api/${API_VERSION}`;

console.log(`[API Constants] Conectando a la API en: ${BASE_URL}`);

const ApiConstants = {
    BASE_URL,
    // Endpoints de KPIs
    KPI_ENDPOINT: '/kpis',
    // Endpoints de Autenticación
    AUTH_LOGIN_ENDPOINT: '/auth/token',
    AUTH_REGISTER_ENDPOINT: '/users/',
    AUTH_FORGOT_PASSWORD_ENDPOINT: '/auth/forgot-password',
    AUTH_RESET_PASSWORD_ENDPOINT: '/auth/reset-password',
    USERS_ME_ENDPOINT: '/users/me',
    // Endpoints de Inventario
    INVENTORY_CATEGORIES_ENDPOINT: '/inventory/categories',
    INVENTORY_PRODUCTS_ENDPOINT: '/inventory/products',
    INVENTORY_TRANSACTIONS_ENDPOINT: '/inventory/transactions',
    AI_ADVICE_ENDPOINT: '/ai/advice',
  };

  export default ApiConstants;