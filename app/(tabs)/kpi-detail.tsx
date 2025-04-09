/**
 * @file Pantalla para mostrar los detalles de un KPI específico.
 * @description Obtiene el ID de los parámetros de ruta, busca los datos y muestra detalles y gráfico.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'; // Hooks de Expo Router
import { obtenerDetalleKpi } from '../../services/kpiService'; // Ajusta la ruta
import KpiChart from '../../components/KPI/KpiChart'; // Ajusta la ruta
import IndicadorCarga from '../../components/Common/LoadingIndicator'; // Ajusta la ruta
import MensajeError from '../../components/Common/ErrorMessage'; // Ajusta la ruta
import { KPI } from '../../types'; // Ajusta la ruta
import Colors from '../../constants/Colors'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta

type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

// Función para generar datos de gráfico simulados (¡REEMPLAZAR CON DATOS REALES!)
const generarDatosSimulados = (valorActual: number): { fecha: Date; valor: number }[] => {
    const datos: { fecha: Date; valor: number }[] = [];
    const hoy = new Date();
    for (let i = 10; i >= 0; i--) { // Genera 11 puntos (hoy y 10 días atrás)
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        // Simula una variación aleatoria alrededor del valor actual
        const variacion = (Math.random() - 0.5) * valorActual * 0.1; // +/- 5%
        datos.push({ fecha, valor: parseFloat((valorActual + variacion).toFixed(2)) });
    }
    return datos;
};


export default function PantallaDetalleKpi() {
  const { id } = useLocalSearchParams<{ id?: string }>(); // Obtiene el 'id' de los parámetros de ruta
  const router = useRouter();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [datosGrafico, setDatosGrafico] = useState<{ fecha: Date; valor: number }[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los detalles del KPI
  const cargarDetalle = useCallback(async () => {
    if (!id) {
      setError('No se proporcionó un ID de KPI.');
      setEstadoCarga('error');
      return;
    }
    console.log(`[KpiDetail] Cargando detalle para KPI ID: ${id}`);
    setEstadoCarga('cargando');
    setError(null);

    try {
      const detalle = await obtenerDetalleKpi(id);
      setKpi(detalle);
      // --- ¡¡¡Simulación de datos para el gráfico!!! ---
      // TODO: Reemplaza esto con la lógica para obtener datos históricos reales desde tu API
      const datosSimulados = generarDatosSimulados(detalle.value);
      setDatosGrafico(datosSimulados);
      // --- Fin de la simulación ---
      setEstadoCarga('exito');
      console.log(`[KpiDetail] Detalle cargado para: ${detalle.name}`);
    } catch (err: any) {
      console.error(`[KpiDetail] Error al cargar detalle del KPI ${id}:`, err);
      setError(err.message || 'No se pudo cargar el detalle del indicador.');
      setEstadoCarga('error');
      setKpi(null);
      setDatosGrafico([]);
    }
  }, [id]); // Depende del ID

  // Carga los datos cuando el ID cambia o el componente se monta
  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]); // Ejecuta cuando cargarDetalle (y por ende id) cambia


  // Renderizado condicional
  if (estadoCarga === 'cargando' || estadoCarga === 'idle') {
    return <IndicadorCarga tamaño="large" />;
  }

  if (estadoCarga === 'error' || !kpi) {
    return <MensajeError mensaje={error || 'No se pudo cargar el KPI.'} />;
  }

  // Si tenemos datos, renderizamos los detalles
  return (
    <ScrollView style={estilos.contenedorScroll} contentContainerStyle={estilos.contenidoScroll}>
      {/* Configura el título de la cabecera dinámicamente */}
      <Stack.Screen options={{ title: kpi.name || 'Detalle KPI' }} />

      <View style={estilos.contenedorInfo}>
        <Text style={estilos.nombre}>{kpi.name}</Text>
        {kpi.description && <Text style={estilos.descripcion}>{kpi.description}</Text>}

        <View style={estilos.filaValores}>
          <View style={estilos.contenedorValor}>
            <Text style={estilos.etiquetaValor}>Valor Actual</Text>
            <Text style={estilos.valorPrincipal}>
              {kpi.value.toLocaleString()} <Text style={estilos.unidad}>{kpi.unit}</Text>
            </Text>
          </View>
          {kpi.target !== undefined && (
            <View style={estilos.contenedorValor}>
              <Text style={estilos.etiquetaValor}>Objetivo</Text>
              <Text style={estilos.valorSecundario}>
                {kpi.target.toLocaleString()} <Text style={estilos.unidad}>{kpi.unit}</Text>
              </Text>
            </View>
          )}
        </View>

        <Text style={estilos.infoAdicional}>Categoría: {kpi.category}</Text>
        <Text style={estilos.infoAdicional}>Tendencia: {kpi.trend}</Text>
        <Text style={estilos.infoAdicional}>Última Actualización: {new Date(kpi.lastUpdated).toLocaleString()}</Text>
      </View>

      {/* Renderiza el gráfico con los datos */}
      <KpiChart
        datos={datosGrafico}
        nombreKpi={kpi.name}
        unidad={kpi.unit}
      />

      {/* Podrías añadir aquí botones para editar/eliminar si tienes permisos */}
      {/* <Boton titulo="Editar" onPress={() => {}} variante="secundario" /> */}
      {/* <Boton titulo="Eliminar" onPress={() => {}} variante="peligro" /> */}

    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedorScroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contenidoScroll: {
    padding: Layout.spacing.medium,
  },
  contenedorInfo: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.large,
    marginBottom: Layout.spacing.medium,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  nombre: {
    fontSize: Layout.fontSize.title,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.small,
  },
  descripcion: {
    fontSize: Layout.fontSize.body,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.medium,
    lineHeight: Layout.fontSize.body * 1.5,
  },
  filaValores: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Espacia los valores
    marginBottom: Layout.spacing.medium,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Layout.spacing.medium,
  },
  contenedorValor: {
    alignItems: 'center', // Centra el texto dentro de su contenedor
  },
  etiquetaValor: {
    fontSize: Layout.fontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.tiny,
    textTransform: 'uppercase',
  },
  valorPrincipal: {
    fontSize: Layout.fontSize.display * 0.9, // Ligeramente más pequeño que en la tarjeta
    fontWeight: 'bold',
    color: Colors.primary,
  },
   valorSecundario: {
     fontSize: Layout.fontSize.heading,
     fontWeight: '500',
     color: Colors.text,
   },
  unidad: {
    fontSize: Layout.fontSize.body,
    fontWeight: 'normal',
    color: Colors.textSecondary,
  },
  infoAdicional: {
    fontSize: Layout.fontSize.body,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.tiny,
  },
});