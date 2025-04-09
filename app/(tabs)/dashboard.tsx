/**
 * @file Pantalla principal del Dashboard.
 * @description Muestra la lista de KPIs y permite refrescarla.
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router'; // Para recargar al enfocar la pestaña
import KpiList from '../../components/KPI/KpiList'; // Ajusta la ruta
import IndicadorCarga from '../../components/Common/LoadingIndicator'; // Ajusta la ruta
import MensajeError from '../../components/Common/ErrorMessage'; // Ajusta la ruta
import { obtenerKpis } from '../../services/kpiService'; // Ajusta la ruta
import { KpiListResponse, KPI } from '../../types'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta
import Color from '../../constants/Colors'; // Ajusta la ruta

type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

export default function PantallaDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  // Podrías añadir estado para paginación si tu API lo soporta
  // const [paginaActual, setPaginaActual] = useState<number>(1);
  // const [tieneMasPaginas, setTieneMasPaginas] = useState<boolean>(true);

  // Función para cargar los KPIs desde la API
  const cargarKpis = useCallback(async (esRefresco = false) => {
    console.log(`[Dashboard] Cargando KPIs... ${esRefresco ? '(Refresco)' : ''}`);
    // Si no es refresco, muestra el indicador de carga principal
    if (!esRefresco) {
      setEstadoCarga('cargando');
    }
    setError(null); // Limpia errores previos

    try {
      const respuesta: KpiListResponse = await obtenerKpis(/* Aquí podrías pasar filtros */);
      setKpis(respuesta.results); // Actualiza la lista de KPIs
      setEstadoCarga('exito');
      console.log('[Dashboard] KPIs cargados exitosamente.');
      // Actualiza estado de paginación si es necesario
      // setTieneMasPaginas(!!respuesta.next);
    } catch (err: any) {
      console.error('[Dashboard] Error al cargar KPIs:', err);
      setError(err.message || 'No se pudieron cargar los indicadores.');
      setEstadoCarga('error');
      setKpis([]); // Limpia KPIs en caso de error
    } finally {
      // Si era un refresco, indica que terminó
      if (esRefresco) {
        setRefrescando(false);
      }
      // Si no era refresco y no hubo éxito, podría quedarse en 'cargando' o ir a 'error'
      if (!esRefresco && estadoCarga !== 'exito') {
         // El estado ya se actualizó a 'error' en el catch
      } else if (!esRefresco) {
         // Si fue exitoso, ya está en 'exito'
      }

    }
  }, [estadoCarga]); // Dependencia para evitar re-creación innecesaria si no cambia estadoCarga

  // Carga los datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      // Carga inicial solo si no se ha cargado antes o si hubo error
      if (estadoCarga === 'idle' || estadoCarga === 'error') {
        cargarKpis();
      }
      // Podrías añadir lógica para recargar siempre si lo necesitas:
      // cargarKpis();

      // Función de limpieza opcional (no necesaria aquí generalmente)
      return () => {
        console.log('[Dashboard] Pantalla perdió el foco.');
      };
    }, [cargarKpis, estadoCarga]) // Depende de cargarKpis y estadoCarga
  );

  // Manejador para el "pull-to-refresh"
  const handleRefrescar = useCallback(() => {
    setRefrescando(true); // Activa el indicador de refresco
    // setPaginaActual(1); // Reinicia paginación si aplica
    cargarKpis(true); // Llama a cargarKpis indicando que es un refresco
  }, [cargarKpis]); // Depende de cargarKpis

  // Manejador para cargar más al llegar al final (paginación)
  const handleEndReached = () => {
    console.log('[Dashboard] Fin de lista alcanzado.');
    // Lógica de paginación (si aplica y hay más páginas)
    // if (!cargando && tieneMasPaginas) {
    //   console.log('[Dashboard] Cargando siguiente página...');
    //   setPaginaActual(prev => prev + 1);
    //   cargarKpis(false, paginaActual + 1); // Necesitarías modificar cargarKpis para aceptar página
    // }
  };

  // Renderizado condicional basado en el estado de carga
  const renderizarContenido = () => {
    if (estadoCarga === 'cargando' && kpis.length === 0 && !refrescando) {
      // Muestra indicador grande solo en la carga inicial
      return <IndicadorCarga tamaño="large" />;
    }
    if (estadoCarga === 'error' && kpis.length === 0) {
      // Muestra error solo si no hay datos previos
      return <MensajeError mensaje={error || 'Error desconocido'} />;
    }
    // Si carga, hay error pero hay datos, o fue exitoso, muestra la lista
    return (
      <KpiList
        kpis={kpis}
        cargando={estadoCarga === 'cargando'} // Para el footer loader de paginación
        error={error} // Pasa el error (KpiList lo mostrará si está vacío)
        onRefrescar={handleRefrescar}
        refrescando={refrescando}
        onEndReached={handleEndReached}
      />
    );
  };

  return (
    <View style={estilos.contenedor}>
      {renderizarContenido()}
      {/* Podrías añadir aquí botones para filtros, etc. */}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Color.background, // Fondo general
  },
  // Otros estilos si son necesarios
});