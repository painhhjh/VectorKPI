import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext'; // Asegúrate que la ruta sea correcta

// Prevenir que la pantalla de splash se oculte automáticamente antes de que las fuentes carguen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Carga las fuentes personalizadas aquí
  // Reemplaza 'YourFont-Regular' y 'YourFont-Bold' con los nombres reales de tus fuentes
  const [fontsLoaded, fontError] = useFonts({
    'YourFont-Regular': require('../assets/fonts/YourFont-Regular.ttf'), // Ajusta la ruta a tu fuente
    'YourFont-Bold': require('../assets/fonts/YourFont-Bold.ttf'),       // Ajusta la ruta a tu fuente
    // Agrega más fuentes si es necesario
  });

  useEffect(() => {
    // Oculta la pantalla de splash una vez que las fuentes estén cargadas o si hay un error
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // No renderizar nada hasta que las fuentes estén cargadas o haya un error
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Renderizar la estructura de navegación principal
  return (
    // Proveedor de autenticación para manejar el estado global del usuario
    <AuthProvider>
      {/* Stack Navigator principal */}
      <Stack>
        {/* Pantalla para el flujo de autenticación (grupo auth) */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* Pantalla para el flujo principal de la app (grupo tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Puedes agregar otras pantallas aquí, como modales */}
        {/* <Stack.Screen name="modal" options={{ presentation: 'modal' }} /> */}
      </Stack>
    </AuthProvider>
  );
}
