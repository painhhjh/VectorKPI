/**
 * @file Define el Contexto de Autenticación y el Proveedor (AuthProvider).
 * @description Gestiona el estado de autenticación global (token, usuario, estado)
 * y proporciona funciones para iniciar y cerrar sesión.
 */
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
  useContext, // Importa useContext
} from 'react';
import * as SecureStore from 'expo-secure-store';
import clienteApi, { guardarToken, borrarToken, get } from '../services/api'; // Importa clienteApi y get
import ApiConstants from '../constants/Api';
import { Usuario } from '../types'; // Importa el tipo Usuario
import { useRouter } from 'expo-router'; // Importa useRouter para la navegación

// Clave para guardar/recuperar el token de autenticación de forma segura
const CLAVE_TOKEN_AUTH = 'authToken';

// Define los posibles estados del proceso de autenticación
type EstadoAutenticacion = 'idle' | 'cargando' | 'autenticado' | 'noAutenticado' | 'error';

// Define la forma de los datos que proporcionará el contexto
interface AuthContextData {
  token: string | null; // El token de autenticación JWT
  usuario: Usuario | null; // Información del usuario autenticado
  estado: EstadoAutenticacion; // El estado actual del proceso de autenticación
  error: string | null; // Mensaje de error si ocurre alguno
  iniciarSesion: (credenciales: Record<string, string>) => Promise<void>; // Función para login
  cerrarSesion: () => Promise<void>; // Función para logout
}

// Crea el Contexto de Autenticación
export const AuthContext = createContext<AuthContextData | undefined>(undefined);

// Define las props para el componente Proveedor
interface AuthProviderProps {
  children: ReactNode; // Los componentes hijos que tendrán acceso al contexto
}

// Componente Proveedor que encapsula la lógica de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [estado, setEstado] = useState<EstadoAutenticacion>('idle'); // Inicia en idle
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Hook para navegar

  // Función para obtener los datos del usuario actual
  const obtenerDatosUsuario = useCallback(async () => {
    console.log('[AuthContext] Obteniendo datos del usuario...');
    try {
      const respuesta = await get<Usuario>(ApiConstants.USERS_ME_ENDPOINT);
      setUsuario(respuesta.data);
      console.log('[AuthContext] Datos del usuario obtenidos:', respuesta.data.email);
      return respuesta.data; // Devuelve los datos del usuario
    } catch (err) {
      console.error('[AuthContext] Error obteniendo datos del usuario:', err);
      // Si falla obtener los datos del usuario, consideramos cerrar la sesión
      // ya que el token podría ser válido pero algo más está mal.
      await cerrarSesion(); // Llama a cerrar sesión para limpiar todo
      throw new Error('No se pudieron obtener los datos del usuario.'); // Lanza error para indicar fallo
    }
  }, []); // No tiene dependencias externas directas que cambien

  // Función para verificar si hay un token guardado al iniciar la app
  const verificarAutenticacion = useCallback(async () => {
    console.log('[AuthContext] Verificando autenticación inicial...');
    setEstado('cargando');
    setError(null);
    try {
      const tokenGuardado = await SecureStore.getItemAsync(CLAVE_TOKEN_AUTH);
      if (tokenGuardado) {
        console.log('[AuthContext] Token encontrado. Validando y obteniendo usuario...');
        setToken(tokenGuardado);
        // Importante: Añadimos el token a la instancia de Axios ANTES de llamar a obtenerDatosUsuario
        // Aunque el interceptor lo hace, es más seguro asegurarlo aquí para la primera carga.
        clienteApi.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`;
        await obtenerDatosUsuario(); // Obtiene datos del usuario
        setEstado('autenticado');
        console.log('[AuthContext] Autenticación inicial exitosa.');
      } else {
        console.log('[AuthContext] No se encontró token. Estado: noAutenticado.');
        setToken(null);
        setUsuario(null);
        setEstado('noAutenticado');
      }
    } catch (err: any) {
      console.error('[AuthContext] Error verificando token o obteniendo usuario:', err);
      setError(err.message || 'Error al verificar la sesión.');
      setEstado('error'); // Podría ser 'noAutenticado' también
      setToken(null);
      setUsuario(null);
      // Asegurarse de borrar token inválido si la verificación falló
      await borrarToken();
      clienteApi.defaults.headers.common['Authorization'] = ''; // Limpia header en instancia axios
    }
  }, [obtenerDatosUsuario]); // Depende de obtenerDatosUsuario

  // Ejecuta la verificación inicial cuando el componente se monta
  useEffect(() => {
    verificarAutenticacion();
  }, [verificarAutenticacion]);

  // Función para iniciar sesión
  const iniciarSesion = useCallback(async (credenciales: Record<string, string>) => {
    console.log('[AuthContext] Iniciando sesión...');
    setEstado('cargando');
    setError(null);
    try {
      // --- Envío como FormData para OAuth2PasswordRequestForm ---
      const formData = new FormData();
      // FastAPI espera 'username', mapeamos desde 'email'
      formData.append('username', credenciales.email);
      formData.append('password', credenciales.password);

      console.log('[AuthContext] Enviando FormData a', ApiConstants.AUTH_LOGIN_ENDPOINT);

      const respuesta = await clienteApi.post<{ access_token: string; token_type: string }>(
        ApiConstants.AUTH_LOGIN_ENDPOINT,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } } // Header crucial para FormData
      );
      // --- Fin Envío FormData ---

      const { access_token } = respuesta.data;

      if (access_token) {
        console.log('[AuthContext] Token recibido. Guardando y obteniendo usuario...');
        await guardarToken(access_token); // Guarda el token de forma segura
        setToken(access_token);
         // Añade el token a futuras peticiones (aunque el interceptor también lo hará)
         clienteApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        await obtenerDatosUsuario(); // Obtiene y guarda los datos del usuario

        setEstado('autenticado');
        console.log('[AuthContext] Inicio de sesión completado.');
        // La navegación se manejará en _layout.tsx basado en el cambio de 'estado'

      } else {
        throw new Error('La respuesta de la API no incluyó un token de acceso.');
      }
    } catch (err: any) {
      console.error('[AuthContext] Error al iniciar sesión:', err);
      await borrarToken(); // Borra cualquier token residual
      clienteApi.defaults.headers.common['Authorization'] = ''; // Limpia header
      setToken(null);
      setUsuario(null);
      // Establece un mensaje de error adecuado
      let mensajeError = 'Error desconocido al iniciar sesión.';
       if (err?.isAuthError) { // Error específico del interceptor 401
           mensajeError = err.message;
       } else if (err?.response?.data?.detail) {
           mensajeError = typeof err.response.data.detail === 'string'
               ? err.response.data.detail
               : JSON.stringify(err.response.data.detail); // Maneja posibles objetos de error
       } else if (typeof err?.message === 'string') {
           mensajeError = err.message;
       }
      setError(mensajeError);
      setEstado('error'); // Cambia a estado de error
      // Lanzar el error permite a la UI reaccionar si es necesario
      throw new Error(mensajeError); // Lanza un error con el mensaje procesado
    }
  }, [obtenerDatosUsuario]); // Depende de obtenerDatosUsuario

  // Función para cerrar sesión
  const cerrarSesion = useCallback(async () => {
    console.log('[AuthContext] Cerrando sesión...');
    try {
      await borrarToken(); // Elimina el token del almacenamiento seguro
    } catch (err) {
      console.error('[AuthContext] Error al borrar token en logout:', err);
      // Continuar de todas formas para limpiar el estado local
    } finally {
      // Siempre limpia el estado local y la instancia de axios
      clienteApi.defaults.headers.common['Authorization'] = '';
      setToken(null);
      setUsuario(null);
      setError(null); // Limpia errores previos
      setEstado('noAutenticado'); // Cambia estado a no autenticado
      console.log('[AuthContext] Sesión cerrada. Estado:', estado);
      // La navegación se manejará en _layout.tsx basado en el cambio de 'estado'
    }
  }, []); // No tiene dependencias que cambien

  // Memoriza el valor del contexto para evitar re-renders innecesarios
  // Asegúrate de que el router no esté en las dependencias si no es necesario
  const valorContexto = useMemo(() => ({
    token,
    usuario,
    estado,
    error,
    iniciarSesion,
    cerrarSesion,
  }), [token, usuario, estado, error, iniciarSesion, cerrarSesion]);

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado useAuth (sin cambios, pero lo incluimos por completitud)
export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (contexto === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return contexto;
};
