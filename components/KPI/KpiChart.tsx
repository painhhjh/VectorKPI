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
    // Agrega una etiqueta cada 'pasoEtiqueta' elementos o en el último elemento
    if (index % pasoEtiqueta === 0 || index === datos.length - 1) {
      etiquetasGrafico.push(`${punto.fecha.getDate()}/${punto.fecha.getMonth() + 1}`); // Formatea la fecha como día/mes
    } else {
      etiquetasGrafico.push(''); // Deja la etiqueta vacía para mantener el espacio
    }
    valoresGrafico.push(punto.valor); // Agrega el valor del KPI al array de valores
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