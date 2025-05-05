// ReactNative/components/Auth/RegisterForm.tsx
// Componente de formulario para el registro de nuevos usuarios.


import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import CampoEntrada from '../Common/InputField';
import Boton from '../Common/Button';
import MensajeError from '../Common/ErrorMessage';
import Layout from '../../constants/Layout';
import { registrarUsuario } from '../../services/authService';

interface RespuestaRegistroBackend {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

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
    // Resetear error al intentar de nuevo
    setErrorLocal(null);

    // Validación básica de campos
    if (!email || !password || !confirmarPassword) {
      setErrorLocal('Por favor, completa todos los campos requeridos.');
      return;
    }
    // Validación de formato de email (simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorLocal('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    // Validación de coincidencia de contraseñas
    if (password !== confirmarPassword) {
      setErrorLocal('Las contraseñas no coinciden.');
      return;
    }
    // Validación de longitud mínima de contraseña
    if (password.length < 8) {
      setErrorLocal('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    // Validación de complejidad (ejemplo: letra y número)
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorLocal('La contraseña debe contener letras y números.');
      return;
    }

    setCargando(true);

    try {
      //Llamada REAL a la API
      const datosRegistro = { email, password }; // Sin nombre por ahora
          // 'nombre' no está en UserCreate, si quieres enviarlo,
          // necesitarías añadirlo al schema UserCreate en el backend
          // y potencialmente a ProfileCreate si va en el perfil.
          // Si 'nombre' es para el perfil:
          // profile: { full_name: nombre } // Asumiendo que va en full_name
      console.log('[RegisterForm] Enviando datos de registro:', datosRegistro.email);

      // Llama a la función del servicio de autenticación
      // La respuesta debería coincidir con UserRead según el backend
      const respuesta: RespuestaRegistroBackend = await registrarUsuario(datosRegistro);
      console.log('[RegisterForm] Registro exitoso:', respuesta);
      // Muestra alerta de éxito y redirige al login al presionar OK
      Alert.alert(
        'Registro Exitoso',
        // Puedes usar un mensaje genérico o datos de la respuesta si es útil
        `Cuenta para ${respuesta.email} creada. Ahora puedes iniciar sesión.`,
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    } catch (error: any) {
      console.error('[RegisterForm] Error atrapado desde el servicio:', error);
      // Muestra el error devuelto por el servicio (que ya debería estar formateado)
      // Incluyendo el error de email duplicado del backend
      setErrorLocal(error.message || 'Ocurrió un error durante el registro.');
    } finally {
      setCargando(false); // Desactiva el indicador de carga
    }
  };

  return (
    <View style={estilos.contenedor}>
      {/* Muestra el error local si existe */}
      {errorLocal && <MensajeError mensaje={errorLocal} />}

      {/* Campo de Nombre (a futuro) */}
      {/* <CampoEntrada
        etiqueta="Nombre Completo (Opcional)"
        placeholder="Tu nombre"
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
        autoComplete="name"
        editable={!cargando}
        returnKeyType="next"
      /> */}

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
        returnKeyType="next"
      />

      {/* Campo de Contraseña */}
      <CampoEntrada
        etiqueta="Contraseña"
        placeholder="Mínimo 8 caracteres, incluyendo una letra y un numero"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword" // Ayuda a gestores de contraseñas
        editable={!cargando}
        returnKeyType="next"
      />

      {/* Campo de Confirmar Contraseña */}
      <CampoEntrada
        etiqueta="Confirmar Contraseña"
        placeholder="Repite la contraseña"
        value={confirmarPassword}
        onChangeText={setConfirmarPassword}
        secureTextEntry
        editable={!cargando}
        returnKeyType="done" // Último campo antes del botón
        onSubmitEditing={!cargando ? manejarSubmit : undefined}
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
  },
  boton: {
    marginTop: Layout.spacing.large,
  },
});

export default FormularioRegistro;