/**
 * @file Layout para el grupo de rutas principal con pestañas (tabs).
 * @description Define la navegación por pestañas para usuarios autenticados. Incluye Dashboard, Inventario y Configuración.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Añadimos MaterialCommunityIcons
import Colors from '../../constants/Colors'; // Ajusta la ruta
import { Platform } from 'react-native';

// Componente helper para el icono de la pestaña
function IconoTabBar({ name, color, library = 'ionicons' }: { name: any; color: string; library?: 'ionicons' | 'material' }) {
    const IconComponent = library === 'material' ? MaterialCommunityIcons : Ionicons;
    return <IconComponent size={26} style={{ marginBottom: -3 }} name={name} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary, // Color para la pestaña activa
        tabBarInactiveTintColor: Colors.gray, // Color para pestañas inactivas
        tabBarStyle: {
          backgroundColor: Colors.white, // Fondo de la barra de pestañas
          height: Platform.OS === 'ios' ? 85 : 65, // Ajusta altura si es necesario
          paddingBottom: Platform.OS === 'ios' ? 30 : 5,
          paddingTop: 5,
          borderTopWidth: 1, // Línea sutil arriba
          borderTopColor: Colors.border,
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
        }}
      />

      {/* Pestaña de Inventario (NUEVO) */}
      <Tabs.Screen
        name="inventory" // Corresponde al archivo app/(tabs)/inventory.tsx
        options={{
          title: 'Inventario',
          // Usamos un icono diferente, por ejemplo de MaterialCommunityIcons
          tabBarIcon: ({ color }: { color: string }) => <IconoTabBar name="warehouse" color={color} library="material" />,
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
       <Tabs.Screen
         name="kpi-detail" // Corresponde al archivo app/(tabs)/kpi-detail.tsx
         options={{
           title: 'Detalle KPI',
           href: null, // Oculta esta pantalla de la barra de pestañas
           headerShown: true,
         }}
       />

       {/* Pantalla de Detalle de Categorias (oculta de las pestañas) */}
       <Tabs.Screen
         name="category-detail" // Corresponde al archivo app/(tabs)/kpi-detail.tsx
         options={{
           title: 'Categoria',
           href: null, // Oculta esta pantalla de la barra de pestañas
           headerShown: true,
         }}
       />

       {/* Pantalla de Detalle de Producto (NUEVO - oculta de las pestañas) */}
       <Tabs.Screen
         name="product-detail" // Corresponde al archivo app/(tabs)/product-detail.tsx
         options={{
           title: 'Detalle Producto',
           href: null, // Oculta esta pantalla de la barra de pestañas
           headerShown: true,
         }}
       />

    </Tabs>
  );
}
