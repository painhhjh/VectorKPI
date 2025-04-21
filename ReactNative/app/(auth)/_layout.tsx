//Layout para el grupo de rutas de autenticación. Define un Stack Navigator para las pantallas de login, registro, etc.

import React from 'react';
import { Stack } from 'expo-router';
import Colors from '../../constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        // Estilos generales para la cabecera en este grupo (si se muestra)
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false, // Oculta el texto junto al botón de atrás en iOS
      }}
    >
      {/* Pantalla de Login */}
      <Stack.Screen
        name="login"
        options={{
          headerShown: false, // Oculta la cabecera para la pantalla de login principal
        }}
      />
      {/* Pantalla de Registro */}
      <Stack.Screen
        name="registro" // Corresponde al archivo app/(auth)/registro.tsx
        options={{
          title: 'Crear Cuenta', // Título que aparecerá en la cabecera
          headerShown: true, // Muestra la cabecera
        }}
      />
      {/* Pantalla de Recuperación de Contraseña */}
      <Stack.Screen
        name="recuperarPassword" // Corresponde al archivo app/(auth)/recuperarPassword.tsx
        options={{
          title: 'Recuperar Contraseña', // Título que aparecerá en la cabecera
          headerShown: true, // Muestra la cabecera
        }}
      />
    </Stack>
  );
}
