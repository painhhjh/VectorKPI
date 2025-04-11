/**
 * @file Pantalla de Inicio de Sesión.
 * @description Presenta el formulario de login y enlaces adicionales.
 */
import React from 'react';
import { View, StyleSheet, Text, Image, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router'; // Para navegar a otras pantallas
import FormularioLogin from '../../components/Auth/LoginForm'; // Ajusta la ruta
import Colors from '../../constants/Colors'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta

// Asegúrate de tener un logo en esta ruta o cambia la fuente
const logoPath = require('../../assets/images/react-logo.png'); // Ajusta la ruta

export default function PantallaLogin() {
  return (
    <SafeAreaView style={estilos.safeArea}>
      <ScrollView contentContainerStyle={estilos.scrollViewContainer}>
        <View style={estilos.contenedor}>
          {/* Sección del Logo */}
          <Image source={logoPath} style={estilos.logo} resizeMode="contain" />

          {/* Título o Bienvenida */}
          <Text style={estilos.titulo}>VectorKPI</Text>
          <Text style={estilos.subtitulo}>Inicia sesión para continuar</Text>

          {/* Formulario de Login */}
          <FormularioLogin />

          {/* Enlaces Adicionales */}
          <View style={estilos.contenedorEnlaces}>
            <Link href="../recuperarPassword" asChild>
              <TouchableOpacity>
                <Text style={estilos.enlace}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </Link>
            {/* Separador simple */}
            <Text style={estilos.separadorEnlaces}> | </Text>
            <Link href="../registro" asChild>
              <TouchableOpacity>
                <Text style={estilos.enlace}>Crear cuenta</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background, // Fondo general de la app
  },
  scrollViewContainer: {
    flexGrow: 1, // Permite que el contenido crezca y el scroll funcione
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
    padding: Layout.spacing.large, // Padding general
  },
  contenedor: {
    width: '100%',
    maxWidth: 400, // Ancho máximo para pantallas grandes/web
    alignItems: 'center', // Centra los hijos horizontalmente
    backgroundColor: Colors.cardBackground, // Fondo tipo tarjeta para el formulario
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.large,
    // Sombra sutil (opcional)
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Layout.spacing.medium,
  },
  titulo: {
    fontSize: Layout.fontSize.display,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.small,
  },
  subtitulo: {
    fontSize: Layout.fontSize.subheading,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.large,
    textAlign: 'center',
  },
  contenedorEnlaces: {
    flexDirection: 'row', // Alinea los enlaces horizontalmente
    marginTop: Layout.spacing.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlace: {
    color: Colors.primary,
    fontSize: Layout.fontSize.body,
    fontWeight: '500',
    paddingHorizontal: Layout.spacing.small, // Espacio clickeable
  },
   separadorEnlaces: {
     color: Colors.lightGray,
     fontSize: Layout.fontSize.body,
   }
});
