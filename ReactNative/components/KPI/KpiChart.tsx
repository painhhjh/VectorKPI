//Componente para visualizar datos históricos de un KPI en un gráfico de línea.

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

interface KpiChartProps {
  datos: { fecha: Date; valor: number }[];
  nombreKpi: string;
  unidad: string;
}

const KpiChart: React.FC<KpiChartProps> = ({ datos, nombreKpi, unidad }) => {
  // If no data or only one point, show message
  if (!datos || datos.length <= 1) {
    return (
      <View style={estilos.contenedorPlaceholder}>
        <Text style={estilos.textoPlaceholder}>
          {datos.length === 1 
            ? `Solo hay un dato registrado para ${nombreKpi}`
            : `No hay suficientes datos históricos para ${nombreKpi}`}
        </Text>
      </View>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: datos.map(punto => 
      `${punto.fecha.getDate()}/${punto.fecha.getMonth() + 1}`),
    datasets: [{
      data: datos.map(punto => punto.valor),
      color: (opacity = 1) => Colors.accent,
      strokeWidth: 2
    }]
  };

  return (
    <View style={estilos.contenedorPrincipal}>
      <Text style={estilos.tituloGrafico}>{nombreKpi} - Histórico</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - Layout.spacing.medium * 2}
        height={220}
        yAxisSuffix={` ${unidad}`}
        chartConfig={{
          backgroundColor: Colors.cardBackground,
          backgroundGradientFrom: Colors.cardBackground,
          backgroundGradientTo: Colors.cardBackground,
          decimalPlaces: 2,
          color: (opacity = 1) => Colors.accent,
          labelColor: (opacity = 1) => Colors.textSecondary,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: Colors.primaryLight
          }
        }}
        bezier
        style={estilos.grafico}
      />
    </View>
  );
};
//old version
// const KpiChart: React.FC<KpiChartProps> = ({ datos, nombreKpi, unidad }) => {
//   // Validación inicial de datos - ahora muestra mensajes más específicos
//   if (!datos || datos.length === 0) {
//     return (
//       <View style={estilos.contenedorPlaceholder}>
//         <Text style={estilos.textoPlaceholder}>
//           No hay datos históricos disponibles para {nombreKpi}.
//         </Text>
//       </View>
//     );
//   }

//   if (datos.length === 1) {
//     return (
//       <View style={estilos.contenedorPlaceholder}>
//         <Text style={estilos.textoPlaceholder}>
//           Solo hay un dato registrado para {nombreKpi} (no suficiente para mostrar tendencia).
//         </Text>
//       </View>
//     );
//   }

//   // Ordenar los datos por fecha (ascendente) para asegurar el orden correcto
//   const datosOrdenados = [...datos].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

//   // Preparación de etiquetas y valores optimizada
//   const etiquetasGrafico: string[] = [];
//   const valoresGrafico: number[] = [];
//   const numeroMaximoEtiquetas = 6;
//   const pasoEtiqueta = Math.max(1, Math.ceil(datosOrdenados.length / numeroMaximoEtiquetas));

//   datosOrdenados.forEach((punto, index) => {
//     valoresGrafico.push(punto.valor);
    
//     // Agrega etiquetas solo para ciertos puntos para evitar saturación
//     if (index % pasoEtiqueta === 0 || index === datosOrdenados.length - 1) {
//       // Mejor formato de fecha: "DD/MM" o "DD/MM/YY" si abarca múltiples años
//       const yearNeeded = datosOrdenados.some(d => 
//         d.fecha.getFullYear() !== punto.fecha.getFullYear()
//       );
      
//       etiquetasGrafico.push(
//         yearNeeded
//           ? `${punto.fecha.getDate()}/${punto.fecha.getMonth() + 1}/${punto.fecha.getFullYear().toString().slice(-2)}`
//           : `${punto.fecha.getDate()}/${punto.fecha.getMonth() + 1}`
//       );
//     } else {
//       etiquetasGrafico.push('');
//     }
//   });

//   // Configuración visual mejorada del gráfico
//   const configGrafico = {
//     backgroundColor: Colors.cardBackground,
//     backgroundGradientFrom: Colors.cardBackground,
//     backgroundGradientTo: Colors.cardBackground,
//     decimalPlaces: 2,
//     color: (opacity = 1) => Colors.accent,
//     labelColor: (opacity = 1) => Colors.textSecondary,
//     fillShadowGradient: Colors.accent + '40', // Sombra bajo la línea con opacidad
//     fillShadowGradientOpacity: 0.2,
//     style: {
//       borderRadius: Layout.borderRadius.medium,
//     },
//     propsForDots: {
//       r: datosOrdenados.length > 30 ? '0' : '4', // Oculta puntos si hay muchos datos
//       strokeWidth: '2',
//       stroke: Colors.primaryLight,
//     },
//     propsForBackgroundLines: {
//       strokeDasharray: '',
//       stroke: Colors.border + '80',
//     },
//     propsForLabels: {
//       fontSize: 10,
//     }
//   };

//   return (
//     <View style={estilos.contenedorPrincipal}>
//       <Text style={estilos.tituloGrafico}>
//         {nombreKpi} - Evolución Histórica ({unidad})
//       </Text>
      
//       <LineChart
//         data={{
//           labels: etiquetasGrafico,
//           datasets: [{
//             data: valoresGrafico,
//             color: (opacity = 1) => Colors.accent,
//             strokeWidth: 2
//           }],
//           legend: [`Última actualización: ${datosOrdenados[datosOrdenados.length - 1].valor} ${unidad}`]
//         }}
//         width={Dimensions.get('window').width - Layout.spacing.medium * 2}
//         height={220}
//         yAxisSuffix={` ${unidad}`}
//         yAxisInterval={1}
//         chartConfig={configGrafico}
//         bezier
//         style={estilos.grafico}
//         withDots={datosOrdenados.length <= 30}
//         withShadow={true}
//         withInnerLines={true}
//         withOuterLines={true}
//         fromZero={false}
//         getDotColor={(dataPoint, index) => {
//           // Destaca el punto más reciente
//           return index === datosOrdenados.length - 1 ? Colors.primary : Colors.accent;
//         }}
//       />
//     </View>
//   );
// };

// Estilos idénticos a la versión original
const estilos = StyleSheet.create({
  // Contenedor principal del gráfico
  contenedorPrincipal: {
    marginVertical: Layout.spacing.medium, // Margen vertical
    paddingBottom: Layout.spacing.small,  // Espaciado inferior
    backgroundColor: Colors.cardBackground, // Fondo del contenedor
    borderRadius: Layout.borderRadius.medium, // Bordes redondeados
    alignItems: 'center', // Alineación centrada
    shadowColor: Colors.black, // Color de la sombra
    shadowOffset: { width: 0, height: 1 }, // Desplazamiento de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 3, // Radio de la sombra
    elevation: 2, // Elevación para Android
  },
  // Estilo del título del gráfico
  tituloGrafico: {
    fontSize: Layout.fontSize.subheading, // Tamaño de fuente
    fontWeight: '600', // Grosor de la fuente
    color: Colors.text, // Color del texto
    marginTop: Layout.spacing.medium, // Margen superior
    marginBottom: Layout.spacing.small, // Margen inferior
  },
  // Estilo del gráfico
  grafico: {
    marginVertical: Layout.spacing.small, // Margen vertical
    borderRadius: Layout.borderRadius.medium, // Bordes redondeados
  },
  // Contenedor para el mensaje de datos insuficientes
  contenedorPlaceholder: {
    minHeight: 150, // Altura mínima
    padding: Layout.spacing.medium, // Espaciado interno
    marginVertical: Layout.spacing.medium, // Margen vertical
    borderWidth: 1, // Ancho del borde
    borderColor: Colors.lightGray, // Color del borde
    borderStyle: 'dashed', // Estilo del borde
    borderRadius: Layout.borderRadius.medium, // Bordes redondeados
    justifyContent: 'center', // Alineación vertical centrada
    alignItems: 'center', // Alineación horizontal centrada
    backgroundColor: Colors.lightGray + '30', // Fondo con opacidad
  },
  // Estilo del texto del mensaje de datos insuficientes
  textoPlaceholder: {
    textAlign: 'center', // Alineación centrada del texto
    color: Colors.gray, // Color del texto
    fontSize: Layout.fontSize.body, // Tamaño de fuente
  },
});

export default KpiChart;