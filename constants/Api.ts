// TODO: Reemplazar con la URL real del API de backend
// Asumiendo un backend FastAPI local ejecutándose en el puerto 8000 
const BASE_URL = 'http://localhost:8000/api/v1'; // Ejemplo de marcador de posición

const ApiConstants = {
  BASE_URL,
  // Agrega otros puntos finales según sea necesario, por ejemplo, AUTH_LOGIN: '/auth/login'
  KPI_ENDPOINT: '/kpis', // Ejemplo de punto final para KPIs
  AUTH_LOGIN_ENDPOINT: '/auth/token', // Ejemplo de punto final basado en estándares de FastAPI
};

export default ApiConstants;
