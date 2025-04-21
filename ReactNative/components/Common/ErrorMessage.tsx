//Componente reutilizable para mostrar mensajes de error.

import React from 'react';
import { Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Propiedades que puede recibir el componente
interface MensajeErrorProps {
  mensaje: string; // El texto del error a mostrar
  estiloContenedor?: ViewStyle; // Estilos para el contenedor del texto
  estiloTexto?: TextStyle; // Estilos para el texto del error
}

const MensajeError: React.FC<MensajeErrorProps> = ({
  mensaje,
  estiloContenedor,
  estiloTexto,
}) => {
  // No renderizar nada si no hay mensaje
  if (!mensaje) {
    return null;
  }

  return (
    <View style={[estilos.contenedor, estiloContenedor]}>
      <Text style={[estilos.textoError, estiloTexto]}>{mensaje}</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    paddingVertical: Layout.spacing.small, // Espaciado vertical
    paddingHorizontal: Layout.spacing.medium, // Espaciado horizontal
    backgroundColor: Colors.danger + '20', // Fondo rojo muy claro (con transparencia)
    borderRadius: Layout.borderRadius.small, // Bordes redondeados
    borderLeftWidth: 4, // Borde izquierdo para destacar
    borderLeftColor: Colors.danger, // Color del borde izquierdo
    marginVertical: Layout.spacing.small, // Margen vertical
  },
  textoError: {
    color: Colors.danger, // Color del texto
    fontSize: Layout.fontSize.body, // Tamaño de fuente
    fontWeight: '500', // Un poco más grueso
  },
});

export default MensajeError;