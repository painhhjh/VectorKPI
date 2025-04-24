// Contexto de Autenticación para gestionar el estado del usuario y token. Provee información sobre el usuario autenticado y funciones para login/logout.
import React, {
    createContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router'; // Para navegación programática
import { Usuario, TokenResponse } from '../types'; // Tipos necesarios
import { CLAVE_TOKEN_AUTH, guardarToken, borrarToken } from '../services/api'; // Funciones de token
import { iniciarSesion, obtenerUsuarioActual } from '../services/authService'; // Funciones de autenticación

// Define la forma del contexto
interface AuthContextType {
    token: string | null;
    usuario: Usuario | null;
    isAuthenticated: boolean;
    isLoading: boolean; // Para saber si se está cargando el estado inicial
    login: (credenciales: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    estado:  'cargando' | 'idle' | 'autenticado' | 'noAutenticado' | 'error';
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
    const [isLoading, setIsLoading] = useState(true); // Empieza cargando

    // Carga inicial del token y datos del usuario al montar el provider
    useEffect(() => {
        const loadAuthState = async () => {
            setIsLoading(true);
            try {
                const storedToken = await SecureStore.getItemAsync(CLAVE_TOKEN_AUTH);
                if (storedToken) {
                    console.log('[AuthContext] Token encontrado en SecureStore.');
                    setToken(storedToken);
                    // Si hay token, intenta obtener los datos del usuario
                    try {
                        const userData = await obtenerUsuarioActual(); // Llama a /users/me
                        setUsuario(userData);
                        console.log('[AuthContext] Datos del usuario cargados.');
                    } catch (userError: any) {
                        console.error('[AuthContext] Error al obtener datos del usuario con token guardado:', userError);
                        // Si falla obtener el usuario (ej. token expirado/inválido), borra el token local
                        if (userError.status === 401 || userError.isAuthError) {
                            await borrarToken();
                            setToken(null);
                            setUsuario(null);
                        }
                        // Podrías mantener el token si el error es de red, pero es más simple limpiar
                    }
                } else {
                    console.log('[AuthContext] No se encontró token en SecureStore.');
                }
            } catch (error) {
                console.error('[AuthContext] Error al cargar estado de autenticación:', error);
                // Asegurarse de limpiar el estado si hay error al cargar
                setToken(null);
                setUsuario(null);
            } finally {
                setIsLoading(false); // Termina la carga inicial
            }
        };

        loadAuthState();
    }, []); // Se ejecuta solo una vez al montar

    // Función de Login
    const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
        console.log('[AuthContext] Intentando iniciar sesión...');
        try {
            // 1. Llama al servicio para obtener el token
            const tokenData: TokenResponse = await iniciarSesion({ email, password });

            // 2. Guarda el token de forma segura
            await guardarToken(tokenData.access_token);

            // 3. Actualiza el estado del token
            setToken(tokenData.access_token);

            // 4. Obtiene los datos del usuario autenticado
            try {
                const userData = await obtenerUsuarioActual();
                setUsuario(userData);
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
                 router.replace('/(tabs)/dashboard');
                 // O podrías decidir hacer logout si obtener el usuario es crítico
                 // await logout(); throw new Error("No se pudieron obtener los datos del usuario.");
            }

        } catch (error: any) {
            console.error('[AuthContext] Falló el inicio de sesión:', error);
            // Limpia cualquier estado residual en caso de fallo
            setToken(null);
            setUsuario(null);
            await borrarToken(); // Asegura que no quede un token inválido
            // Relanza el error para que el componente de UI (LoginForm) muestre el mensaje
            throw error;
        }
    }, []); // useCallback sin dependencias porque las funciones externas no cambian

    // Función de Logout
    const logout = useCallback(async () => {
        console.log('[AuthContext] Realizando logout...');
        try {
            // 1. Borra el token de SecureStore
            await borrarToken();
        } catch (error) {
            console.error('[AuthContext] Error al borrar token durante logout:', error);
        } finally {
            // 2. Limpia el estado local sin importar si el borrado falló
            setToken(null);
            setUsuario(null);
            // 3. Redirige a la pantalla de login
            router.replace('/(auth)/login');
            console.log('[AuthContext] Logout completado.');
        }
    }, []); // useCallback sin dependencias

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
            isAuthenticated: !!token, // Es autenticado si hay un token
            isLoading,
            login,
            logout,
            estado: isLoading
                ? 'cargando'
                : token
                ? 'autenticado'
                : 'noAutenticado', // Define el estado basado en el contexto actual
        }),
        [token, usuario, isLoading, login, logout] // Dependencias del useMemo
    );

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};
