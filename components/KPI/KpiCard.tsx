//muestra un resumen de un KPI en una tarjeta. Muestra nombre, valor, unidad, objetivo y tendencia. 
// Es presionable para navegar al detalle.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Tarjeta from '../Common/Card'; // Importa el componente base de tarjeta
import { KPI, KpiTrend } from '../../types';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Propiedades que recibe el componente
interface KpiCardProps {
  kpi: KPI; // Los datos del KPI a mostrar
}

// Función helper para obtener el icono y color de la tendencia
const obtenerInfoTendencia = (tendencia: KpiTrend): { icono: React.ComponentProps<typeof Ionicons>['name']; color: string } => {
  switch (tendencia) {
    case 'up': // Tendencia al alza
      return { icono: 'arrow-up-circle', color: Colors.success };
    case 'down': // Tendencia a la baja
      return { icono: 'arrow-down-circle', color: Colors.danger };
    case 'stable': // Tendencia estable
    default:
      return { icono: 'remove-circle', color: Colors.gray };
  }
};

const KpiCard: React.FC<KpiCardProps> = ({ kpi }) => {
  const router = useRouter();
  const { icono: iconoTendencia, color: colorTendencia } = obtenerInfoTendencia(kpi.trend);

  // Navega a la pantalla de detalle pasando el ID del KPI
  const navegarADetalle = () => {
    // Usa el path definido en app/(tabs)/_layout.tsx para kpi-detail
    // Pasamos el id como parámetro de consulta
    router.push({
        pathname: '/(tabs)/kpi-detail',
        params: { id: kpi.id }
    });
  };

  return (
    <TouchableOpacity onPress={navegarADetalle} activeOpacity={0.8}> {/* Hace la tarjeta presionable */}
      <Tarjeta estiloContenedor={estilos.tarjetaContenedor}> {/* Componente base de tarjeta */}
        <View style={estilos.filaSuperior}> {/* Contenedor para el nombre y tendencia */}
          <Text style={estilos.nombreKpi} numberOfLines={2}>{kpi.name}</Text> {/* Nombre del KPI */}
          <Ionicons name={iconoTendencia} size={28} color={colorTendencia} /> {/* Icono de tendencia */}
        </View>
        <View style={estilos.filaInferior}> {/* Contenedor para valor y objetivo */}
          <Text style={estilos.valorKpi}>
            {kpi.value.toLocaleString()} {/* Formatea el valor del KPI */}
            <Text style={estilos.unidadKpi}> {kpi.unit}</Text> {/* Unidad del KPI */}
          </Text>
          {kpi.target !== undefined && ( // Muestra el objetivo solo si existe
            <Text style={estilos.objetivoKpi}>
              Objetivo: {kpi.target.toLocaleString()} {kpi.unit} {/* Objetivo del KPI */}
            </Text>
          )}
        </View>
         <Text style={estilos.categoria}>Categoría: {kpi.category}</Text> {/* Categoría del KPI */}
         <Text style={estilos.fechaActualizacion}>Actualizado: {new Date(kpi.lastUpdated).toLocaleDateString()}</Text> {/* Fecha de actualización */}
      </Tarjeta>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  tarjetaContenedor: {
    // Estilo base para el contenedor de la tarjeta
  },
  filaSuperior: {
    flexDirection: 'row', // Organiza los elementos en fila
    justifyContent: 'space-between', // Espacia los elementos al máximo
    alignItems: 'flex-start', // Alinea los elementos al inicio verticalmente
    marginBottom: Layout.spacing.medium, // Espaciado inferior
  },
  nombreKpi: {
    fontSize: Layout.fontSize.heading, // Tamaño de fuente para el título
    fontWeight: '600', // Grosor de la fuente
    color: Colors.text, // Color del texto
    flex: 1, // Ocupa el espacio disponible
    marginRight: Layout.spacing.small, // Espaciado derecho antes del icono
  },
  filaInferior: {
    flexDirection: 'row', // Organiza los elementos en fila
    justifyContent: 'space-between', // Espacia los elementos al máximo
    alignItems: 'baseline', // Alinea los elementos por la línea base del texto
    marginBottom: Layout.spacing.small, // Espaciado inferior
  },
  valorKpi: {
    fontSize: Layout.fontSize.display, // Tamaño de fuente para el valor principal
    fontWeight: 'bold', // Fuente en negrita
    color: Colors.primary, // Color principal
  },
  unidadKpi: {
    fontSize: Layout.fontSize.body, // Tamaño de fuente para la unidad
    fontWeight: 'normal', // Fuente normal
    color: Colors.textSecondary, // Color secundario del texto
  },
  objetivoKpi: {
    fontSize: Layout.fontSize.body, // Tamaño de fuente para el objetivo
    color: Colors.textSecondary, // Color secundario del texto
  },
  categoria: {
    fontSize: Layout.fontSize.caption, // Tamaño de fuente para la categoría
    color: Colors.gray, // Color gris
    fontStyle: 'italic', // Estilo de fuente en cursiva
    marginTop: Layout.spacing.small, // Espaciado superior
  },
  fechaActualizacion: {
    fontSize: Layout.fontSize.caption, // Tamaño de fuente para la fecha
    color: Colors.gray, // Color gris
    marginTop: Layout.spacing.tiny, // Espaciado superior pequeño
    textAlign: 'right', // Alineación del texto a la derecha
  },
});

export default KpiCard;