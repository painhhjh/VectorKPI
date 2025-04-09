/**
 * @file Layout raíz de la aplicación.
 * @description Configura el AuthProvider, gestiona la SplashScreen y define la navegación principal.
 */
import React, { useEffect } from 'react';
import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font'; // Asumiendo que cargarás fuentes personalizadas
import { AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../contexts/useAuth';
import IndicadorCarga from '../components/Common/LoadingIndicator';

// Previene que la SplashScreen se oculte automáticamente antes de que estemos listos
SplashScreen.preventAutoHideAsync();

// Componente interno que maneja la lógica de navegación basada en autenticación
function NavegacionInicial() {
  const { estado, token } = useAuth(); // Obtiene el estado de autenticación
  const router = useRouter(); // Hook para navegar programáticamente
  const segments = useSegments(); // Obtiene los segmentos de la ruta actual

  useEffect(() => {
    console.log(`[RootLayout] Estado Auth: ${estado}, Token: ${token ? 'Presente' : 'Ausente'}`);
    const enGrupoAuth = segments[0] === '(auth)';
    const enGrupoTabs = segments[0] === '(tabs)';

    // Si el estado ya no es 'cargando'
    if (estado !== 'cargando' && estado !== 'idle') {
      if (estado === 'autenticado' && !enGrupoTabs) {
        // Usuario autenticado, navegar a la sección principal (tabs)
        console.log('[RootLayout] Usuario autenticado, redirigiendo a (tabs)');
        router.replace('/(tabs)/dashboard'); // Redirige a la pantalla principal
      } else if (estado === 'noAutenticado' && !enGrupoAuth) {
        // Usuario no autenticado, navegar a la sección de login (auth)
        console.log('[RootLayout] Usuario no autenticado, redirigiendo a (auth)');
        router.replace('/(auth)/login'); // Redirige a la pantalla de login
      } else if (estado === 'error') {
         // Si hay error y no está en auth, llevar a login
         if (!enGrupoAuth) {
            console.log('[RootLayout] Error de autenticación, redirigiendo a (auth)');
            router.replace('/(auth)/login');
         }
      }

      // Oculta la SplashScreen una vez que la navegación está decidida
      SplashScreen.hideAsync();
      console.log('[RootLayout] SplashScreen oculta.');

    } else {
       console.log('[RootLayout] AuthProvider todavía cargando o inactivo.');
    }
  }, [estado, token, segments, router]); // Dependencias del efecto

  // Mientras carga el estado de auth, no muestra nada o un indicador global
  if (estado === 'cargando' || estado === 'idle') {
     // Mantenemos la SplashScreen visible (no la ocultamos) o mostramos un loader
     return <IndicadorCarga />; // Opcional: mostrar un loader aquí
    // Devolver null es más común mientras SplashScreen está activa
  }

  // Una vez cargado, el Stack definido abajo se renderizará
  // y el useEffect se encargará de la redirección si es necesario.
  return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        {/* Puedes añadir aquí pantallas globales como Modales */}
        {/* <Stack.Screen name="modal" options={{ presentation: 'modal' }} /> */}
      </Stack>
  );
}

// Layout principal que envuelve todo con el AuthProvider
export default function LayoutRaiz() {
  // Carga de fuentes (opcional pero recomendado)
  const [fuentesCargadas, errorFuente] = useFonts({
    // 'NombreFuente-Regular': require('../assets/fonts/NombreFuente-Regular.ttf'),
    // 'NombreFuente-Bold': require('../assets/fonts/NombreFuente-Bold.ttf'),
  });

  // Gestiona la SplashScreen mientras las fuentes cargan
  useEffect(() => {
    if (fuentesCargadas || errorFuente) {
      // No ocultamos aquí, dejamos que NavegacionInicial lo haga cuando auth esté listo
      // SplashScreen.hideAsync();
      console.log('[RootLayout] Fuentes cargadas o error de fuente.');
    }
     if (errorFuente) {
        console.error("Error cargando fuentes:", errorFuente);
     }
  }, [fuentesCargadas, errorFuente]);

  // No renderizar nada hasta que las fuentes estén listas (o haya error)
  if (!fuentesCargadas && !errorFuente) {
     console.log('[RootLayout] Esperando carga de fuentes...');
    return null; // Mantiene la SplashScreen visible
  }

  // Renderiza el proveedor y la navegación
  return (
    <AuthProvider>
      <NavegacionInicial />
    </AuthProvider>
  );
}
