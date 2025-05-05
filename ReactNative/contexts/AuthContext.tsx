// Contexto de Autenticación para gestionar el estado del usuario y token. Provee información sobre el usuario autenticado y funciones para login/logout.
import React, {
    createContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    ReactNode,
} from 'react';
// Quitamos SecureStore, ya no se usa directamente aquí
import { Platform } from 'react-native'; // Podría ser útil para debug
import { router } from 'expo-router';
import { Usuario, TokenResponse } from '../types';
// Importa las funciones de almacenamiento agnósticas de plataforma
import { guardarToken, borrarToken, CLAVE_TOKEN_AUTH } from '../services/api';
import { iniciarSesion, obtenerUsuarioActual } from '../services/authService';

// --- Funciones getToken específicas de plataforma (duplicadas de api.ts para uso inicial) ---
// En una app más grande, podrías tener un módulo 'storageService' separado.
const getTokenContext = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(CLAVE_TOKEN_AUTH);
    } catch (e) {
      console.error('[AuthContext] Error al obtener token de localStorage:', e);
      return null;
    }
  } else {
    // Importa SecureStore solo si no es web
    const SecureStore = require('expo-secure-store');
    try {
      return await SecureStore.getItemAsync(CLAVE_TOKEN_AUTH);
    } catch (e) {
      console.error('[AuthContext] Error al obtener token de SecureStore:', e);
      return null;
    }
  }
};


interface AuthContextType {
    token: string | null;
    usuario: Usuario | null;
    isAuthenticated: boolean;
    isLoading: boolean; // Para saber si se está cargando el estado inicial
    login: (credenciales: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    // Estado más detallado podría ser útil
    estado: 'inicializando' | 'cargando-login' | 'autenticado' | 'noAutenticado' | 'error';
}

// Crea el contexto con un valor inicial undefined
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para el proveedor del contexto
interface AuthProviderProps {
    children: ReactNode;
}

// Componente Proveedor del Contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [estado, setEstado] = useState<AuthContextType['estado']>('inicializando');

    // Carga inicial del token y datos del usuario al montar el provider
    useEffect(() => {
        const loadAuthState = async () => {
            setEstado('inicializando');
            console.log('[AuthContext] Cargando estado inicial...');
            try {
                const storedToken = await getTokenContext(); // Usa la función correcta
                if (storedToken) {
                    console.log('[AuthContext] Token encontrado.');
                    setToken(storedToken);
                    try {
                        console.log('[AuthContext] Intentando obtener datos del usuario...');
                        const userData = await obtenerUsuarioActual();
                        setUsuario(userData);
                        setEstado('autenticado');
                        console.log('[AuthContext] Estado inicial: Autenticado.');
                    } catch (userError: any) {
                        console.error('[AuthContext] Error al obtener datos del usuario con token guardado:', userError);
                        if (userError.isAuthError || userError.status === 401) {
                            console.log('[AuthContext] Token inválido/expirado, borrando...');
                            await borrarToken();
                            setToken(null);
                            setUsuario(null);
                            setEstado('noAutenticado');
                        } else {
                            // Otro error (red?), mantenemos token pero sin usuario y marcamos error?
                            // O podríamos intentar de nuevo más tarde. Por ahora, no autenticado.
                            setEstado('noAutenticado'); // O un estado 'error-carga-usuario'?
                            console.warn('[AuthContext] Estado inicial: No autenticado (error al cargar usuario).');
                        }
                    }
                } else {
                    console.log('[AuthContext] No se encontró token. Estado inicial: No autenticado.');
                    setEstado('noAutenticado');
                }
            } catch (error) {
                console.error('[AuthContext] Error crítico al cargar estado de autenticación:', error);
                // Asegurarse de limpiar el estado si hay error al cargar
                setToken(null);
                setUsuario(null);
                setEstado('error'); // Estado de error genérico
            }
        };

        loadAuthState();
    }, []); // Se ejecuta solo una vez al montar

    // Función de Login
    const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
        console.log('[AuthContext] Intentando iniciar sesión...');
        setEstado('cargando-login'); // Estado específico para carga de login

        try {
            // 1. Llama al servicio para obtener el token
            const tokenData = await iniciarSesion({ email, password });
            // 2. Guarda el token de forma segura
            await guardarToken(tokenData.access_token); // Usa la función correcta
            // 3. Actualiza el estado del token
            setToken(tokenData.access_token);

            // 4. Obtiene los datos del usuario autenticado
            try {
                console.log('[AuthContext] Obteniendo datos del usuario post-login...');
                const userData = await obtenerUsuarioActual();
                setUsuario(userData);
                setEstado('autenticado');
                console.log('[AuthContext] Login exitoso y datos de usuario obtenidos.');
                // 5. Navega a la pantalla principal (dashboard)
                // Usamos replace para que el usuario no pueda volver atrás a la pantalla de login
                router.replace('/(tabs)/dashboard');
            } catch (userError) {
                 console.error('[AuthContext] Login exitoso pero falló al obtener datos del usuario:', userError);
                 // A pesar del error al obtener el usuario, el login fue exitoso (tenemos token)
                 // Podrías intentar obtener los datos de nuevo más tarde o mostrar un estado parcial.
                 // Por ahora, navegamos igual pero sin datos de usuario.
                 setUsuario(null); // Asegura que no queden datos viejos
                 setEstado('autenticado'); // Aún autenticado (tiene token), pero sin datos de usuario
                 router.replace('/(tabs)/dashboard'); // Navega igual
                 // Podrías lanzar una advertencia o reintentar obtener usuario más tarde
            }
        } catch (error: any) {
            console.error('[AuthContext] Falló el inicio de sesión:', error);
            await borrarToken(); // Asegura que no quede token inválido
            setToken(null);
            setUsuario(null);
            setEstado('noAutenticado'); // Vuelve a no autenticado
            // Relanza el error para que el componente LoginForm lo muestre
            throw error;
        }
    }, []); // Dependencias vacías si las funciones externas no cambian

    const logout = useCallback(async () => {
        console.log('[AuthContext] Realizando logout...');
        await borrarToken(); // Usa la función correcta
        setToken(null);
        setUsuario(null);
        setEstado('noAutenticado');
        router.replace('/(auth)/login'); // Redirige a login
        console.log('[AuthContext] Logout completado.');
    }, []);

    // --- Manejo de errores 401 detectados por el interceptor ---
    // El interceptor ya borra el token. El contexto debe reaccionar cuando una
    // llamada a un servicio (ej. obtenerKpis) falle con `isAuthError: true`.
    // La forma más común es que el componente que hace la llamada detecte el error
    // y llame a `logout()` desde el contexto.
    // No se necesita lógica adicional *dentro* del contexto para esto,
    // solo asegurar que `logout` esté disponible y sea llamado externamente.

    // Valor del contexto que se pasará a los consumidores
    const authContextValue: AuthContextType = useMemo(
        () => ({
            token,
            usuario,
            isAuthenticated: estado === 'autenticado', // Basado en el estado
            isLoading: estado === 'inicializando' || estado === 'cargando-login', // Verdadero si está inicializando o logueando
            login,
            logout,
            estado, // Expone el estado detallado
        }),
        [token, usuario, estado, login, logout]
    );

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};