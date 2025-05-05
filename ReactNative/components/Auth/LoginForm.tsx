// ReactNative/components/Auth/LoginForm.tsx

// Componente de formulario para el inicio de sesión.
// CORRECCIÓN: Simplifica el manejo de errores, confiando en el mensaje del servicio/contexto.

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native'; // Removido Alert, usar MensajeError
import { useAuth } from '../../contexts/useAuth';
import CampoEntrada from '../Common/InputField'; // Renombrado a CampoEntrada consistentemente
import Boton from '../Common/Button';
import MensajeError from '../Common/ErrorMessage';
import Layout from '../../constants/Layout';

const FormularioLogin: React.FC = () => {
  const { login, estado } = useAuth(); // Obtiene la función de login y el estado del contexto
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null); // Para errores específicos del formulario o de la API

  // Determina si el formulario está en proceso de envío (usando el estado del contexto)
  const estaCargando = estado === 'cargando';

  // Manejador para el envío del formulario
  const manejarSubmit = async () => {
    // Validación básica de campos
    if (!email || !password) {
      setErrorLocal('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setErrorLocal(null); // Limpia errores previos antes de intentar

    try {
      // Llama a la función login del contexto
      console.log('[LoginForm] Intentando login con:', email);
      await login({ email, password });
      // La navegación ocurre en el AuthContext si el login es exitoso
      console.log('[LoginForm] Llamada a login del contexto completada (no indica éxito necesariamente aquí).');

    } catch (error: any) {
      console.error('[LoginForm] Error atrapado desde el contexto/servicio:', error);
      // Muestra el error devuelto por el contexto/servicio (que ya debería estar formateado)
      setErrorLocal(error.message || 'Ocurrió un error al intentar iniciar sesión.');
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
        textContentType="emailAddress"
        editable={!estaCargando} // No editable mientras carga
        // Añade returnKeyType para mejorar la experiencia del teclado
        returnKeyType="next"
        // onSubmitEditing podría mover el foco al siguiente campo si tienes la referencia
      />

      {/* Campo de Contraseña */}
      <CampoEntrada
        etiqueta="Contraseña"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Oculta la contraseña
        autoComplete="password"
        textContentType="password"
        editable={!estaCargando} // No editable mientras carga
        // Permite enviar el formulario desde el teclado
        returnKeyType="done"
        onSubmitEditing={!estaCargando ? manejarSubmit : undefined}
      />

      {/* Botón de Inicio de Sesión */}
      <Boton
        titulo="Iniciar Sesión"
        onPress={manejarSubmit}
        deshabilitado={estaCargando} // Deshabilitado si está cargando
        cargando={estaCargando} // Muestra el spinner si está cargando
        estiloContenedor={estilos.boton}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    width: '100%', // Ocupa el ancho disponible
    // Removido padding aquí, usualmente se maneja en la pantalla contenedora
  },
  boton: {
    marginTop: Layout.spacing.medium, // Espacio sobre el botón
  },
});

export default FormularioLogin;