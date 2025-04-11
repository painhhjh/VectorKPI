/**
 * @file Pantalla de Configuración.
 * @description Muestra información del usuario y permite cerrar sesión.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import Boton from '../../components/Common/Button';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

export default function PantallaConfiguracion() {
  const { usuario, cerrarSesion, estado } = useAuth(); // Obtiene datos y función de logout

  const handleLogout = async () => {
    try {
      await cerrarSesion();
      // La navegación a la pantalla de login es manejada por app/_layout.tsx
      console.log('[SettingsScreen] Cierre de sesión iniciado.');
    } catch (error) {
      console.error('[SettingsScreen] Error al cerrar sesión:', error);
      // Podrías mostrar un Alert aquí si el cierre de sesión falla
    }
  };

  return (
    <ScrollView style={estilos.contenedor}>
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Información del Usuario</Text>
        {usuario ? (
          <>
            <Text style={estilos.textoInfo}>Nombre: {usuario.nombre || 'No disponible'}</Text>
            <Text style={estilos.textoInfo}>Email: {usuario.email}</Text>
            <Text style={estilos.textoInfo}>ID: {usuario.id}</Text>
            {/* Añade más información del usuario si está disponible */}
          </>
        ) : (
          <Text style={estilos.textoInfo}>No se pudo cargar la información del usuario.</Text>
        )}
      </View>

      <View style={estilos.seccion}>
        <Boton
          titulo="Cerrar Sesión"
          onPress={handleLogout}
          variante="peligro" // Botón rojo para logout
          cargando={estado === 'cargando'} // Muestra spinner si está en proceso
          estiloContenedor={estilos.botonLogout}
        />
      </View>

      {/* Puedes añadir más secciones de configuración aquí */}
      {/*
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Preferencias</Text>
        // ... controles de configuración ...
      </View>
      */}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1, // Hace que el contenedor ocupe todo el espacio disponible
    backgroundColor: Colors.background, // Color de fondo del contenedor
    padding: Layout.spacing.medium, // Espaciado interno del contenedor
  },
  seccion: {
    backgroundColor: Colors.cardBackground, // Color de fondo para cada sección
    borderRadius: Layout.borderRadius.medium, // Bordes redondeados para las secciones
    padding: Layout.spacing.large, // Espaciado interno de las secciones
    marginBottom: Layout.spacing.large, // Espaciado entre secciones
    shadowColor: Colors.black, // Color de la sombra
    shadowOffset: { width: 0, height: 1 }, // Desplazamiento de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 3, // Difuminado de la sombra
    elevation: 2, // Elevación para sombras en Android
  },
  tituloSeccion: {
    fontSize: Layout.fontSize.heading, // Tamaño de fuente para el título
    fontWeight: '600', // Grosor de la fuente
    color: Colors.primary, // Color del texto del título
    marginBottom: Layout.spacing.medium, // Espaciado inferior del título
    borderBottomWidth: 1, // Línea inferior para separar el título
    borderBottomColor: Colors.border, // Color de la línea inferior
    paddingBottom: Layout.spacing.small, // Espaciado interno inferior del título
  },
  textoInfo: {
    fontSize: Layout.fontSize.body, // Tamaño de fuente para el texto informativo
    color: Colors.text, // Color del texto
    marginBottom: Layout.spacing.small, // Espaciado inferior entre líneas de texto
    lineHeight: Layout.fontSize.body * 1.5, // Altura de línea para mejorar legibilidad
  },
  botonLogout: {
    backgroundColor: Colors.danger, // Fondo rojo para indicar acción peligrosa
    borderRadius: Layout.borderRadius.small, // Bordes redondeados del botón
    paddingVertical: Layout.spacing.small, // Espaciado vertical interno
    paddingHorizontal: Layout.spacing.large, // Espaciado horizontal interno
    alignItems: 'center', // Centrar texto dentro del botón
    justifyContent: 'center', // Centrar contenido verticalmente
    shadowColor: Colors.black, // Sombra para el botón
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.2, // Opacidad de la sombra
    shadowRadius: 4, // Difuminado de la sombra
    elevation: 3, // Elevación para sombras en Android
  },
});