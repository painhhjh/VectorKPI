// ReactNative/services/authService.ts
// Servicio para interactuar con los endpoints de la API relacionados con la autenticación.

import { post, get } from './api';
import ApiConstants from '../constants/Api';
import { Usuario, TokenResponse } from '../types';
import { AxiosHeaders } from 'axios'; // Quitamos 'axios' si no se usa directamente aquí
import { Platform } from 'react-native'; // Necesario para la lógica de almacenamiento

// Tipos (Asegúrate que RespuestaRegistro esté definida o impórtala si es necesario)
interface DatosRegistro {
  email: string;
  password: string;
  nombre?: string; // Revisar si se usa/envía correctamente
}

interface DatosLogin {
  email: string;
  password: string;
}

interface RespuestaRegistro {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

// --- Funciones Helper para construir URL (alternativa) ---
const buildUrl = (endpoint: string): string => {
  // Asegura que no haya doble barra si endpoint empieza con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  // Asegura que BASE_URL no termine en / y une con /
  const cleanBaseUrl = ApiConstants.BASE_URL.endsWith('/')
    ? ApiConstants.BASE_URL.slice(0, -1)
    : ApiConstants.BASE_URL;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};
// Nota: Axios maneja esto automáticamente si baseURL está bien configurada.
// El problema anterior era probable por cómo se logueaba o un error en baseURL/constantes.
// Mantendremos el paso de rutas relativas a axios por ahora.

// Funciones principales

export const iniciarSesion = async (credenciales: DatosLogin): Promise<TokenResponse> => {
  const url = ApiConstants.AUTH_LOGIN; // Ruta relativa
  console.log(`[AuthService] Iniciando sesión para: ${credenciales.email} en ${ApiConstants.BASE_URL}/${url}`); // Log con URL completa
  try {
    const params = new URLSearchParams();
    params.append('username', credenciales.email);
    params.append('password', credenciales.password);

    const { data } = await post<TokenResponse>(
      url,
      params,
    );

    console.log('[AuthService] Login exitoso, token recibido.');
    return data;

  } catch (error: any) {
    console.error(`[AuthService] Error en iniciarSesion (${url}):`, error.message || error);
    throw new Error(error.message || 'Error de conexión o al intentar iniciar sesión.');
  }
};

export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  const url = ApiConstants.USER_ME; // Ruta relativa
  console.log(`[AuthService] Obteniendo usuario actual desde ${ApiConstants.BASE_URL}/${url}...`);
  try {
    const { data } = await get<Usuario>(url);
    console.log('[AuthService] Datos de usuario obtenidos:', data.email);
    // TODO: Mapear data a la interfaz Usuario si es necesario (ej. is_active -> isActive)
    return data as Usuario; // Asumimos que coincide por ahora
  } catch (error: any) {
    console.error(`[AuthService] Error al obtener usuario actual (${url}):`, error.message || error);
    throw new Error(error.message || 'No se pudieron obtener los datos del usuario.');
  }
};

export const registrarUsuario = async (
  datosRegistro: DatosRegistro
): Promise<RespuestaRegistro> => {
  const url = ApiConstants.USER; // Ruta relativa
  console.log(`[AuthService] Registrando usuario: ${datosRegistro.email} en ${ApiConstants.BASE_URL}/${url}`);
  try {
    const { data } = await post<RespuestaRegistro>(
      url,
      datosRegistro // Envía JSON
    );
    console.log('[AuthService] Registro exitoso para:', datosRegistro.email);
    return data;
  } catch (error: any) {
    console.error(`[AuthService] Error en registrarUsuario (${url}):`, error.message || error);
    throw new Error(error.message || 'Ocurrió un error durante el registro.');
  }
};

export const solicitarRecuperacionPassword = async (email: string): Promise<{ msg: string }> => {
  const url = ApiConstants.AUTH_FORGOT_PASSWORD; // Ruta relativa
  console.log(`[AuthService] Solicitando recuperación para: ${email} en ${ApiConstants.BASE_URL}/${url}`);
  try {
    const { data } = await post<{ msg: string }>(
      url,
      { email: email }, // Envía JSON
      {
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' })
      }
    );
    console.log('[AuthService] Solicitud de recuperación enviada con éxito.');
    return data;
  } catch (error: any) {
    console.error(`[AuthService] Error en solicitarRecuperacionPassword (${url}):`, error.message || error);
    throw new Error(error.message || 'Error al solicitar la recuperación de contraseña.');
  }
};

export const restablecerPassword = async (
  token: string,
  nuevaPassword: string
): Promise<{ msg: string }> => {
  const url = ApiConstants.AUTH_RESET_PASSWORD; // Ruta relativa
  console.log(`[AuthService] Restableciendo contraseña en ${ApiConstants.BASE_URL}/${url}`);
  try {
    const { data } = await post<{ msg: string }>(
      url,
      { token: token, new_password: nuevaPassword }, // Envía JSON
      {
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' })
      }
    );
    console.log('[AuthService] Contraseña restablecida con éxito.');
    return data;
  } catch (error: any) {
    console.error(`[AuthService] Error en restablecerPassword (${url}):`, error.message || error);
    throw new Error(error.message || 'Error al restablecer la contraseña.');
  }
};