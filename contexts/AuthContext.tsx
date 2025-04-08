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
  } from 'react';
  import * as SecureStore from 'expo-secure-store';
  import { post as apiPost, guardarToken, borrarToken, CLAVE_TOKEN_AUTH } from '../services/api';
  import ApiConstants from '../constants/Api';
  import { Usuario } from '../types';
  
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
  // Usamos 'undefined' como valor inicial y lo verificamos en el hook useAuth
  export const AuthContext = createContext<AuthContextData | undefined>(undefined);
  
  // Define las props para el componente Proveedor
  interface AuthProviderProps {
    children: ReactNode; // Los componentes hijos que tendrán acceso al contexto
  }
  
  // Componente Proveedor que encapsula la lógica de autenticación
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [estado, setEstado] = useState<EstadoAutenticacion>('cargando'); // Inicia cargando mientras verifica el token
    const [error, setError] = useState<string | null>(null);
  
    // Función para verificar si hay un token guardado al iniciar la app
    const verificarAutenticacion = useCallback(async () => {
      console.log('[AuthContext] Verificando autenticación inicial...');
      setEstado('cargando');
      setError(null);
      try {
        const tokenGuardado = await SecureStore.getItemAsync(CLAVE_TOKEN_AUTH);
        if (tokenGuardado) {
          console.log('[AuthContext] Token encontrado. Estado: autenticado.');
          setToken(tokenGuardado);
          // Idealmente, aquí también deberías obtener los datos del usuario
          // haciendo una llamada a un endpoint como /users/me usando el token.
          // Por ahora, solo establecemos el token.
          // Ejemplo: const { data } = await apiGet<Usuario>('/users/me'); setUsuario(data);
          setUsuario(null); // Establece a null o carga datos del usuario si es posible
          setEstado('autenticado');
        } else {
          console.log('[AuthContext] No se encontró token. Estado: noAutenticado.');
          setToken(null);
          setUsuario(null);
          setEstado('noAutenticado');
        }
      } catch (err) {
        console.error('[AuthContext] Error verificando token:', err);
        setError('Error al verificar la sesión anterior.');
        setEstado('error');
        setToken(null);
        setUsuario(null);
      }
    }, []);
  
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
        // Llama al endpoint de login de tu API (ajusta la URL y el cuerpo según tu backend)
        // FastAPI suele usar form data para /token, ajusta si usas JSON
        const formData = new URLSearchParams();
        formData.append('username', credenciales.email); // o el campo que use tu backend
        formData.append('password', credenciales.password);
  
/*         const respuesta = await apiPost<{ access_token: string; token_type: string; user?: Usuario }>(
          ApiConstants.AUTH_LOGIN_ENDPOINT,
          formData, // Envía como form data
          // Si tu backend espera JSON:
          // credenciales,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } // Header para form data
          // Si tu backend espera JSON, no necesitas este header extra si ya está en defaults
        ); */

        const respuesta = await apiPost<{ access_token: string; token_type: string; user?: Usuario }>(
          ApiConstants.AUTH_LOGIN_ENDPOINT,
          {
            data: formData, // Envía como form data
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // Header para form data
          }
          // Si tu backend espera JSON, no necesitas este header extra si ya está en defaults
        );
  
        const { access_token, user } = respuesta.data; // Asume que la API devuelve el token y opcionalmente el usuario
  
        if (access_token) {
          console.log('[AuthContext] Inicio de sesión exitoso.');
          await guardarToken(access_token); // Guarda el token de forma segura
          setToken(access_token);
          setUsuario(user || null); // Guarda los datos del usuario si la API los devuelve
          setEstado('autenticado');
        } else {
          throw new Error('La respuesta de la API no incluyó un token de acceso.');
        }
      } catch (err: any) {
        console.error('[AuthContext] Error al iniciar sesión:', err);
        // Borra cualquier token residual por si acaso
        await borrarToken();
        setToken(null);
        setUsuario(null);
        // Establece un mensaje de error adecuado
        if (err.response?.data?.detail) { // Intenta obtener un mensaje más específico de FastAPI
          setError(err.response.data.detail);
        } else {
          setError(err.message || 'Error desconocido al iniciar sesión.');
        }
        setEstado('error');
        // Importante: Lanzar el error permite a la UI reaccionar si es necesario (ej. mostrar Toast)
        throw err;
      }
    }, []);
  
    // Función para cerrar sesión
    const cerrarSesion = useCallback(async () => {
      console.log('[AuthContext] Cerrando sesión...');
      setEstado('cargando'); // Puede ser 'cargando' o directamente 'noAutenticado'
      setError(null);
      try {
        await borrarToken(); // Elimina el token del almacenamiento seguro
      } catch (err) {
        console.error('[AuthContext] Error al borrar token en logout:', err);
        // Decide si este error debe prevenir el cambio de estado
      } finally {
        // Siempre limpia el estado local, incluso si borrarToken falla
        setToken(null);
        setUsuario(null);
        setEstado('noAutenticado');
        console.log('[AuthContext] Sesión cerrada.');
      }
    }, []);
  
    // Memoriza el valor del contexto para evitar re-renders innecesarios
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