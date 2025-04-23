//Componente de formulario para el registro de nuevos usuarios.

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import CampoEntrada from '../Common/InputField';
import Boton from '../Common/Button';
import MensajeError from '../Common/ErrorMessage';
import Layout from '../../constants/Layout';
import { registrarUsuario } from '../../services/authService';

const FormularioRegistro: React.FC = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmarPassword, setConfirmarPassword] = useState<string>('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  // Manejador para el envío del formulario de registro
  const manejarSubmit = async () => {
    // Validación básica de campos
    if (!email || !password || !confirmarPassword) {
      setErrorLocal('Por favor, completa todos los campos requeridos.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorLocal('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (password !== confirmarPassword) {
      setErrorLocal('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setErrorLocal('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorLocal('La contraseña debe contener al menos una letra y un número.');
      return;
    }

    setErrorLocal(null);
    setCargando(true);

    try {
      // --- Llamada REAL a la API ---
      const datosRegistro = {
          email,
          password, // Envía la contraseña
          nombre: nombre || undefined // Envía el nombre solo si no está vacío
      };
      console.log('[RegisterForm] Enviando datos de registro a la API:', datosRegistro);

      // Llama a la función del servicio de autenticación
      const respuesta = await registrarUsuario(datosRegistro);

      console.log('[RegisterForm] Registro exitoso:', respuesta);
      Alert.alert(
        'Registro Exitoso',
        respuesta.mensaje || 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.', // Usa mensaje de API si existe
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }] // Redirige a login
      );
      // --- Fin Llamada API ---

    } catch (error: any) {
      console.error('[RegisterForm] Error en registro API:', error);
      // Muestra el error devuelto por el servicio/API o uno genérico
      // Intenta obtener un mensaje más específico si la API devuelve detalles
      let mensajeError = 'Ocurrió un error durante el registro.';
      if (error?.response?.data?.detail) {
          mensajeError = error.response.data.detail;
      } else if (typeof error?.message === 'string') {
          mensajeError = error.message;
      }
      setErrorLocal(mensajeError);
      // Alert.alert('Error de Registro', mensajeError);
    } finally {
      setCargando(false); // Desactiva el indicador de carga
    }
  };

  return (
    <View style={estilos.contenedor}>
      {errorLocal && <MensajeError mensaje={errorLocal} />}

      {/* Campo de Nombre (Opcional) */}
      <CampoEntrada
        etiqueta="Nombre (Opcional)"
        placeholder="Tu nombre"
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
        autoComplete="name"
        editable={!cargando}
      />

      {/* Campo de Email */}
      <CampoEntrada
        etiqueta="Correo Electrónico"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        editable={!cargando}
      />

      {/* Campo de Contraseña */}
      <CampoEntrada
        etiqueta="Contraseña"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
        editable={!cargando}
      />

      {/* Campo de Confirmar Contraseña */}
      <CampoEntrada
        etiqueta="Confirmar Contraseña"
        placeholder="Repite la contraseña"
        value={confirmarPassword}
        onChangeText={setConfirmarPassword}
        secureTextEntry
        editable={!cargando}
      />

      {/* Botón de Registro */}
      <Boton
        titulo="Crear Cuenta"
        onPress={manejarSubmit}
        deshabilitado={cargando}
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
});

export default FormularioRegistro;
