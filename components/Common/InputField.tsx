// Componente reutilizable para campos de entrada de texto.

import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Propiedades extendidas de TextInputProps para personalización
interface CampoEntradaProps extends TextInputProps {
  etiqueta?: string; // Etiqueta opcional sobre el campo
  error?: string; // Mensaje de error opcional debajo del campo
  estiloContenedor?: ViewStyle; // Estilos para el contenedor general
  estiloInput?: TextStyle; // Estilos para el TextInput
  estiloEtiqueta?: TextStyle; // Estilos para la etiqueta
  seguro?: boolean; // Opción para ocultar el texto ingresado (como en contraseñas)
}

const CampoEntrada: React.FC<CampoEntradaProps> = ({
  etiqueta,
  error,
  estiloContenedor,
  estiloInput,
  estiloEtiqueta,
  seguro = false, // Por defecto no es seguro
  style, // Captura el 'style' pasado directamente para aplicarlo al TextInput
  ...otrasProps // Resto de las props de TextInput (value, onChangeText, placeholder, etc.)
}) => {
  const hayError = Boolean(error); // Verifica si hay un mensaje de error

  return (
    <View style={[estilos.contenedor, estiloContenedor]}>
      {etiqueta && <Text style={[estilos.etiqueta, estiloEtiqueta]}>{etiqueta}</Text>}
      <TextInput
        style={[
          estilos.input,
          hayError && estilos.inputError, // Aplica estilo de error si existe
          estiloInput,
          style, // Permite pasar estilos directamente al TextInput
        ]}
        placeholderTextColor={Colors.gray} // Color para el placeholder
        secureTextEntry={seguro} // Opción para ocultar el texto (como en contraseñas)
        {...otrasProps} // Pasa todas las demás props al TextInput
      />
      {hayError && <Text style={estilos.textoError}>{error}</Text>}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: Layout.spacing.medium, // Espacio debajo del campo
    width: '100%', // Ocupa todo el ancho disponible por defecto
  },
  etiqueta: {
    fontSize: Layout.fontSize.body,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.small,
    fontWeight: '500',
  },
  input: {
    height: 48, // Altura fija para consistencia
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Layout.spacing.medium,
    backgroundColor: Colors.white,
    fontSize: Layout.fontSize.body,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.danger, // Borde rojo cuando hay error
  },
  textoError: {
    color: Colors.danger,
    fontSize: Layout.fontSize.caption,
    marginTop: Layout.spacing.tiny,
  },
});

export default CampoEntrada;
