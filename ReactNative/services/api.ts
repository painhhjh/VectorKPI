// Configuración centralizada del cliente HTTP (axios) para interactuar con la API
// Establece la URL base, interceptores para tokens y manejo de errores
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import ApiConstants from '../constants/Api';

// Constantes
export const CLAVE_TOKEN_AUTH = 'authToken'; // Clave para almacenamiento seguro del token

// Configuración inicial de Axios
const clienteApi: AxiosInstance = axios.create({
  baseURL: ApiConstants.BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptores de Axios ========================================================

/**
 * Interceptor de Peticiones
 * - Añade automáticamente el token de autenticación a los headers
 * - Maneja errores de configuración de peticiones
 */
clienteApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      const token = await SecureStore.getItemAsync(CLAVE_TOKEN_AUTH);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API Interceptor Req] Error al obtener token:', error);
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('[API Interceptor Req] Error en configuración:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuestas
 * - Manejo centralizado de errores HTTP
 * - Procesamiento de mensajes de error de FastAPI
 * - Gestión de tokens expirados (401)
 */
clienteApi.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosError> => {
    console.error('[API Interceptor Res] Error en respuesta:', error.response?.status, error.config?.url, error.message);

    // Manejo de errores con respuesta del servidor
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = 'Ocurrió un error inesperado.';

      // Extracción de mensajes de error
      if (typeof data === 'object' && data !== null) {
        if ((data as any).detail) { // Formato FastAPI estándar
          errorMessage = (data as any).detail;
        } else if (Array.isArray((data as any).detail)) { // Errores de validación Pydantic
          errorMessage = (data as any).detail
            .map((err: any) => `${err.loc.join('.')} - ${err.msg}`)
            .join('; ');
        } else if ((data as any).message) {
          errorMessage = (data as any).message;
        }
      } else if (typeof data === 'string') {
        errorMessage = data;
      }

      // Manejo específico por código de estado
      switch (status) {
        case 401:
          console.warn('[API Interceptor Res] Error 401 - No autorizado');
          await manejarErrorAutenticacion();
          return Promise.reject(crearErrorAutenticacion());
          
        case 403:
          errorMessage = 'No tienes permiso para esta acción';
          break;
          
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
          
        case 422:
          console.warn('[API Interceptor Res] Error 422 - Validación fallida');
          break;
          
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
      }

      return Promise.reject(crearErrorProcesado(errorMessage, status, data));
    }

    // Manejo de errores sin respuesta
    if (error.request) {
      return Promise.reject(crearErrorRed(error));
    }

    // Manejo de errores de configuración
    return Promise.reject(new Error(`Error al preparar la solicitud: ${error.message}`));
  }
);

// Funciones Helper HTTP 

//Realiza una petición GET
export const get = <T = any>(url: string, params?: object): Promise<AxiosResponse<T>> => {
  return clienteApi.get<T>(url, { params });
};

//Realiza una petición POST
export const post = <T = any>(
  url: string,
  data?: any,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return clienteApi.post<T>(url, data, config);
};

//Realiza una petición PUT
export const put = <T = any>(url: string, data?: object): Promise<AxiosResponse<T>> => {
  return clienteApi.put<T>(url, data);
};

// Realiza una petición DELETE
export const del = <T = any>(url: string): Promise<AxiosResponse<T>> => {
  return clienteApi.delete<T>(url);
};

// Gestión de Tokens ==============================================================================

//Guarda el token de autenticación en almacenamiento seguro
export const guardarToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(CLAVE_TOKEN_AUTH, token);
    console.log('[API Service] Token guardado');
  } catch (error) {
    console.error('[API Service] Error al guardar token:', error);
    throw new Error('Error al guardar la sesión');
  }
};

// Elimina el token de autenticación del almacenamiento seguro

export const borrarToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN_AUTH);
    console.log('[API Service] Token eliminado');
  } catch (error) {
    console.error('[API Service] Error al eliminar token:', error);
  }
};

// Funciones de apoyo =============================================================================

/** Maneja la lógica de error 401 */
const manejarErrorAutenticacion = async (): Promise<void> => {
  try {
    console.log('[API Interceptor Res] Borrando token por error 401');
    await borrarToken();
  } catch (error) {
    console.error('[API Interceptor Res] Error al borrar token:', error);
  }
};

/** Crea error de autenticación estandarizado */
const crearErrorAutenticacion = (): Error => {
  const error = new Error('Sesión expirada - Por favor inicie sesión nuevamente');
  (error as any).isAuthError = true;
  (error as any).status = 401;
  return error;
};

/** Crea error procesado con metadatos */
const crearErrorProcesado = (message: string, status?: number, data?: any): Error => {
  const error = new Error(message);
  (error as any).status = status;
  (error as any).data = data;
  return error;
};

/** Crea error de red estandarizado */
const crearErrorRed = (error: AxiosError): Error => {
  console.error('[API Interceptor Res] Error de red:', error.code);
  const networkError = new Error(
    error.code === 'ECONNABORTED' 
      ? 'La petición tardó demasiado' 
      : 'Error de conexión - Verifique su red'
  );
  (networkError as any).isNetworkError = true;
  return networkError;
};

export default clienteApi;