//ReactNative\app\(auth)\recuperarPassword.tsx
//Pantalla para solicitar la recuperación de contraseña.

import React from 'react';
import { View, StyleSheet, Text, SafeAreaView, ScrollView } from 'react-native';
import FormularioRecuperarPassword from '../../components/Auth/ForgotPasswordForm';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

export default function PantallaRecuperarPassword() {
  return (
    <SafeAreaView style={estilos.safeArea}>
      <ScrollView contentContainerStyle={estilos.scrollViewContainer}>
        <View style={estilos.contenedor}>
          {/* Título de la pantalla */}
          <Text style={estilos.titulo}>Recuperar Contraseña</Text>
          
          {/* Subtítulo con instrucciones */}
          <Text style={estilos.subtitulo}>
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </Text>

          {/* Formulario de Recuperación */}
          <FormularioRecuperarPassword />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1, // Ocupa todo el espacio disponible
    backgroundColor: Colors.background, // Fondo general de la pantalla
  },
  scrollViewContainer: {
    flexGrow: 1, // Permite que el contenido crezca si es necesario
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
    paddingVertical: Layout.spacing.large, // Espaciado vertical
    paddingHorizontal: Layout.spacing.medium, // Espaciado horizontal
  },
  contenedor: {
    width: '100%', // Ocupa todo el ancho disponible
    maxWidth: 450, // Ancho máximo del contenedor
    alignItems: 'center', // Centra los elementos dentro del contenedor
    backgroundColor: Colors.cardBackground, // Fondo del contenedor
    borderRadius: Layout.borderRadius.large, // Bordes redondeados
    padding: Layout.spacing.medium, // Espaciado interno
    paddingBottom: Layout.spacing.large, // Más padding en la parte inferior
    shadowColor: Colors.black, // Color de la sombra
    shadowOffset: { width: 0, height: 2 }, // Dirección de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 5, // Difuminado de la sombra
    elevation: 4, // Elevación para sombras en Android
  },
  titulo: {
    fontSize: Layout.fontSize.title, // Tamaño de fuente para el título
    fontWeight: 'bold', // Texto en negrita
    color: Colors.primary, // Color del texto
    marginBottom: Layout.spacing.small, // Espaciado debajo del título
    marginTop: Layout.spacing.medium, // Espaciado encima del título
  },
  subtitulo: {
    fontSize: Layout.fontSize.body, // Tamaño de fuente para el subtítulo
    color: Colors.textSecondary, // Color del texto secundario
    marginBottom: Layout.spacing.large, // Espaciado debajo del subtítulo
    textAlign: 'center', // Centra el texto
    paddingHorizontal: Layout.spacing.small, // Espaciado horizontal interno
  },
});