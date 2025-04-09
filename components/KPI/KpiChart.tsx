/**
 * @file Componente para visualizar datos históricos de un KPI en un gráfico de línea.
 * @description Utiliza react-native-chart-kit para renderizar el gráfico de forma segura.
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit'; // Librería actualizada
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

interface KpiChartProps {
  datos: { fecha: Date; valor: number }[];
  nombreKpi: string;
  unidad: string;
}

const KpiChart: React.FC<KpiChartProps> = ({ datos, nombreKpi, unidad }) => {
  // Validación inicial de datos (sin cambios)
  if (!datos || datos.length < 2) {
    return (
      <View style={estilos.contenedorPlaceholder}>
        <Text style={estilos.textoPlaceholder}>
          Datos históricos insuficientes para mostrar el gráfico de {nombreKpi}.
        </Text>
      </View>
    );
  }

  // Preparación de etiquetas y valores (misma lógica original)
  const etiquetasGrafico: string[] = [];
  const valoresGrafico: number[] = [];
  const numeroMaximoEtiquetas = 6;
  const pasoEtiqueta = Math.max(1, Math.ceil(datos.length / numeroMaximoEtiquetas));

  datos.forEach((punto, index) => {
    if (index % pasoEtiqueta === 0 || index === datos.length - 1) {
      etiquetasGrafico.push(`${punto.fecha.getDate()}/${punto.fecha.getMonth() + 1}`);
    } else {
      etiquetasGrafico.push('');
    }
    valoresGrafico.push(punto.valor);
  });

  // Configuración visual del gráfico (adaptada a react-native-chart-kit)
  const configGrafico = {
    backgroundColor: Colors.cardBackground,
    backgroundGradientFrom: Colors.cardBackground,
    backgroundGradientTo: Colors.cardBackground,
    decimalPlaces: 2,
    color: (opacity = 1) => Colors.accent,      // Color principal de la línea
    labelColor: (opacity = 1) => Colors.textSecondary, // Color de las etiquetas
    style: {
      borderRadius: Layout.borderRadius.medium,
    },
    propsForDots: {
      r: '4',                                   // Radio de los puntos
      strokeWidth: '2',
      stroke: Colors.primaryLight,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',                      // Líneas sólidas
      stroke: Colors.border + '80',             // Opacidad del 50%
    }
  };

  return (
    <View style={estilos.contenedorPrincipal}>
      <Text style={estilos.tituloGrafico}>{nombreKpi} - Histórico</Text>
      
      {/* Componente actualizado con nueva sintaxis */}
      <LineChart
        data={{
          labels: etiquetasGrafico,
          datasets: [{
            data: valoresGrafico,
            color: (opacity = 1) => Colors.accent, // Color dinámico de la línea
            strokeWidth: 3                         // Grosor de la línea
          }],
          legend: [`Histórico (${unidad})`]       // Leyenda actualizada
        }}
        width={Dimensions.get('window').width - Layout.spacing.medium * 2}
        height={240}
        yAxisSuffix={` ${unidad}`}                // Sufijo para valores Y
        chartConfig={configGrafico}
        bezier                                     // Suavizado de líneas
        style={estilos.grafico}
        withDots={datos.length <= 30}             // Puntos solo hasta 30 datos
      />
    </View>
  );
};

// Estilos idénticos a la versión original
const estilos = StyleSheet.create({
  contenedorPrincipal: {
    marginVertical: Layout.spacing.medium,
    paddingBottom: Layout.spacing.small,
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.medium,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tituloGrafico: {
    fontSize: Layout.fontSize.subheading,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Layout.spacing.medium,
    marginBottom: Layout.spacing.small,
  },
  grafico: {
    marginVertical: Layout.spacing.small,
    borderRadius: Layout.borderRadius.medium,
  },
  contenedorPlaceholder: {
    minHeight: 150,
    padding: Layout.spacing.medium,
    marginVertical: Layout.spacing.medium,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderStyle: 'dashed',
    borderRadius: Layout.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray + '30',
  },
  textoPlaceholder: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: Layout.fontSize.body,
  },
});

export default KpiChart;