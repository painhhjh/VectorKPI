// Configuración centralizada del cliente HTTP (axios) para interactuar con la API
// Establece la URL base, interceptores para tokens y manejo de errores
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; // Importa Platform
import ApiConstants from '../constants/Api';

// Constantes
export const CLAVE_TOKEN_AUTH = 'authToken'; // Clave para almacenamiento seguro del token

// Configuración inicial de Axios
const clienteApi: AxiosInstance = axios.create({
  baseURL: ApiConstants.BASE_URL,
  timeout: 15000,
});

// --- Funciones de Almacenamiento de Token (Plataforma Específica) ---

const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(CLAVE_TOKEN_AUTH);
    } catch (e) {
      console.error('[API Service] Error al obtener token de localStorage:', e);
      return null;
    }
  } else {
    try {
      return await SecureStore.getItemAsync(CLAVE_TOKEN_AUTH);
    } catch (e) {
      console.error('[API Service] Error al obtener token de SecureStore:', e);
      return null;
    }
  }
};

export const guardarToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(CLAVE_TOKEN_AUTH, token);
      console.log('[API Service] Token guardado en localStorage');
    } catch (e) {
      console.error('[API Service] Error al guardar token en localStorage:', e);
      throw new Error('Error al guardar la sesión (web)');
    }
  } else {
    try {
      await SecureStore.setItemAsync(CLAVE_TOKEN_AUTH, token);
      console.log('[API Service] Token guardado en SecureStore');
    } catch (e) {
      console.error('[API Service] Error al guardar token en SecureStore:', e);
      throw new Error('Error al guardar la sesión (native)');
    }
  }
};

export const borrarToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(CLAVE_TOKEN_AUTH);
      console.log('[API Service] Token eliminado de localStorage');
    } catch (e) {
      console.error('[API Service] Error al eliminar token de localStorage:', e);
      // No relanzar error para que logout continúe
    }
  } else {
    try {
      await SecureStore.deleteItemAsync(CLAVE_TOKEN_AUTH);
      console.log('[API Service] Token eliminado de SecureStore');
    } catch (e) {
      console.error('[API Service] Error al eliminar token de SecureStore:', e);
      // No relanzar error
    }
  }
};


// --- Interceptores de Axios ---

// Interceptor de Peticiones: Usa la nueva función getToken
clienteApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await getToken(); // Usa la función agnóstica de plataforma
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Esto captura errores ANTES de que la petición se envíe (ej. mala configuración)
    console.error('[API Interceptor Req] Error en configuración de petición:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuestas
 * - Manejo centralizado de errores HTTP (4xx, 5xx).
 * - Extracción de mensajes de error 'detail' de FastAPI.
 * - Gestión específica de errores 401 (token inválido/expirado).
 * - Manejo de errores de red/timeout.
 */
clienteApi.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  // Función para manejar errores (no 2xx)
  async (error: AxiosError): Promise<AxiosError> => {
    // Log detallado del error
    console.error('[API Interceptor Res] Error en respuesta:',
      error.response?.status, // Código de estado (si hay respuesta)
      error.config?.method?.toUpperCase(), // Método HTTP
      error.config?.url, // URL solicitada
      error.message, // Mensaje de error general de Axios
      error.response?.data // Datos de la respuesta de error (si existen)
    );

    // --- Caso 1: Error con respuesta del servidor (4xx, 5xx) ---
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = `Error ${status}`;

      // Intenta extraer el mensaje 'detail' de FastAPI
      if (typeof data === 'object' && data !== null && (data as any).detail) {
        // Si 'detail' es un array (errores de validación Pydantic), únelos.
        if (Array.isArray((data as any).detail)) {
          errorMessage = (data as any).detail
            .map((err: any) => `${err.loc?.slice(-1)[0] || 'field'}: ${err.msg}`) // Toma el último campo y el mensaje
            .join('; ');
        } else {
          // Si 'detail' es un string, úsalo directamente.
          errorMessage = String((data as any).detail);
        }
      } else if (typeof data === 'string' && data.length > 0) {
        // Si la respuesta es solo un string, úsalo.
        errorMessage = data;
      } else {
        // Fallback si no hay 'detail'
        switch (status) {
            case 400: errorMessage = 'Solicitud incorrecta.'; break;
            case 401: errorMessage = 'No autorizado. Por favor inicie sesión.'; break;
            case 403: errorMessage = 'No tienes permiso para realizar esta acción.'; break;
            case 404: errorMessage = 'El recurso solicitado no fue encontrado.'; break;
            case 422: errorMessage = 'Datos inválidos en la solicitud.'; break; // Error de validación genérico
            case 500: errorMessage = 'Error interno del servidor. Intente más tarde.'; break;
            default: errorMessage = `Error inesperado del servidor (${status}).`;
        }
      }

      // Manejo específico para 401 (Token inválido/expirado)
      if (status === 401) {
        console.warn('[API Interceptor Res] Error 401 detectado. Borrando token local...');
        await borrarToken(); // Intenta borrar el token almacenado
        // Podrías añadir lógica aquí para redirigir al login automáticamente si usas un router global
        // Ejemplo: rootNavigation.navigate('Login');
        // Creamos un error específico para que el AuthContext pueda reaccionar si es necesario
        const authError = new Error(errorMessage); // Usa el mensaje extraído o el genérico 401
        (authError as any).isAuthError = true; // Marca como error de autenticación
        (authError as any).status = 401;
        return Promise.reject(authError);
      }

      // Para otros errores (400, 403, 404, 422, 500, etc.), crea un error con el mensaje procesado
      const processedError = new Error(errorMessage);
      (processedError as any).status = status; // Adjunta el status code
      (processedError as any).data = data; // Adjunta los datos originales del error
      return Promise.reject(processedError);
    }

    // --- Caso 2: Error sin respuesta del servidor (problema de red, timeout, CORS no configurado en servidor) ---
    else if (error.request) {
      console.error('[API Interceptor Res] No se recibió respuesta del servidor:', error.request);
      let networkErrorMessage = 'Error de conexión. Verifique su red o la disponibilidad del servidor.';
      if (error.code === 'ECONNABORTED') {
        networkErrorMessage = 'La petición tardó demasiado (timeout).';
      } else if (error.message.includes('Network Error')) {
         networkErrorMessage = 'Error de red. Verifique la conexión y la configuración CORS del servidor.';
      }
      const networkError = new Error(networkErrorMessage);
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // --- Caso 3: Error al configurar la petición (ya manejado en el interceptor de request, pero por si acaso) ---
    else {
      console.error('[API Interceptor Res] Error al configurar la petición:', error.message);
      return Promise.reject(new Error(`Error al preparar la solicitud: ${error.message}`));
    }
  }
);

// --- Funciones Helper HTTP ---
// No necesitan cambios, usan la instancia configurada de clienteApi

export const get = <T = any>(url: string, params?: object, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> => {
  // Axios concatena 'url' relativa con 'baseURL' automáticamente
  return clienteApi.get<T>(url, { ...config, params });
};

export const post = <T = any>(
  url: string,
  data?: any,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return clienteApi.post<T>(url, data, config);
};

export const put = <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return clienteApi.put<T>(url, data, config);
};

export const del = <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return clienteApi.delete<T>(url, config);
};


export default clienteApi;