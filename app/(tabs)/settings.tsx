/**
 * @file Pantalla de Configuración.
 * @description Muestra información del usuario y permite cerrar sesión.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth'; // Ajusta la ruta
import Boton from '../../components/Common/Button'; // Ajusta la ruta
import Colors from '../../constants/Colors'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta

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
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.medium,
  },
  seccion: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.large,
    marginBottom: Layout.spacing.large,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tituloSeccion: {
    fontSize: Layout.fontSize.heading,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Layout.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Layout.spacing.small,
  },
  textoInfo: {
    fontSize: Layout.fontSize.body,
    color: Colors.text,
    marginBottom: Layout.spacing.small,
    lineHeight: Layout.fontSize.body * 1.5,
  },
  botonLogout: {
    // Estilos adicionales para el botón si son necesarios
  },
});