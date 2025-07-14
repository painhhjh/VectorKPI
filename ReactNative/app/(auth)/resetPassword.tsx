// ReactNative/app/(auth)/resetPassword.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import FormularioRestablecerPassword from '../../components/Auth/ResetPasswordForm'; // Usar FormularioRestablecerPassword
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import CargandoIndicador from '../../components/Common/LoadingIndicator'; // Usar CargandoIndicador
import MensajeError from '../../components/Common/ErrorMessage'; // Usar MensajeError
import axios from 'axios';
//import authService from '../../services/authService';

const PantallaRestablecerPassword: React.FC = () => {
  const { token } = useLocalSearchParams();
  const [cargando, setCargando] = useState(false); // Usar cargando
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null); // Usar mensajeExito

  useEffect(() => {
    if (!token) {
      setError('Token de restablecimiento de contraseña no encontrado en la URL.');
    }
  }, [token]);

  const manejarRestablecerPassword = async (nuevaPassword: string) => {
    if (!token || typeof token !== 'string') {
      setError('Token inválido o faltante.');
      return;
    }

    setCargando(true);
    setError(null);
    setMensajeExito(null);
    try {
      const response = await restablecerPassword(token, nuevaPassword);
      setMensajeExito(response.msg || 'Contraseña restablecida exitosamente.');
      Alert.alert('Éxito', 'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (err: any) {
      console.error('Error al restablecer contraseña:', err);
      setError(err.response?.data?.detail || 'Error al restablecer la contraseña. El token podría ser inválido o haber expirado.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={estilos.scrollViewContainer}>
        <View style={estilos.contenedor}>
          <Text style={estilos.titulo}>Restablecer Contraseña</Text>
          {mensajeExito && <Text style={estilos.mensajeExito}>{mensajeExito}</Text>}
          {token ? (
            <FormularioRestablecerPassword
              onSubmit={manejarRestablecerPassword}
              cargando={cargando}
              error={error}
            />
          ) : (
            <View style={estilos.contenedorMensaje}>
              {cargando ? (
                <CargandoIndicador />
              ) : (
                <MensajeError mensaje={error || 'Cargando...'} />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingBottom: Layout.spacing.large,
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
  contenedorMensaje: {
    marginTop: Layout.spacing.medium,
  },
  mensajeExito: {
    color: Colors.success,
    fontSize: Layout.fontSize.body,
    marginBottom: Layout.spacing.medium,
    textAlign: 'center',
    paddingVertical: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    backgroundColor: Colors.success + '20',
    borderRadius: Layout.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
});

export default PantallaRestablecerPassword;

async function restablecerPassword(token: string, nuevaPassword: string): Promise<{ msg: string }> {
    try {
        const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/reset-password/`,
            {
                token,
                password: nuevaPassword,
            }
        );
        return { msg: response.data?.msg || 'Contraseña restablecida exitosamente.' };
    } catch (error: any) {
        throw error;
    }
}