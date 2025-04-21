// TODO: Reemplazar con la URL real del API de backend
// Asumiendo un backend FastAPI local ejecutándose en el puerto 8000 
const BASE_URL = 'http://localhost:8000/api/v1'; // Ejemplo placeholder

const ApiConstants = {
  BASE_URL,
  // Endpoints de KPIs
  KPI_ENDPOINT: '/kpis', // Endpoint para lista y creación de KPIs
  // Endpoints de Autenticación
  AUTH_LOGIN_ENDPOINT: '/auth/token', // Endpoint para obtener token (FastAPI standard)
  AUTH_REGISTER_ENDPOINT: '/users/register', // Endpoint para registrar nuevos usuarios (Ejemplo)
  AUTH_FORGOT_PASSWORD_ENDPOINT: '/auth/forgot-password', // Endpoint para solicitar recuperación (Ejemplo)
  AUTH_RESET_PASSWORD_ENDPOINT: '/auth/reset-password', // Endpoint para establecer nueva contraseña (Ejemplo)
  USERS_ME_ENDPOINT: '/users/me', // Endpoint para obtener datos del usuario actual (Ejemplo)
};

export default ApiConstants;