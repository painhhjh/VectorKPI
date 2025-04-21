//Componente reutilizable de tarjeta para agrupar contenido.
  import React from 'react';
  import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
  import Colors from '../../constants/Colors';
  import Layout from '../../constants/Layout';
  
  // Propiedades que puede recibir el componente
  interface TarjetaProps {
    children: React.ReactNode; // El contenido que irá dentro de la tarjeta
    estiloContenedor?: ViewStyle; // Estilos adicionales para el contenedor View
  }
  
  const Tarjeta: React.FC<TarjetaProps> = ({ children, estiloContenedor }) => {
    return <View style={[estilos.contenedor, estiloContenedor]}>{children}</View>;
  };
  
  const estilos = StyleSheet.create({
    contenedor: {
      backgroundColor: Colors.cardBackground, // Fondo blanco o el definido
      borderRadius: Layout.borderRadius.medium, // Bordes redondeados
      padding: Layout.spacing.medium, // Padding interno
      marginBottom: Layout.spacing.medium, // Margen inferior para separar tarjetas
      // Sombra sutil para dar profundidad (ajustes para iOS y Android)
      ...Platform.select({
        ios: {
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3, // Elevación para sombra en Android
          // Si el fondo es igual al del contenedor padre, se puede agregar un borde para destacar
          borderColor: Colors.border,
          borderWidth: 1,
        },
      }),
    },
  });
  
  export default Tarjeta;
  