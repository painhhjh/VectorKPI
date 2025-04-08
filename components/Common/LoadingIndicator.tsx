/**
 * @file Componente reutilizable para mostrar un indicador de actividad (spinner).
 * @description Utiliza ActivityIndicator de react-native y colores definidos en las constantes.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '../../constants/Colors'; // Ajusta la ruta si es necesario
import Layout from '../../constants/Layout'; // Ajusta la ruta si es necesario

// Propiedades que puede recibir el componente
interface IndicadorCargaProps {
  tamaño?: 'small' | 'large'; // Tamaño del indicador
  color?: string; // Color personalizado para el indicador
  estiloContenedor?: ViewStyle; // Estilos adicionales para el contenedor
}

const IndicadorCarga: React.FC<IndicadorCargaProps> = ({
  tamaño = 'large',
  color = Colors.primary, // Usa el color primario por defecto
  estiloContenedor,
}) => {
  return (
    <View style={[estilos.contenedor, estiloContenedor]}>
      <ActivityIndicator size={tamaño} color={color} />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1, // Ocupa el espacio disponible si está dentro de un flex container
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
    padding: Layout.spacing.medium, // Añade algo de padding
  },
});

export default IndicadorCarga;