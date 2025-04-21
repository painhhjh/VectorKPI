// Servicio para interactuar con los endpoints de la API relacionados con la autenticación.
// Define funciones para registrar usuarios y solicitar recuperación de contraseña.

import { post } from './api';
import ApiConstants from '../constants/Api';
import { Usuario } from '../types';

// Define la estructura esperada para los datos de registro
// Ajusta esto según los campos que requiera tu API
interface DatosRegistro {
  email: string;
  password?: string; // La contraseña podría no enviarse directamente si hay confirmación
  nombre?: string;
  // otros campos como 'confirmPassword' no suelen enviarse a la API
}

// Define la estructura esperada para la respuesta de registro (si la hay)
// Puede ser solo un mensaje de éxito o el objeto Usuario creado
interface RespuestaRegistro {
  // Ejemplo: podría devolver el usuario creado
   usuario?: Usuario;
   mensaje?: string;
}

//Registra un nuevo usuario en la API.

export const registrarUsuario = async (
    datosRegistro: DatosRegistro
): Promise<RespuestaRegistro> => {
  console.log('[AuthService] Registrando nuevo usuario:', datosRegistro.email);
  try {
    // Realiza la petición POST al endpoint de registro
    // Asegúrate que el cuerpo de la petición coincida con lo que espera tu backend
    const respuesta = await post<RespuestaRegistro>(
        ApiConstants.AUTH_REGISTER_ENDPOINT,
        datosRegistro // Envía los datos requeridos
    );

    console.log('[AuthService] Respuesta de registro:', respuesta.data);
    return respuesta.data; // Devuelve la respuesta de la API

  } catch (error: any) {
    console.error('[AuthService] Error al registrar usuario:', error);
    // Relanza el error para que el componente que llama pueda manejarlo
    // El interceptor de 'api.ts' ya podría haber formateado el error.
    throw error;
  }
};

//Solicita la recuperación de contraseña para un email dado.

export const solicitarRecuperacionPassword = async (
    email: string
): Promise<void> => {
  console.log('[AuthService] Solicitando recuperación de contraseña para:', email);
  try {
    // Realiza la petición POST al endpoint de recuperación
    await post<void>( // Esperamos una respuesta vacía (ej. 200 OK o 204 No Content)
        ApiConstants.AUTH_FORGOT_PASSWORD_ENDPOINT,
        { email } // Cuerpo de la petición
    );

    console.log('[AuthService] Solicitud de recuperación enviada exitosamente.');
    // No se devuelve nada en caso de éxito

  } catch (error: any) {
    console.error('[AuthService] Error al solicitar recuperación de contraseña:', error);
    // Relanza el error
    throw error;
  }
};

//Restablece la contraseña de un usuario utilizando un token de recuperación.
export const restablecerPassword = async (
  token: string,
  nuevaPassword: string
): Promise<void> => {
  console.log('[AuthService] Restableciendo contraseña con token:', token);
  try {
  // Realiza la petición POST al endpoint de restablecimiento de contraseña
  await post<void>(
    ApiConstants.AUTH_RESET_PASSWORD_ENDPOINT,
    { token, nuevaPassword } // Cuerpo de la petición
  );

  console.log('[AuthService] Contraseña restablecida exitosamente.');
  // No se devuelve nada en caso de éxito

  } catch (error: any) {
  console.error('[AuthService] Error al restablecer contraseña:', error);
  // Relanza el error
  throw error;
  }
};