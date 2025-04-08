/**
 * @file Componente reutilizable de botón.
 * @description Permite diferentes variantes (primario, secundario) y estado deshabilitado.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Colors from '../../constants/Colors'; // Ajusta la ruta si es necesario
import Layout from '../../constants/Layout'; // Ajusta la ruta si es necesario

// Define los tipos de variantes visuales para el botón
type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'texto';

// Propiedades que puede recibir el componente
interface BotonProps {
  titulo: string; // Texto a mostrar en el botón
  onPress: () => void; // Función a ejecutar al presionar
  variante?: VarianteBoton; // Estilo visual del botón
  deshabilitado?: boolean; // Si el botón está inactivo
  cargando?: boolean; // Si se debe mostrar un indicador de carga
  estiloContenedor?: ViewStyle; // Estilos para el contenedor TouchableOpacity
  estiloTexto?: TextStyle; // Estilos para el texto del botón
  iconoIzquierda?: React.ReactNode; // Icono opcional a la izquierda del texto
  iconoDerecha?: React.ReactNode; // Icono opcional a la derecha del texto
}

const Boton: React.FC<BotonProps> = ({
  titulo,
  onPress,
  variante = 'primario',
  deshabilitado = false,
  cargando = false,
  estiloContenedor,
  estiloTexto,
  iconoIzquierda,
  iconoDerecha,
}) => {
  // Determina si el botón debe estar inactivo
  const estaInactivo = deshabilitado || cargando;

  // Selecciona los estilos basados en la variante y el estado
  const estilosBoton = [
    estilos.baseContenedor,
    estilos[`${variante}Contenedor`],
    estaInactivo && estilos.contenedorDeshabilitado,
    estiloContenedor, // Permite sobrescribir estilos
  ];

  const estilosTextoBoton = [
    estilos.baseTexto,
    estilos[`${variante}Texto`],
    estaInactivo && estilos.textoDeshabilitado,
    estiloTexto, // Permite sobrescribir estilos
  ];

  return (
    <TouchableOpacity
      style={estilosBoton}
      onPress={onPress}
      disabled={estaInactivo}
      activeOpacity={0.7} // Efecto visual al presionar
    >
      {cargando ? (
        <ActivityIndicator size="small" color={variante === 'primario' ? Colors.white : Colors.primary} />
      ) : (
        <>
          {iconoIzquierda}
          <Text style={estilosTextoBoton}>{titulo}</Text>
          {iconoDerecha}
        </>
      )}
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  // Estilos base comunes a todos los botones
  baseContenedor: {
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    borderRadius: Layout.borderRadius.round, // Botones redondeados por defecto
    alignItems: 'center', // Centra el contenido (texto/icono)
    justifyContent: 'center', // Centra el contenido
    flexDirection: 'row', // Para alinear iconos y texto
    minHeight: 48, // Altura mínima
    borderWidth: 1, // Borde por defecto
    borderColor: 'transparent', // Transparente por defecto, se cambia por variante
  },
  baseTexto: {
    fontSize: Layout.fontSize.subheading,
    fontWeight: '600', // Texto semi-negrita
    textAlign: 'center',
    marginHorizontal: Layout.spacing.small, // Espacio si hay iconos
  },
  // Estilos para la variante 'primario'
  primarioContenedor: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  primarioTexto: {
    color: Colors.white,
  },
  // Estilos para la variante 'secundario'
  secundarioContenedor: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  secundarioTexto: {
    color: Colors.primary,
  },
  // Estilos para la variante 'peligro'
  peligroContenedor: {
      backgroundColor: Colors.danger,
      borderColor: Colors.danger,
  },
  peligroTexto: {
      color: Colors.white,
  },
  // Estilos para la variante 'texto' (sin fondo ni borde visible)
  textoContenedor: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      paddingVertical: Layout.spacing.small, // Menos padding vertical
  },
  textoTexto: {
      color: Colors.primary,
      fontWeight: '500', // Ligeramente menos grueso
  },
  // Estilos para el estado deshabilitado/cargando
  contenedorDeshabilitado: {
    backgroundColor: Colors.lightGray,
    borderColor: Colors.lightGray,
    opacity: 0.7, // Ligeramente transparente
  },
  textoDeshabilitado: {
    color: Colors.gray,
  },
});

export default Boton;