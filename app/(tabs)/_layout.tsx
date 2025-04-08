import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // O usa expo-symbols u otra librería
import Colors from '../../constants/Colors'; // Asegúrate que la ruta sea correcta

// Función auxiliar para generar iconos de la barra de pestañas
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  // Define el color activo de las pestañas (puedes usar tu paleta de Colors.ts)
  const activeTabColor = Colors.primary; 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTabColor,
        // Puedes descomentar esto si las pantallas dentro de las pestañas manejan su propia cabecera
        // headerShown: false,
        tabBarStyle: {
          // Estilos adicionales para la barra de pestañas si son necesarios
          // backgroundColor: Colors.light.background,
        },
        headerStyle: {
            // Estilos para la cabecera por defecto de las pestañas
           // backgroundColor: Colors.light.primary, // Ejemplo
        },
        headerTintColor: Colors.text, // Color del texto de la cabecera
        headerTitleStyle: {
            // Estilo del título de la cabecera
            // fontWeight: 'bold',
        },
      }}>
      {/* Pestaña del Dashboard */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard', // Título de la pestaña y la cabecera
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="tachometer" color={color} />,
          // Puedes agregar un botón en la cabecera si es necesario
          // headerRight: () => ( ... ),
        }}
      />

      {/* Pestaña de Detalle de KPI */}
      {/* Considera si esta pantalla debe ser una pestaña directa o si se navega a ella */}
      {/* Si no es una pestaña directa, puedes quitarla de aquí y manejar la navegación */}
      {/* desde 'dashboard' o definirla como una pantalla dentro del Stack de 'dashboard'. */}
      {/* Ocultarla de la barra de pestañas con href: null si solo se accede por navegación */}
      <Tabs.Screen
         name="kpi-detail"
         options={{
           title: 'Detalle KPI',
           // href: null, // Descomenta si no quieres que aparezca en la barra de pestañas
           tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="bar-chart" color={color} />,
         }}
       />

      {/* Pestaña de Configuración */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
