// ReactNative/services/authService.ts
// Servicio para interactuar con los endpoints de la API relacionados con la autenticación.

import { post, get, put } from './api';
import ApiConstants from '../constants/Api';
import { Usuario, TokenResponse } from '../types';
import { AxiosHeaders } from 'axios';
import { Platform } from 'react-native';

// Tipos
interface DatosRegistro {
  email: string;
  password: string;
  profile: {
    full_name: string;
  };
}

interface DatosLogin {
  email: string;
  password: string;
}

interface RespuestaRegistro {
  id: number;
  email: string;
  profile: {
    full_name: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

interface DatosActualizacionUsuario {
  email?: string;
  password?: string;
  profile?: {
    full_name?: string;
  };
}

export const actualizarUsuario = async (datos: DatosActualizacionUsuario): Promise<Usuario> => {
  try {
    const { data } = await put<Usuario>(ApiConstants.USER_ME, datos);
    console.log("Usuario actualizado:", data);
    return data;
  } catch (error: any) {
    console.error('[AuthService] Error al actualizar usuario:', error);
    // Manejo de errores
    throw new Error(error.response?.data?.detail || 'Error al actualizar perfil');
  }
};

// --- Funciones Helper para construir URL (se mantiene como referencia) ---
const buildUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const cleanBaseUrl = ApiConstants.BASE_URL.endsWith('/')
    ? ApiConstants.BASE_URL.slice(0, -1)
    : ApiConstants.BASE_URL;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

// Funciones principales
export const iniciarSesion = async (credenciales: DatosLogin): Promise<TokenResponse> => {
  const url = ApiConstants.AUTH_LOGIN;
  console.log(`[AuthService] Iniciando sesión para: ${credenciales.email} en ${ApiConstants.BASE_URL}${url}`);
  try {
    const params = new URLSearchParams();
    params.append('username', credenciales.email);
    params.append('password', credenciales.password);

    const { data } = await post<TokenResponse>(
      url,
      params,
      {
        headers: new AxiosHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      }
    );

    console.log('[AuthService] Login exitoso, token recibido.');
    return data;

  } catch (error: any) {
    console.error(`[AuthService] Error en iniciarSesion:`, error.message || error);
    throw new Error(error.response?.data?.detail || 'Error de conexión o al iniciar sesión');
  }
};

export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  const url = ApiConstants.USER_ME;
  console.log(`[AuthService] Obteniendo usuario actual desde ${ApiConstants.BASE_URL}${url}...`);
  try {
    const { data } = await get<Usuario>(url);
    console.log('[AuthService] Datos de usuario obtenidos:', data.email);
    return data as Usuario;
  } catch (error: any) {
    console.error(`[AuthService] Error al obtener usuario actual:`, error.message || error);
    throw new Error(error.response?.data?.detail || 'No se pudieron obtener los datos del usuario');
  }
};

export const registrarUsuario = async (
  datosRegistro: DatosRegistro
): Promise<RespuestaRegistro> => {
  const url = ApiConstants.USER;
  console.log(`[AuthService] Registrando usuario: ${datosRegistro.email} en ${ApiConstants.BASE_URL}${url}`);
  try {
    const { data } = await post<RespuestaRegistro>(
      url,
      datosRegistro
    );
    console.log('[AuthService] Registro exitoso para:', datosRegistro.email);
    return data;
  } catch (error: any) {
    console.error(`[AuthService] Error en registrarUsuario:`, error.message || error);
    throw new Error(error.response?.data?.detail || 'Error durante el registro');
  }
};

export const solicitarRecuperacionPassword = async (email: string): Promise<{ msg: string }> => {
  const url = ApiConstants.AUTH_FORGOT_PASSWORD;
  console.log(`[AuthService] Solicitando recuperación para: ${email} en ${ApiConstants.BASE_URL}${url}`);
  try {
    const { data } = await post<{ msg: string }>(
      url,
      { email: email },
      {
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' })
      }
    );
    console.log('[AuthService] Solicitud de recuperación enviada con éxito.');
    return data;
  } catch (error: any) {
    console.error(`[AuthService] Error en solicitarRecuperacionPassword:`, error.message || error);
    throw new Error(error.response?.data?.detail || 'Error al solicitar recuperación');
  }
};

export const restablecerPassword = async (
  token: string,
  nuevaPassword: string
): Promise<{ msg: string }> => {
  const url = ApiConstants.AUTH_RESET_PASSWORD;
  console.log(`[AuthService] Restableciendo contraseña en ${ApiConstants.BASE_URL}${url}`);
  try {
    const { data } = await post<{ msg: string }>(
      url,
      { token: token, new_password: nuevaPassword },
      {
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' })
      }
    );
    console.log('[AuthService] Contraseña restablecida con éxito.');
    return data;
  } catch (error: any) {
    console.error(`[AuthService] Error en restablecerPassword:`, error.message || error);
    throw new Error(error.response?.data?.detail || 'Error al restablecer contraseña');
  }
};