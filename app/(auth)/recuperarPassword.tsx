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
          <Text style={estilos.titulo}>Recuperar Contraseña</Text>
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
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.large,
    paddingHorizontal: Layout.spacing.medium,
  },
  contenedor: {
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
     paddingBottom: Layout.spacing.large, // Más padding abajo
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  titulo: {
    fontSize: Layout.fontSize.title,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.small,
    marginTop: Layout.spacing.medium,
  },
  subtitulo: {
    fontSize: Layout.fontSize.body,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.large, // Más espacio antes del form
    textAlign: 'center',
    paddingHorizontal: Layout.spacing.small, // Padding para que no pegue a los bordes
  },
});