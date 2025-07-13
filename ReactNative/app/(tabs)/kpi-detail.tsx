/**
 * @file Pantalla para mostrar los detalles de un KPI específico.
 * @description Obtiene el ID de los parámetros de ruta, busca los datos y muestra detalles y gráfico.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router'; // Hooks de Expo Router
import { normalizarKpi, obtenerDetalleKpi } from '../../services/kpiService';
import KpiChart from '../../components/KPI/KpiChart';
import IndicadorCarga from '../../components/Common/LoadingIndicator';
import MensajeError from '../../components/Common/ErrorMessage';
import { KPI, KpiListResponse } from '../../types';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { get } from '@/services/api';
import ApiConstants from '@/constants/Api';

type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

// Función para generar datos de gráfico simulados (¡REEMPLAZAR CON DATOS REALES!)
// const generarDatosSimulados = (valorActual: number): { fecha: Date; valor: number }[] => {
//     const datos: { fecha: Date; valor: number }[] = [];
//     const hoy = new Date();
//     for (let i = 10; i >= 0; i--) { // Genera 11 puntos (hoy y 10 días atrás)
//         const fecha = new Date(hoy);
//         fecha.setDate(hoy.getDate() - i);
//         // Simula una variación aleatoria alrededor del valor actual
//         const variacion = (Math.random() - 0.5) * valorActual * 0.1; // +/- 5%
//         datos.push({ fecha, valor: parseFloat((valorActual + variacion).toFixed(2)) });
//     }
//     return datos;
// };


export default function PantallaDetalleKpi() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [datosGrafico, setDatosGrafico] = useState<{ fecha: Date; valor: number }[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);
  const [todosKpis, setTodosKpis] = useState<KPI[]>([]);

  // Función para cargar todos los KPIs
  const cargarTodosKpis = useCallback(async () => {
  try {
    const { data } = await get<KpiListResponse>(ApiConstants.KPIS);
    setTodosKpis(data.results.map(kpi => ({
      ...kpi,
      last_updated: kpi.last_updated ? new Date(kpi.last_updated).toISOString() : new Date().toISOString(),
      created_at: kpi.created_at ? new Date(kpi.created_at).toISOString() : new Date().toISOString(),
      value: Number(kpi.value) || 0,
      target: kpi.target !== undefined ? Number(kpi.target) : undefined,
      // Add progress calculation if needed
      progress: kpi.target ? Math.min(Math.round((Number(kpi.value) / kpi.target) * 100), 100) : 0
    })));
  } catch (err) {
    console.error('Error cargando todos los KPIs:', err);
  }
}, []);


  // Cargar todos los KPIs al montar el componente
  useEffect(() => {
    cargarTodosKpis();
  }, []);

  //Recargar KPIs al abrir el componente de nuevo
useFocusEffect(
  useCallback(() => {
    const reloadData = async () => {
      await cargarTodosKpis(); // Re-fetch ALL KPIs first
      if (id) cargarDetalle(); // Then load detail
    };
    reloadData();
  }, [id])
);

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
      const detalle = await obtenerDetalleKpi(Number(id));
      setKpi(detalle);

      // Filtrar y ordenar KPIs con el mismo nombre en el frontend
      const historico = todosKpis
        .filter(k => k.name === detalle.name)
        .sort((a, b) => 
          new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime()
        );

      const datosReales = historico.map(k => ({
        fecha: new Date(k.last_updated),
        valor: k.value
      }));

      console.log("Data para el graifco:", datosReales); // Verify freshness
      setDatosGrafico(datosReales);
      setEstadoCarga('exito');
      console.log(`[KpiDetail] Detalle cargado para: ${detalle.name}`);
    } catch (err: any) {
      console.error(`[KpiDetail] Error al cargar detalle del KPI ${id}:`, err);
      setError(err.message || 'No se pudo cargar el detalle del indicador.');
      setEstadoCarga('error');
      setKpi(null);
      setDatosGrafico([]);
    }
  }, [id, todosKpis]); // Depende del ID y todosKpis

  // Carga los datos cuando el ID cambia o el componente se monta
  useEffect(() => {
    if (todosKpis.length > 0) { // Solo cargar detalle si ya tenemos todos los KPIs
      cargarDetalle();
    }
  }, [cargarDetalle, todosKpis]);


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
        <Text style={estilos.infoAdicional}>Última Actualización: {new Date(kpi.last_updated).toLocaleString()}</Text>
      </View>

      {/* Renderiza el gráfico con los datos REALES */}
      <KpiChart
        key={`${kpi.id}`}
        datos={datosGrafico}
        nombreKpi={kpi.name}
        unidad={kpi.unit}
      />

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