//Configuración centralizada del cliente HTTP (axios) para interactuar con la API.
//Establece la URL base, interceptores para tokens y manejo de errores.
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import ApiConstants from '../constants/Api';


// Clave para guardar/recuperar el token de autenticación de forma segura
export const CLAVE_TOKEN_AUTH = 'authToken';

// Instancia de Axios
const clienteApi: AxiosInstance = axios.create({
  baseURL: ApiConstants.BASE_URL, // URL base de la API desde las constantes
  timeout: 10000, // Tiempo máximo de espera para una petición (10 segundos)
  headers: {
    'Content-Type': 'application/json', // Tipo de contenido por defecto para las peticiones POST/PUT
    'Accept': 'application/json', // Aceptamos respuestas JSON
  },
});

//Interceptores

// 1. Interceptor de Peticiones (Request Interceptor)
// Se ejecuta ANTES de que cada petición sea enviada. Útil para añadir headers comunes, como el token de autenticación.
clienteApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      // Intenta recuperar el token de autenticación desde el almacenamiento seguro
      const token = await SecureStore.getItemAsync(CLAVE_TOKEN_AUTH);

      // Si existe un token, lo añadimos al header 'Authorization'
      if (token) {
        // Aseguramos que config.headers exista
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Interceptor Req] Token añadido al header'); // Log para depuración
      } else {
         console.log('[API Interceptor Req] No se encontró token'); // Log para depuración
      }
    } catch (error) {
      console.error('[API Interceptor Req] Error al obtener token:', error);
      // Podrías manejar este error de alguna forma si es crítico
    }
    // Devuelve la configuración modificada (o la original si no hubo token)
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Maneja errores que ocurran durante la configuración de la petición
    console.error('[API Interceptor Req] Error en configuración:', error);
    return Promise.reject(error); // Rechaza la promesa con el error
  }
);

// 2. Interceptor de Respuestas (Response Interceptor)
// Se ejecuta DESPUÉS de recibir una respuesta (exitosa o con error). manejo centralizado de errores o transformación de datos.
clienteApi.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Si la respuesta es exitosa (status 2xx), simplemente la devolvemos.
    // Se podría hacer alguna transformación global aquí si fuera necesario.
    console.log('[API Interceptor Res] Respuesta recibida:', response.status, response.config.url); // Log para depuración
    return response;
  },
  async (error: AxiosError): Promise<AxiosError> => {
    // Maneja errores en las respuestas (status 4xx, 5xx).
    console.error('[API Interceptor Res] Error en respuesta:', error.response?.status, error.config?.url, error.message); // Log detallado

    if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        const { status, data } = error.response;
        let errorMessage = 'Ocurrió un error inesperado.'; // Mensaje por defecto

        // Intentar obtener detalle de FastAPI u otros formatos comunes
        if (typeof data === 'object' && data !== null) {
            if ((data as any).detail) { // FastAPI detail
                errorMessage = (data as any).detail;
            } else if ((data as any).message) { // Common 'message' property
                errorMessage = (data as any).message;
            } else if (typeof (data as any).error === 'string') { // Common 'error' string property
                 errorMessage = (data as any).error;
            }
            // Puedes añadir más checks aquí para otros formatos de error comunes en tu API
        } else if (typeof data === 'string' && data.length > 0) {
            // Si la respuesta es solo un string, usarlo como mensaje
            errorMessage = data;
        } else if (error.message) {
            // Fallback al mensaje de error de Axios si no hay cuerpo o detalle
            errorMessage = error.message;
        }


        if (status === 401) {
            // Error de autenticación (Token inválido, expirado, etc.)
            console.warn('[API Interceptor Res] Error 401 - No autorizado.');

            // --- Lógica para manejar el 401 ---
            // 1. Intentar refrescar el token (si aplica) - Lógica no implementada aquí
            // 2. Borrar el token local
            try {
                console.log('[API Interceptor Res] Borrando token local debido a error 401.');
                await borrarToken(); // Llama a la función que usa SecureStore.deleteItemAsync
            } catch (deleteError) {
                console.error('[API Interceptor Res] Error al borrar el token después de un 401:', deleteError);
            }

            // 3. Rechazar la promesa con un error específico para que AuthContext lo maneje.
            const authError = new Error('Sesión inválida o expirada. Por favor, inicia sesión de nuevo.');
            (authError as any).isAuthError = true; // Flag para identificarlo fácilmente
            (authError as any).status = 401;
            return Promise.reject(authError);

        } else if (status === 403) {
            errorMessage = 'No tienes permiso para realizar esta acción.';
            console.warn('[API Interceptor Res] Error 403 - Prohibido.');
        } else if (status === 404) {
            errorMessage = 'El recurso solicitado no fue encontrado.';
            console.warn('[API Interceptor Res] Error 404 - No encontrado.');
        } else if (status >= 500) {
            errorMessage = 'Ocurrió un error en el servidor. Inténtalo más tarde.';
            console.error('[API Interceptor Res] Error del servidor:', status);
        }
        // Puedes añadir manejo para otros códigos de error (400, 409, 422, etc.) si es necesario

        // Rechazar con un objeto Error que contiene el mensaje procesado y detalles adicionales
        const processedError = new Error(errorMessage);
        (processedError as any).status = status; // Adjuntar status si es útil
        (processedError as any).data = data; // Adjuntar data original si es útil
        return Promise.reject(processedError);


    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta (ej. problema de red, timeout)
      console.error('[API Interceptor Res] No se recibió respuesta del servidor:', error.code, error.message); // Log con código de error (e.g., ECONNABORTED)
      let networkErrorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      if (error.code === 'ECONNABORTED') {
          networkErrorMessage = 'La petición tardó demasiado en responder. Inténtalo de nuevo.';
      }
      // Podrías devolver un error indicando problema de conexión.
      const networkError = new Error(networkErrorMessage);
      (networkError as any).isNetworkError = true; // Flag para identificarlo
      (networkError as any).code = error.code; // Adjuntar código de error si existe
      return Promise.reject(networkError);

    } else {
      // Ocurrió un error al configurar la petición que disparó un Error
      console.error('[API Interceptor Res] Error al configurar la petición:', error.message);
      // Devolver un error genérico para este caso raro
      return Promise.reject(new Error('Error al preparar la solicitud: ' + error.message));
    }

    // Este punto no debería alcanzarse si toda la lógica anterior funciona,
    // pero como fallback, rechazamos con el error original.
    // return Promise.reject(error); // Comentado porque los casos anteriores cubren todo
  }
);

// Funciones Helper

/** con estos parametros se llena
 * @param url - La URL relativa al baseURL.
 * @param params - Parámetros de consulta opcionales.
 * @param data - El cuerpo de la petición.
 */

// Realiza una petición GET usando la instancia configurada de Axios.
export const get = <T = any>(url: string, params?: object): Promise<AxiosResponse<T>> => {
    return clienteApi.get<T>(url, { params });
};

//Realiza una petición POST usando la instancia configurada de Axios.

export const post = <T = any>(url: string, data?: object): Promise<AxiosResponse<T>> => {
    return clienteApi.post<T>(url, data);
};

//Realiza una petición PUT usando la instancia configurada de Axios.
export const put = <T = any>(url: string, data?: object): Promise<AxiosResponse<T>> => {
    return clienteApi.put<T>(url, data);
};

//Realiza una petición DELETE usando la instancia configurada de Axios.

export const del = <T = any>(url: string): Promise<AxiosResponse<T>> => {
    return clienteApi.delete<T>(url);
};


// Exportamos la instancia configurada para usarla en otros servicios (ej. kpiService)
export default clienteApi;

// También exportamos la función para guardar el token (Se usa en el AuthContext/Login)
/**
 * @param token - El token a guardar.
 * @returns Promise<void>
 */

//Guarda el token de autenticación de forma segura.
export const guardarToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(CLAVE_TOKEN_AUTH, token);
    console.log('[API Service] Token guardado exitosamente.');
  } catch (error) {
    console.error('[API Service] Error al guardar el token:', error);
    // Considera lanzar el error para que la UI pueda reaccionar
    throw new Error('No se pudo guardar la sesión de forma segura.');
  }
};

// Exportamos la función para borrar el token (la usaremos en el AuthContext/Logout)
// Elimina el token de autenticación del almacenamiento seguro.

export const borrarToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN_AUTH);
    console.log('[API Service] Token eliminado exitosamente.');
  } catch (error) {
    console.error('[API Service] Error al eliminar el token:', error);
    // Considera lanzar el error
    throw new Error('No se pudo cerrar la sesión de forma segura.');
  }
};