// Servicio para interactuar con los endpoints de la API relacionados con la autenticación.
import { post, get } from './api';
import ApiConstants from '../constants/Api';
import { Usuario } from '../types';
import { AxiosHeaders } from 'axios';

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
      ApiConstants.AUTH_LOGIN, 
      formData,
      {
        headers: new AxiosHeaders({ 'Content-Type': 'multipart/form-data' })
      }
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
    const { data } = await get<Usuario>(ApiConstants.USERS_ME);
    return data;
  } catch (error: any) {
    throw new Error('Error al obtener usuario actual: ' + error.message);
  }
};

//Registra un nuevo usuario en la API
export const registrarUsuario = async (
  datosRegistro: DatosRegistro
): Promise<RespuestaRegistro> => {
  console.log('[AuthService] Registrando usuario:', datosRegistro.email);
  
  try {
    const { data } = await post<RespuestaRegistro>(
      ApiConstants.USERS,
      datosRegistro
    );
    return data;
  } catch (error: any) {
    throw new Error('Error en registro: ' + error.response?.data?.detail || error.message);
  }
};

// Recuperación de contraseña =====================================================================

// Solicita recuperación de contraseña para un email
export const solicitarRecuperacionPassword = async (email: string): Promise<void> => {
  console.log('[AuthService] Solicitud recuperación para:', email);
  
  try {
    await post(ApiConstants.AUTH_FORGOT_PASSWORD, { email },
      {
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' })
      }
    );
  } catch (error: any) {
    throw new Error('Error en solicitud de recuperación: ' + error.message);
  }
};

export const restablecerPassword = async (
  token: string,
  nuevaPassword: string
): Promise<void> => {
  console.log('[AuthService] Restableciendo contraseña');
  
  try {
    await post(ApiConstants.AUTH_RESET_PASSWORD,
      {
        token,
        new_password: nuevaPassword
      },
      {
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' })
      }
    );
  } catch (error: any) {
    throw new Error('Error al restablecer contraseña: ' + error.message);
  }
};