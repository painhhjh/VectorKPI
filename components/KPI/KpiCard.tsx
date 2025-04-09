/**
 * @file Componente para mostrar un resumen de un KPI en una tarjeta.
 * @description Muestra nombre, valor, unidad, objetivo y tendencia. Es presionable para navegar al detalle.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // O tu librería de iconos preferida
import Tarjeta from '../Common/Card'; // Importa el componente base de tarjeta
import { KPI, KpiTrend } from '../../types'; // Importa los tipos
import Colors from '../../constants/Colors'; // Importa los colores
import Layout from '../../constants/Layout'; // Importa el layout

// Propiedades que recibe el componente
interface KpiCardProps {
  kpi: KPI; // Los datos del KPI a mostrar
}

// Función helper para obtener el icono y color de la tendencia
const obtenerInfoTendencia = (tendencia: KpiTrend): { icono: React.ComponentProps<typeof Ionicons>['name']; color: string } => {
  switch (tendencia) {
    case 'up':
      return { icono: 'arrow-up-circle', color: Colors.success };
    case 'down':
      return { icono: 'arrow-down-circle', color: Colors.danger };
    case 'stable':
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
    <TouchableOpacity onPress={navegarADetalle} activeOpacity={0.8}>
      <Tarjeta estiloContenedor={estilos.tarjetaContenedor}>
        <View style={estilos.filaSuperior}>
          <Text style={estilos.nombreKpi} numberOfLines={2}>{kpi.name}</Text>
          <Ionicons name={iconoTendencia} size={28} color={colorTendencia} />
        </View>
        <View style={estilos.filaInferior}>
          <Text style={estilos.valorKpi}>
            {kpi.value.toLocaleString()} {/* Formatea el número */}
            <Text style={estilos.unidadKpi}> {kpi.unit}</Text>
          </Text>
          {kpi.target !== undefined && ( // Muestra el objetivo solo si existe
            <Text style={estilos.objetivoKpi}>
              Objetivo: {kpi.target.toLocaleString()} {kpi.unit}
            </Text>
          )}
        </View>
         <Text style={estilos.categoria}>Categoría: {kpi.category}</Text>
         <Text style={estilos.fechaActualizacion}>Actualizado: {new Date(kpi.lastUpdated).toLocaleDateString()}</Text>
      </Tarjeta>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  tarjetaContenedor: {
    // Puedes añadir estilos específicos para la tarjeta de KPI aquí si es necesario
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Alinea al inicio por si el texto ocupa 2 líneas
    marginBottom: Layout.spacing.medium,
  },
  nombreKpi: {
    fontSize: Layout.fontSize.heading,
    fontWeight: '600',
    color: Colors.text,
    flex: 1, // Permite que el texto ocupe el espacio disponible
    marginRight: Layout.spacing.small, // Espacio antes del icono
  },
  filaInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline', // Alinea por la línea base del texto
    marginBottom: Layout.spacing.small,
  },
  valorKpi: {
    fontSize: Layout.fontSize.display,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  unidadKpi: {
    fontSize: Layout.fontSize.body,
    fontWeight: 'normal',
    color: Colors.textSecondary,
  },
  objetivoKpi: {
    fontSize: Layout.fontSize.body,
    color: Colors.textSecondary,
  },
   categoria: {
     fontSize: Layout.fontSize.caption,
     color: Colors.gray,
     fontStyle: 'italic',
     marginTop: Layout.spacing.small,
   },
   fechaActualizacion: {
     fontSize: Layout.fontSize.caption,
     color: Colors.gray,
     marginTop: Layout.spacing.tiny,
     textAlign: 'right',
   },
});

export default KpiCard;