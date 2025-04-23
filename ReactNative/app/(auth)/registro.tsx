// Pantalla de Registro de Usuario.

import React from 'react';
import { View, StyleSheet, Text, SafeAreaView, ScrollView } from 'react-native';
import FormularioRegistro from '../../components/Auth/RegisterForm';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { useRouter } from 'expo-router';
export default function PantallaRegistro() {
  // Usa el hook useRouter en el nivel superior del componente
  const router = useRouter();

  return (
    <SafeAreaView style={estilos.safeArea}>
      <ScrollView contentContainerStyle={estilos.scrollViewContainer}>
        <View style={estilos.contenedor}>
          {/* Puedes añadir un logo o título si quieres, similar a PantallaLogin */}
          <Text style={estilos.titulo}>Crear Nueva Cuenta</Text>
          <Text style={estilos.subtitulo}>Ingresa tus datos para registrarte.</Text>

          {/* Formulario de Registro */}
          <FormularioRegistro />

          {/* Enlace para volver a Login si el usuario ya tiene cuenta */}
          <Text style={{ marginTop: Layout.spacing.medium, color: Colors.accent }}>
            ¿Ya tienes una cuenta?{' '}
            <Text style={{ fontWeight: 'bold' }} onPress={() => router.push('../login')}
            >
              Inicia sesión aquí
            </Text>
          </Text>
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
    paddingVertical: Layout.spacing.large, // Padding vertical
    paddingHorizontal: Layout.spacing.medium, // Padding horizontal
  },
  contenedor: {
    width: '100%',
    maxWidth: 450, // Ancho máximo
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
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
    marginTop: Layout.spacing.medium, // Espacio si no hay logo
  },
  subtitulo: {
    fontSize: Layout.fontSize.body,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.medium,
    textAlign: 'center',
  },
});