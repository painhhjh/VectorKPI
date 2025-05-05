// ReactNative/components/Auth/ForgotPasswordForm.tsx
// Componente de formulario para solicitar la recuperación de contraseña.


import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
    // Limpia estados previos
    setErrorLocal(null);
    setMensajeExito(null);

    // Validación simple
    if (!email) {
      setErrorLocal('Por favor, ingresa tu correo electrónico.');
      return;
    }
    // Validación de formato (opcional pero recomendada)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorLocal('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setCargando(true);

    try {
      // --- Llamada REAL a la API ---
      console.log('[ForgotPasswordForm] Solicitando recuperación para:', email);

      // Llama a la función del servicio de autenticación
      // Espera una respuesta como { msg: "..." } según el backend
      const respuesta = await solicitarRecuperacionPassword(email);
      console.log('[ForgotPasswordForm] Solicitud enviada con éxito:', respuesta);
      // Muestra el mensaje de éxito devuelto por la API usando la clave 'msg'
      setMensajeExito(respuesta.msg || 'Solicitud procesada. Revisa tu correo.');
      // Opcionalmente, deshabilita el formulario o limpia el campo de email aquí
      // setEmail(''); // Limpia el campo después del éxito

    } catch (error: any) {
      console.error('[ForgotPasswordForm] Error atrapado desde el servicio:', error);
      // Muestra el error devuelto por el servicio (que ya debería estar formateado, incluyendo el 404)
      setErrorLocal(error.message || 'Ocurrió un error al procesar tu solicitud.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      {/* Muestra mensaje de éxito si existe */}
      {mensajeExito && <Text style={estilos.textoExito}>{mensajeExito}</Text>}
      {/* Muestra error si existe Y NO hay mensaje de éxito */}
      {!mensajeExito && errorLocal && <MensajeError mensaje={errorLocal} />}

      {/* Campo de Email (solo si no hay éxito) */}
      {!mensajeExito && (
        <CampoEntrada
          etiqueta="Correo Electrónico Registrado"
          placeholder="tu@correo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          editable={!cargando} // No editable si está cargando
          returnKeyType="done"
          onSubmitEditing={!cargando ? manejarSubmit : undefined}
        />
      )}

      {/* Botón de Enviar Solicitud (solo si no hay éxito) */}
      {!mensajeExito && (
        <Boton
          titulo="Enviar Instrucciones"
          onPress={manejarSubmit}
          deshabilitado={cargando} // Deshabilitado si está cargando
          cargando={cargando} // Muestra indicador de carga
          estiloContenedor={estilos.boton}
        />
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    width: '100%', // Ancho completo
    padding: Layout.spacing.medium, // Espaciado interno
  },
  boton: {
    marginTop: Layout.spacing.large, // Margen superior
  },
  textoExito: {
    color: Colors.success, // Color de texto para éxito
    fontSize: Layout.fontSize.body,
    textAlign: 'center',
    marginBottom: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    backgroundColor: Colors.success + '20', // Fondo verde claro translúcido
    borderRadius: Layout.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
});

export default FormularioRecuperarPassword;