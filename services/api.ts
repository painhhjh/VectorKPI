/*
    Configuración centralizada del cliente HTTP (axios) para interactuar con la API.
    Establece la URL base, interceptores para tokens y manejo de errores.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import ApiConstants from '../constants/Api';

// Clave para guardar/recuperar el token de autenticación de forma segura
const CLAVE_TOKEN_AUTH = 'authToken';

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
      const { status, data, config } = error.response;
      const originalRequest = config; // La configuración de la petición original

      if (status === 401) {
        // Error de autenticación (Token inválido, expirado, etc.)
        console.warn('[API Interceptor Res] Error 401 - No autorizado.');

        // --- Lógica para manejar el 401 ---
        // 1. Intentar refrescar el token (si aplica y no es la petición de refresh la que falló)
        //    (Esta lógica se añadiría aquí si tu API soporta refresh tokens)
        //    const
        //    if (originalRequest.url !== ApiConstants.AUTH_REFRESH_ENDPOINT) { ... }

        // 2. Si no hay refresh token o falla, borrar el token local y señalar error.
        try {
          console.log('[API Interceptor Res] Borrando token local debido a error 401.');
          await borrarToken(); // Llama a la función que usa SecureStore.deleteItemAsync
          // Podrías emitir un evento global aquí si prefieres ese enfoque:
          // eventEmitter.emit('logoutRequired');
        } catch (deleteError) {
          console.error('[API Interceptor Res] Error al borrar el token después de un 401:', deleteError);
        }

        // 3. Rechazar la promesa con un error específico para que AuthContext lo maneje.
        //    Esto evita acoplar el servicio API con la lógica de navegación/estado global.
        const authError = new Error('Sesión inválida o expirada. Por favor, inicia sesión de nuevo.');
        // Puedes añadir propiedades adicionales al error si es útil
        (authError as any).isAuthError = true;
        (authError as any).status = 401;
        return Promise.reject(authError);

      } else if (status === 403) {
        // Error de autorización (Usuario autenticado pero sin permisos para el recurso)
        console.warn('[API Interceptor Res] Error 403 - Prohibido.');
        // Podrías mostrar un mensaje al usuario indicando falta de permisos.
      } else if (status >= 500) {
        // Error del servidor
        console.error('[API Interceptor Res] Error del servidor:', status);
        // Podrías mostrar un mensaje genérico de error del servidor.
      }
      // Puedes añadir manejo para otros códigos de error (400, 404, etc.)

      // Intentamos devolver un error más estructurado si es posible para otros casos
      // Asegúrate de que 'data' sea un objeto o proporciona un mensaje predeterminado
      const errorData = (typeof data === 'object' && data !== null) ? data : { message: error.message || 'Error desconocido' };
      return Promise.reject(errorData);


    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta (ej. problema de red, timeout)
      console.error('[API Interceptor Res] No se recibió respuesta del servidor:', error.request);
      // Podrías devolver un error indicando problema de conexión.
      return Promise.reject(new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.'));
    } else {
      // Ocurrió un error al configurar la petición que disparó un Error
      console.error('[API Interceptor Res] Error al configurar la petición:', error.message);
    }

    // Rechaza la promesa con el error original si no fue manejado específicamente
    return Promise.reject(error);
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