// ReactNative/constants/Api.ts

// No es necesario importar Constants de 'expo-constants' si solo usas process.env
import Constants from 'expo-constants';

const API_IP_LOCAL = '192.168.3.27'; // IP del backend para desarrollo local
const API_PORT_LOCAL = 8000; // Puerto donde corre FastAPI en desarrollo local
const API_VERSION = 'v1';

let BASE_URL: string;

// __DEV__ es una variable global de React Native que es true en desarrollo
if (__DEV__) {
    // En desarrollo, usa la URL local
    BASE_URL = `http://${API_IP_LOCAL}:${API_PORT_LOCAL}/api/${API_VERSION}`;
    console.log(`[API Constants] (DEVELOPMENT) Conectando a la API en: ${BASE_URL}`);
} else {
    // En producción (cuando se despliega en Render), usa la variable de entorno
    // que configurarás en Render para el Static Site.
    // Asegúrate de que en Render, para tu Static Site, configures una variable de entorno:
    // Key: API_BASE_URL
    // Value: https://tu-backend-fastapi.onrender.com (la URL real de tu backend)
    const productionBaseUrl = process.env.API_BASE_URL;

    if (productionBaseUrl) {
        BASE_URL = `${productionBaseUrl}/api/${API_VERSION}`;
        console.log(`[API Constants] (PRODUCTION) Conectando a la API en: ${BASE_URL}`);
    } else {
        // Fallback para producción si la variable de entorno no está definida.
        // Esto NO debería ocurrir si configuras Render correctamente.
        // Aquí puedes poner una URL de producción por defecto si lo deseas,
        // o lanzar un error para indicar que la configuración falta.
        BASE_URL = `https://vectorkpi.onrender.com/api/${API_VERSION}`; // Tu URL de backend hosteada
        console.warn(`[API Constants] (PRODUCTION) La variable de entorno API_BASE_URL no está definida. Usando URL hardcodeada: ${BASE_URL}`);
    }
}

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