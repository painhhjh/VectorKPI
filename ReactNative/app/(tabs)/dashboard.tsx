/**
 * @file Pantalla principal del Dashboard.
 * @description Muestra la lista de KPIs y permite refrescarla.
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router'; // Para recargar al enfocar la pestaña
import KpiList from '../../components/KPI/KpiList';
import IndicadorCarga from '../../components/Common/LoadingIndicator';
import MensajeError from '../../components/Common/ErrorMessage';
import { eliminarKpi, obtenerKpis, obtenerKpisDebug } from '../../services/kpiService';
import { KpiListResponse, KPI, KpiTrend } from '../../types';
import { KpiCategory } from '../../types/kpi'; // Usa la importación nombrada para KpiCategory
import Color from '../../constants/Colors';
import { Button, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Boton from '@/components/Common/Button';
import Layout from '@/constants/Layout';
import { useAuth } from '@/contexts/useAuth';


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

  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState<KpiCategory>('seguridad');
  const [trend, setTrend] = useState<KpiTrend>('stable');
  const [selectedCategory, setSelectedCategory] = useState<KpiCategory>('seguridad');
  
  const { usuario } = useAuth();
  const userId = Number(usuario?.id);

const filtrarKpisRecientes = (kpis: KPI[]) => {
  const kpisUnicos = new Map<string, KPI>();
  
  // Sort by last_updated descending first to ensure newest come first
  const sortedKpis = [...kpis].sort((a, b) => 
    new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
  );

  sortedKpis.forEach(kpi => {
    if (!kpisUnicos.has(kpi.name)) {
      kpisUnicos.set(kpi.name, kpi);
    }
  });
  
  return Array.from(kpisUnicos.values());
};


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

      console.log(respuesta)
      const kpisRecientes = filtrarKpisRecientes(respuesta.results);
      // console.log('KPIs filtrados:', respuesta.results.map(k => ({
      //   name: k.name,
      //   last_updated: k.last_updated,
      //   value: k.value
      // })));
      const userKpis = kpisRecientes.filter(kpi => kpi.owner_id === userId);
      setKpis(userKpis);
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

const handleCrearKpi = async () => {
  setCreando(true);
  setErrorCrear(null);
  try {
    const { crearKpi } = await import('../../services/kpiService');
    await crearKpi({
      name: nuevoNombre,
      value: Number(nuevoValor),
      unit: unit,
      trend: trend,
      category: category,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      description: description,
      target: target ? Number(target) : undefined,
      progreso: undefined, // Calculated automatically
      owner_id:userId
    });
    setModalVisible(false);
    // Reset all fields
    setNuevoNombre('');
    setNuevoValor('');
    setUnit('');
    setDescription('');
    setTarget('');
    setCategory('seguridad');
    setTrend('stable');
    cargarKpis();
  } catch (err: any) {
    setErrorCrear(err.message || 'Error al crear KPI');
  } finally {
    setCreando(false);
  }
};

 const handleDeleteKpi = async (kpiName: string) => {
  console.log("a")
    try {
      setEstadoCarga('cargando');
      
      // Filter all KPIs with this name from our existing data
      const allVersions = kpis.filter(k => k.name === kpiName);
      
      // Also include any other KPIs with the same name that might not be in the current filtered view
      // This ensures we get all versions, not just the most recent ones shown on dashboard
      const allKpisResponse = await obtenerKpis();
      const additionalVersions = allKpisResponse.results.filter(k => 
        k.name === kpiName && !allVersions.some(v => v.id === k.id)
      );
      
      const allVersionsToDelete = [...allVersions, ...additionalVersions];
      
      // Delete them one by one
      for (const kpi of allVersionsToDelete) {
        await eliminarKpi(Number(kpi.id));
      }
      
      // Refresh the list
      await cargarKpis();
      Alert.alert("Success", `All versions of "${kpiName}" have been deleted`);
    } catch (error: any) {
      setError(error.message || 'Error deleting KPIs');
    } finally {
      setEstadoCarga('exito');
    }
  };

const categoryFilterSection = (
 <View style={estilos.filterContainer}>
  {/* Category Dropdown */}
  <View style={estilos.pickerWrapper}>
    <Picker
      selectedValue={selectedCategory}
      onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      style={estilos.picker}
      dropdownIconColor={Color.primary}
      mode="dropdown"
    >
      {Object.entries({
        'perforación': 'Perforación',
        'producción': 'Producción',
        'logística': 'Logística',
        'seguridad': 'Seguridad',
        'financiero': 'Financiero'
      }).map(([value, label]) => (
        <Picker.Item 
          key={value} 
          label={label} 
          value={value} 
          style={estilos.pickerItem}
        />
      ))}
    </Picker>
  </View>

  {/* Filter Button */}
  <Boton 
    titulo="Ver Categoría"
    onPress={() => router.push({
      pathname: '/(tabs)/category-detail',
      params: { category: selectedCategory }
    })}
    estiloContenedor={estilos.filterButton}
  />
</View>
);


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
        onUpdate={cargarKpis}
        onDelete={handleDeleteKpi}
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


        
      {categoryFilterSection}

      {renderizarContenido()}

      {/* Modal de creación de KPI */}

<Modal
  visible={modalVisible}
  animationType='slide'
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
      
      {/* Name Field */}
      <TextInput
        placeholder='Nombre del KPI'
        value={nuevoNombre}
        onChangeText={setNuevoNombre}
        style={estilos.modalInput}
      />
      
      {/* Value Field */}
      <TextInput
        placeholder="Valor"
        value={nuevoValor}
        onChangeText={setNuevoValor}
        keyboardType="numeric"
        style={estilos.modalInput}
      />
      
      {/* Unit Field */}
      <TextInput
        placeholder="Unidad (ej. %, bbl/día)"
        value={unit}
        onChangeText={setUnit}
        style={estilos.modalInput}
      />
      
      {/* Description Field */}
      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={[estilos.modalInput, { height: 80 }]}
      />
      
      {/* Target Field */}
      <TextInput
        placeholder="Objetivo (opcional)"
        value={target}
        onChangeText={setTarget}
        keyboardType="numeric"
        style={estilos.modalInput}
      />
      
      {/* Category Picker */}
      <Text style={estilos.modalLabel}>Categoría</Text>
      <Picker
        selectedValue={category}
        onValueChange={setCategory}
        style={estilos.modalInput}
      >
        <Picker.Item label="Perforación" value="perforación" />
        <Picker.Item label="Producción" value="producción" />
        <Picker.Item label="Logística" value="logística" />
        <Picker.Item label="Seguridad" value="seguridad" />
        <Picker.Item label="Financiero" value="financiero" />
      </Picker>
      
      {/* Trend Picker */}
      <Text style={estilos.modalLabel}>Tendencia</Text>
      <Picker
        selectedValue={trend}
        onValueChange={setTrend}
        style={estilos.modalInput}
      >
        <Picker.Item label="↑ Ascendente" value="up" />
        <Picker.Item label="↓ Descendente" value="down" />
        <Picker.Item label="→ Estable" value="stable" />
      </Picker>
      
      {errorCrear && (
        <Text style={{color: 'red', marginBottom: 8}}>{errorCrear}</Text>
      )}
      
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          disabled={creando}
          style={{ marginRight: 16 }}
        >
          <Text style={{ color: Color.primary }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCrearKpi}
          disabled={creando || !nuevoNombre || !nuevoValor || !unit}
          style={{
            backgroundColor: Color.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            opacity: (creando || !nuevoNombre || !nuevoValor || !unit) ? 0.6 : 1,
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

    modalInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      padding: 8,
      marginBottom: 12,
      backgroundColor: '#fff',
    },
    modalLabel: {
      fontSize: 14,
      color: Color.textSecondary,
      marginBottom: 4,
    },

  //   filterContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: Layout.spacing.medium,
  //   paddingHorizontal: Layout.spacing.small,
  // },
  // picker: {
  //   flex: 1,
  //   backgroundColor: Color.white,
  //   marginRight: Layout.spacing.small,
  // },
  // filterButton: {
  //   width: 120,
  // },

  filterContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: Layout.spacing.medium,
  paddingHorizontal: Layout.spacing.small,
},
pickerWrapper: {
  flex: 1,
  borderWidth: 1,
  borderColor: Color.border,
  borderRadius: Layout.borderRadius.medium,
  backgroundColor: Color.white,
  marginRight: Layout.spacing.small,
  height: 48, // Match button height
  justifyContent: 'center',
  overflow: 'hidden', // Keeps border radius on Android
},
picker: {
  width: '100%',
  height: '100%',
  color: Color.text,
  // Android padding fixes

},
pickerItem: {
  fontSize: Layout.fontSize.body,
  color: Color.text,
},
filterButton: {
  width: 120,
},

});