/**
 * @file Pantalla principal del Dashboard.
 * @description Muestra la lista de KPIs y permite refrescarla.
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router'; // Para recargar al enfocar la pestaña
import KpiList from '../../components/KPI/KpiList';
import IndicadorCarga from '../../components/Common/LoadingIndicator';
import MensajeError from '../../components/Common/ErrorMessage';
import { obtenerKpis } from '../../services/kpiService';
import { KpiListResponse, KPI, KpiTrend } from '../../types';
import { KpiCategory } from '../../types/kpi'; // Usa la importación nombrada para KpiCategory
import Color from '../../constants/Colors';
import { Button, Modal, TextInput, TouchableOpacity } from 'react-native';

type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

export default function PantallaDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  // Estado para el modal de creación de KPI
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoValor, setNuevoValor] = useState('');
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);

  // Función para cargar los KPIs desde la API
  const cargarKpis = useCallback(async (esRefresco = false) => {
    // ...igual que antes...
    console.log(`[Dashboard] Cargando KPIs... ${esRefresco ? '(Refresco)' : ''}`);
    if (!esRefresco) {
      setEstadoCarga('cargando');
    }
    setError(null);
    try {
      const respuesta: KpiListResponse = await obtenerKpis();
      setKpis(respuesta.results);
      setEstadoCarga('exito');
      console.log('[Dashboard] KPIs cargados exitosamente.');
      // setTieneMasPaginas(!!respuesta.next);
    } catch (err: any) {
      console.error('[Dashboard] Error al cargar KPIs:', err);
      setError(err.message || 'No se pudieron cargar los indicadores.');
      setEstadoCarga('error');
      setKpis([]);
    } finally {
      if (esRefresco) setRefrescando(false);
    }
  }, [estadoCarga]);

  useFocusEffect(
    useCallback(() => {
      if (estadoCarga === 'idle' || estadoCarga === 'error') {
        cargarKpis();
      }
      return () => {
        console.log('[Dashboard] Pantalla perdió el foco.');
      };
    }, [cargarKpis, estadoCarga])
  );

  // Manejador para el "pull-to-refresh"
  const handleRefrescar = useCallback(() => {
    setRefrescando(true);
    cargarKpis(true);
  }, [cargarKpis]);

  const handleEndReached = () => {
    // Paginación futura
  };

  // Crear KPI
  const handleCrearKpi = async () => {
    setCreando(true);
    setErrorCrear(null);
    try {
      // Importa la función aquí para evitar problemas de importación circular
      const { crearKpi } = await import('../../services/kpiService');
      await crearKpi({
        name: nuevoNombre,
        value: Number(nuevoValor),
        unit: '', // Ajusta según tu lógica de negocio
        trend: 'stable', // Usa el valor del enum KpiTrend
        category: 'seguridad', // Usa el valor del enum KpiCategory o el que corresponda
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        description: '', // Opcional, puedes permitir editarlo en el modal si lo deseas
        target: undefined, // Opcional, puedes permitir editarlo en el modal si lo deseas
        progreso: undefined, // Opcional, puedes permitir editarlo en el modal si lo deseas
      });
      setModalVisible(false);
      setNuevoNombre('');
      setNuevoValor('');
      cargarKpis();
    } catch (err: any) {
      setErrorCrear(err.message || 'Error al crear KPI');
    } finally {
      setCreando(false);
    }
  };

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
      {/* Botón para abrir el modal */}
      <TouchableOpacity
        style={{
          backgroundColor: Color.primary,
          padding: 12,
          borderRadius: 8,
          margin: 16,
          alignItems: 'center',
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Crear KPI</Text>
      </TouchableOpacity>

      {renderizarContenido()}

      {/* Modal de creación de KPI */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 24,
            borderRadius: 12,
            width: '85%',
            elevation: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Nuevo KPI</Text>
            <TextInput
              placeholder="Nombre"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                padding: 8,
                marginBottom: 12,
              }}
              editable={!creando}
            />
            <TextInput
              placeholder="Valor"
              value={nuevoValor}
              onChangeText={setNuevoValor}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                padding: 8,
                marginBottom: 12,
              }}
              editable={!creando}
            />
            {errorCrear ? (
              <Text style={{ color: 'red', marginBottom: 8 }}>{errorCrear}</Text>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={creando}
                style={{ marginRight: 16 }}
              >
                <Text style={{ color: Color.primary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCrearKpi}
                disabled={creando || !nuevoNombre || !nuevoValor}
                style={{
                  backgroundColor: Color.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                  opacity: creando || !nuevoNombre || !nuevoValor ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {creando ? 'Creando...' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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