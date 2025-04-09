// Componente de formulario para el inicio de sesión.

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native'; // Importa Alert
import { useAuth } from '../../hooks/useAuth'; // Ajusta la ruta
import CampoEntrada from '../Common/InputField'; // Ajusta la ruta
import Boton from '../Common/Button'; // Ajusta la ruta
import MensajeError from '../Common/ErrorMessage'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta

const FormularioLogin: React.FC = () => {
  const { iniciarSesion, estado } = useAuth(); // Obtiene la función de login y el estado
  const [email, setEmail] = useState<string>(''); // Estado para el campo email/usuario
  const [password, setPassword] = useState<string>(''); // Estado para el campo contraseña
  const [errorLocal, setErrorLocal] = useState<string | null>(null); // Estado para errores específicos del formulario

  // Determina si el formulario está en proceso de envío
  const estaCargando = estado === 'cargando';

  // Manejador para el envío del formulario
  const manejarSubmit = async () => {
    // Validación básica de campos
    if (!email || !password) {
      setErrorLocal('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setErrorLocal(null); // Limpia errores previos

    try {
      // Llama a la función iniciarSesion del contexto
      await iniciarSesion({ email, password });
      // La navegación ocurrirá automáticamente si el login es exitoso
      // gracias a la lógica en app/_layout.tsx
      console.log('[LoginForm] Llamada a iniciarSesion completada.');

    } catch (error: any) {
      console.error('[LoginForm] Error en iniciarSesion:', error);
      // Muestra el error devuelto por el contexto/API
      setErrorLocal(error.message || 'Ocurrió un error al intentar iniciar sesión.');
      // Podrías usar Alert aquí también si prefieres un popup
      // Alert.alert('Error de Inicio de Sesión', error.message || 'Ocurrió un error');
    }
  };

  return (
    <View style={estilos.contenedor}>
      {/* Muestra el error local si existe */}
      {errorLocal && <MensajeError mensaje={errorLocal} />}

      {/* Campo de Email/Usuario */}
      <CampoEntrada
        etiqueta="Correo Electrónico"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress" // Ayuda a autocompletar en iOS/Android
        editable={!estaCargando} // No editable mientras carga
      />

      {/* Campo de Contraseña */}
      <CampoEntrada
        etiqueta="Contraseña"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Oculta la contraseña
        autoComplete="password"
        textContentType="password" // Ayuda a autocompletar en iOS/Android
        editable={!estaCargando} // No editable mientras carga
      />

      {/* Botón de Inicio de Sesión */}
      <Boton
        titulo="Iniciar Sesión"
        onPress={manejarSubmit}
        deshabilitado={estaCargando} // Deshabilitado si está cargando
        cargando={estaCargando} // Muestra el spinner si está cargando
        estiloContenedor={estilos.boton}
      />
       {/* Podrías añadir un enlace para "¿Olvidaste tu contraseña?" o "Registrarse" aquí */}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    width: '100%', // Ocupa el ancho disponible
    padding: Layout.spacing.medium, // Padding interno
  },
  boton: {
    marginTop: Layout.spacing.medium, // Espacio sobre el botón
  },
});

export default FormularioLogin;