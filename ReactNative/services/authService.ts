// Servicio para interactuar con los endpoints de la API relacionados con la autenticación.
import { post, get } from './api';
import ApiConstants from '../constants/Api';
import { Usuario, TokenResponse } from '../types'; // Asegúrate que TokenResponse esté exportado desde types/index.ts
import axios, { AxiosHeaders } from 'axios'; // Importa axios para crear URLSearchParams

// Tipos (Asegúrate que RespuestaRegistro esté definida o impórtala si es necesario)
interface DatosRegistro {
  email: string;
  password: string;
  nombre?: string;
}

interface DatosLogin {
  email: string;
  password: string;
}

// Asumiendo que RespuestaRegistro está definida en algún lugar, por ejemplo:
interface RespuestaRegistro {
  mensaje: string;
  id: string | number; // Ajusta el tipo si es necesario
  email: string;
  nombre?: string;
  is_active?: boolean;
}

// Funciones principales

/**
 * Inicia sesión en la API y devuelve el token JWT.
 * CORRECCIÓN: Se envía como 'application/x-www-form-urlencoded' que es lo estándar para OAuth2.
 */
export const iniciarSesion = async (credenciales: DatosLogin): Promise<TokenResponse> => {
  try {
    // Usa URLSearchParams para formatear como x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', credenciales.email); // FastAPI espera 'username' por defecto
    params.append('password', credenciales.password);

    console.log('[AuthService] Iniciando sesión para:', credenciales.email);

    // Realiza la petición POST
    const { data } = await post<TokenResponse>(
      ApiConstants.AUTH_LOGIN,
      params, // Envía los parámetros codificados
      {
        // Axios adapta el Content-Type automáticamente para URLSearchParams
        // pero podemos ser explícitos si es necesario:
        headers: new AxiosHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
      }
    );

    console.log('[AuthService] Login exitoso, token recibido.');
    return data; // Devuelve la respuesta completa del token (access_token, token_type)

  } catch (error: any) {
    // Propaga el error original procesado por el interceptor de api.ts
    // El interceptor ya debería haber formateado el mensaje de error.
    console.error('[AuthService] Error en iniciarSesion:', error.message || error);
    // Si el error viene del interceptor, ya tendrá un mensaje útil.
    // Si no, creamos uno genérico.
    throw new Error(error.message || 'Error al intentar iniciar sesión.');
  }
};

/**
 * Obtiene los datos del usuario actual autenticado.
 * (Sin cambios aparentes necesarios aquí, pero revisa la implementación de get y el interceptor)
 */
export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  console.log('[AuthService] Obteniendo usuario actual...');
  try {
    const { data } = await get<Usuario>(ApiConstants.USERS_ME);
    console.log('[AuthService] Datos de usuario obtenidos:', data.email);
    return data;
  } catch (error: any) {
    console.error('[AuthService] Error al obtener usuario actual:', error.message || error);
    // Propaga el error procesado por el interceptor
    throw new Error(error.message || 'No se pudieron obtener los datos del usuario.');
  }
};

/**
 * Registra un nuevo usuario en la API.
 * CORRECCIÓN: Mejora el manejo de errores para evitar el 'undefined'.
 */
export const registrarUsuario = async (
  datosRegistro: DatosRegistro
): Promise<RespuestaRegistro> => {
  console.log('[AuthService] Registrando usuario:', datosRegistro.email);
  try {
    // La petición POST envía JSON por defecto, lo cual suele ser correcto para crear recursos.
    const { data } = await post<RespuestaRegistro>(
      ApiConstants.USERS,
      datosRegistro // Envía el objeto JS directamente, Axios lo serializa a JSON
    );
    console.log('[AuthService] Registro exitoso para:', datosRegistro.email);
    return data;
  } catch (error: any) {
    console.error('[AuthService] Error en registrarUsuario:', error.message || error);
    // Propaga el error procesado por el interceptor o crea uno genérico.
    // El interceptor debería dar prioridad a error.response.data.detail si existe.
    throw new Error(error.message || 'Ocurrió un error durante el registro.');
  }
};


// --- Recuperación de contraseña ---

/**
 * Solicita recuperación de contraseña para un email.
 * CORRECCIÓN: Asegura que el Content-Type sea 'application/json' y mejora el manejo de errores.
 */
export const solicitarRecuperacionPassword = async (email: string): Promise<{ mensaje: string }> => {
  console.log('[AuthService] Solicitando recuperación para:', email);
  try {
    // Envía el email como un objeto JSON
    const { data } = await post<{ mensaje: string }>( // Espera una respuesta con un mensaje
      ApiConstants.AUTH_FORGOT_PASSWORD,
      { email: email }, // Cuerpo de la petición como objeto JSON
      {
        // Asegura el Content-Type correcto (aunque Axios suele hacerlo bien por defecto para objetos)
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' })
      }
    );
    console.log('[AuthService] Solicitud de recuperación enviada con éxito.');
    return data; // Devuelve la respuesta del backend (ej: { mensaje: "..." })

  } catch (error: any) {
    console.error('[AuthService] Error en solicitarRecuperacionPassword:', error.message || error);
    // Propaga el error procesado por el interceptor (que manejará el 404)
    // o crea uno genérico.
    throw new Error(error.message || 'Error al solicitar la recuperación de contraseña.');
  }
};

/**
 * Restablece la contraseña usando un token y la nueva contraseña.
 * (Sin cambios aparentes necesarios aquí, pero revisa la implementación)
 */
export const restablecerPassword = async (
  token: string,
  nuevaPassword: string
): Promise<{ mensaje: string }> => { // Asume que devuelve un mensaje
  console.log('[AuthService] Restableciendo contraseña...');
  try {
    const { data } = await post<{ mensaje: string }>( // Espera una respuesta con un mensaje
      ApiConstants.AUTH_RESET_PASSWORD,
      {
        token: token,
        new_password: nuevaPassword
      },
      {
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' })
      }
    );
    console.log('[AuthService] Contraseña restablecida con éxito.');
    return data;
  } catch (error: any) {
    console.error('[AuthService] Error en restablecerPassword:', error.message || error);
    throw new Error(error.message || 'Error al restablecer la contraseña.');
  }
};