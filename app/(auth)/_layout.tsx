import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    // Stack Navigator para las pantallas dentro del grupo (auth)
    <Stack>
      {/* Define la pantalla de login dentro de este layout */}
      {/* headerShown: false para que la pantalla 'login' controle su propia cabecera si es necesario */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      {/* Podrías agregar otras pantallas de autenticación aquí (ej. registro, olvido contraseña) */}
      {/* <Stack.Screen name="register" options={{ title: 'Registro' }} /> */}
    </Stack>
  );
}