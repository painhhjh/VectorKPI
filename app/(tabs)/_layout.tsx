/**
 * @file Layout para el grupo de rutas principal con pestañas (tabs).
 * @description Define la navegación por pestañas para usuarios autenticados.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // O el set de iconos que prefieras
import Colors from '../../constants/Colors'; // Ajusta la ruta
import { Platform } from 'react-native';

// Componente helper para el icono de la pestaña
function IconoTabBar({ name, color }: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={26} style={{ marginBottom: -3 }} name={name} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary, // Color para la pestaña activa
        tabBarInactiveTintColor: Colors.gray, // Color para pestañas inactivas
        tabBarStyle: {
          backgroundColor: Colors.white, // Fondo de la barra de pestañas
          // Puedes añadir más estilos aquí (altura, sombra, etc.)
          height: Platform.OS === 'ios' ? 85 : 65, // Ajusta altura si es necesario
          paddingBottom: Platform.OS === 'ios' ? 30 : 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10, // Tamaño de la etiqueta
          fontWeight: '500',
        },
        headerShown: true, // Muestra la cabecera por defecto en las pantallas de tabs
        headerStyle: {
          backgroundColor: Colors.primary, // Fondo de la cabecera
        },
        headerTintColor: Colors.white, // Color del texto y botones de la cabecera
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      {/* Pestaña del Dashboard */}
      <Tabs.Screen
        name="dashboard" // Corresponde al archivo app/(tabs)/dashboard.tsx
        options={{
          title: 'Dashboard', // Título en la cabecera y la pestaña
          tabBarIcon: ({ color }: { color: string }) => <IconoTabBar name="stats-chart" color={color} />, // Icono
          // Puedes añadir un botón en la cabecera si lo necesitas
          // headerRight: () => ( ... ),
        }}
      />

      {/* Pestaña de Configuración */}
      <Tabs.Screen
        name="settings" // Corresponde al archivo app/(tabs)/settings.tsx
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color }: { color: string }) => <IconoTabBar name="settings-sharp" color={color} />,
        }}
      />

       {/* Pantalla de Detalle de KPI (oculta de las pestañas) */}
       {/* La definimos aquí para que pertenezca al Stack de Tabs pero no sea una pestaña visible */}
       <Tabs.Screen
         name="kpi-detail" // Corresponde al archivo app/(tabs)/kpi-detail.tsx
         options={{
           title: 'Detalle KPI',
           href: null, // Oculta esta pantalla de la barra de pestañas
           headerShown: true, // Puedes decidir si mostrar la cabecera aquí
           // Podrías querer un botón de 'Atrás' personalizado o usar el por defecto
         }}
       />

    </Tabs>
  );
}
