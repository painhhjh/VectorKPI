// Servicio para interactuar con los endpoints de la API relacionados con la autenticación.
import { post, get } from './api';
import ApiConstants from '../constants/Api';
import { Usuario } from '../types';

// Tipos ==========================================================================================
interface DatosRegistro {
  email: string;
  password: string;
  nombre?: string;
}

interface DatosLogin {
  email: string;
  password: string;
}

interface RespuestaToken {
  access_token: string;
  token_type: string;
}

interface RespuestaRegistro {
  mensaje: string;
  id: string;
  email: string;
  nombre?: string;
  is_active?: boolean;
}

// Funciones principales

//Inicia sesión en la API y devuelve el token JWT
export const iniciarSesion = async (credenciales: DatosLogin): Promise<RespuestaToken> => {
  try {
    const formData = new FormData();
    formData.append('username', credenciales.email);
    formData.append('password', credenciales.password);
    
    const { data } = await post<RespuestaToken>(
      ApiConstants.AUTH_LOGIN_ENDPOINT, 
      formData
    );
    
    return data;  // <-- Devuelve todo el objeto token
  } catch (error) {
    console.error('[AuthService] Error:', error);
    throw error;
  }
};

//Obtiene los datos del usuario actual autenticado

export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  console.log('[AuthService] Obteniendo usuario actual');
  
  try {
    const respuesta = await get<Usuario>(ApiConstants.USERS_ME_ENDPOINT);
    return respuesta.data;

  } catch (error: any) {
    console.error('[AuthService] Error al obtener usuario:', error);
    throw error;
  }
};

//Registra un nuevo usuario en la API
export const registrarUsuario = async (
  datosRegistro: DatosRegistro
): Promise<RespuestaRegistro> => {
  console.log('[AuthService] Registrando usuario:', datosRegistro.email);
  
  try {
    const respuesta = await post<RespuestaRegistro>(
      ApiConstants.AUTH_REGISTER_ENDPOINT,
      {
        email: datosRegistro.email,
        password: datosRegistro.password,
        ...(datosRegistro.nombre && { nombre: datosRegistro.nombre })
      }
    );

    console.log('[AuthService] Registro exitoso:', respuesta.data);
    return respuesta.data;

  } catch (error: any) {
    console.error('[AuthService] Error en registro:', error);
    throw error;
  }
};

// Recuperación de contraseña =====================================================================

// Solicita recuperación de contraseña para un email
export const solicitarRecuperacionPassword = async (email: string): Promise<void> => {
  console.log('[AuthService] Solicitud recuperación para:', email);
  
  try {
    await post(ApiConstants.AUTH_FORGOT_PASSWORD_ENDPOINT, { email });
    console.log('[AuthService] Solicitud enviada exitosamente');

  } catch (error: any) {
    console.error('[AuthService] Error en solicitud:', error);
    throw error;
  }
};

//Restablece la contraseña usando un token de recuperación

export const restablecerPassword = async (
  token: string,
  nuevaPassword: string
): Promise<void> => {
  console.log('[AuthService] Restableciendo contraseña');
  
  try {
    await post(ApiConstants.AUTH_RESET_PASSWORD_ENDPOINT, {
      token,
      new_password: nuevaPassword
    });
    
    console.log('[AuthService] Contraseña actualizada');

  } catch (error: any) {
    console.error('[AuthService] Error en restablecimiento:', error);
    throw error;
  }
};