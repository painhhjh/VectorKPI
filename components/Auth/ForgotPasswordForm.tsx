// Componente de formulario para solicitar la recuperación de contraseña.

import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import CampoEntrada from '../Common/InputField';
import Boton from '../Common/Button';
import MensajeError from '../Common/ErrorMessage';
import Layout from '../../constants/Layout';
import Colors from '../../constants/Colors';
import { solicitarRecuperacionPassword } from '../../services/authService';

const FormularioRecuperarPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Manejador para el envío del formulario
  const manejarSubmit = async () => {
    if (!email) {
      setErrorLocal('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setErrorLocal(null);
    setMensajeExito(null);
    setCargando(true);

    try {
      // --- Llamada REAL a la API ---
      console.log('[ForgotPasswordForm] Solicitando recuperación para:', email);

      // Llama a la función del servicio de autenticación
      await solicitarRecuperacionPassword(email);

      console.log('[ForgotPasswordForm] Solicitud de recuperación enviada exitosamente.');
      setMensajeExito('Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña en breve.');
      // Alert.alert('Solicitud Enviada', 'Si el correo está registrado, recibirás instrucciones.');
      // --- Fin Llamada API ---

    } catch (error: any) {
      console.error('[ForgotPasswordForm] Error solicitando recuperación API:', error);
       // Muestra el error devuelto por el servicio/API o uno genérico
      let mensajeError = 'Ocurrió un error al procesar tu solicitud.';
      if (error?.response?.data?.detail) {
          mensajeError = error.response.data.detail;
      } else if (typeof error?.message === 'string') {
          mensajeError = error.message;
      }
      setErrorLocal(mensajeError);
      // Alert.alert('Error', mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      {/* Muestra mensaje de éxito si existe */}
      {mensajeExito && <Text style={estilos.textoExito}>{mensajeExito}</Text>}
      {/* Muestra error si existe */}
      {errorLocal && <MensajeError mensaje={errorLocal} />}

      {/* Campo de Email */}
      <CampoEntrada
        etiqueta="Correo Electrónico Registrado"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        editable={!cargando && !mensajeExito} // No editable si carga o si ya hubo éxito
      />

      {/* Botón de Enviar Solicitud */}
      <Boton
        titulo="Enviar Instrucciones"
        onPress={manejarSubmit}
        deshabilitado={cargando || !!mensajeExito} // Deshabilitado si carga o si ya hubo éxito
        cargando={cargando}
        estiloContenedor={estilos.boton}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    width: '100%',
    padding: Layout.spacing.medium,
  },
  boton: {
    marginTop: Layout.spacing.large,
  },
  textoExito: {
    color: Colors.success,
    fontSize: Layout.fontSize.body,
    textAlign: 'center',
    marginBottom: Layout.spacing.medium,
    padding: Layout.spacing.small,
    backgroundColor: Colors.success + '20', // Fondo verde claro
    borderRadius: Layout.borderRadius.small,
  },
});

export default FormularioRecuperarPassword;
