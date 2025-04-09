/**
 * @file Componente para mostrar una lista de KPIs.
 * @description Utiliza FlatList para renderizar eficientemente y maneja estados de carga/error.
 */
import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import KpiCard from './KpiCard'; // Ajusta la ruta
import IndicadorCarga from '../Common/LoadingIndicator'; // Ajusta la ruta
import MensajeError from '../Common/ErrorMessage'; // Ajusta la ruta
import { KPI } from '../../types'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta
import Colors from '../../constants/Colors'; // Ajusta la ruta

// Propiedades que recibe el componente
interface KpiListProps {
  kpis: KPI[]; // Array de datos de KPIs
  cargando: boolean; // Indicador de si se están cargando datos
  error: string | null; // Mensaje de error, si existe
  onRefrescar?: () => void; // Función para ejecutar al hacer "pull-to-refresh"
  refrescando?: boolean; // Estado para el control de refresco
  onEndReached?: () => void; // Función para cargar más datos al llegar al final (paginación)
}

const KpiList: React.FC<KpiListProps> = ({
  kpis,
  cargando,
  error,
  onRefrescar,
  refrescando = false, // Valor por defecto para refrescando
  onEndReached,
}) => {

  // Renderiza el componente KpiCard para cada item
  const renderizarItem = ({ item }: { item: KPI }) => (
    <KpiCard kpi={item} />
  );

  // Componente a mostrar si la lista está vacía
  const renderizarListaVacia = () => {
    // No mostrar nada si está cargando inicialmente o si hubo un error
    if (cargando || error) return null;
    return (
      <View style={estilos.contenedorVacio}>
        <Text style={estilos.textoVacio}>No se encontraron KPIs.</Text>
        {/* Podrías añadir un botón para reintentar o cambiar filtros */}
      </View>
    );
  };

  // Componente a mostrar mientras carga (podría ser el indicador global o uno aquí)
  const renderizarFooter = () => {
    // Muestra indicador de carga al final si está cargando más páginas (y no es el refresco inicial)
    if (cargando && !refrescando && kpis.length > 0) {
      return <IndicadorCarga tamaño="small" estiloContenedor={{ paddingVertical: Layout.spacing.large }} />;
    }
    return null;
  };

  // Si hay un error principal, mostrarlo en lugar de la lista
  if (error && kpis.length === 0) {
    return <MensajeError mensaje={error} />;
  }

  // Si está cargando por primera vez (sin datos aún), muestra un indicador grande
  if (cargando && kpis.length === 0 && !refrescando) {
      return <IndicadorCarga tamaño="large" />;
  }


  return (
    <FlatList
      data={kpis}
      renderItem={renderizarItem}
      keyExtractor={(item) => item.id.toString()} // Usa el ID del KPI como clave única
      contentContainerStyle={estilos.listaContenedor}
      ListEmptyComponent={renderizarListaVacia} // Componente para lista vacía
      ListFooterComponent={renderizarFooter} // Componente al final (para carga de paginación)
      onEndReached={onEndReached} // Llama a esta función al acercarse al final
      onEndReachedThreshold={0.5} // Qué tan cerca del final (0.5 = a mitad del último item visible)
      refreshControl={ // Añade la funcionalidad de "pull-to-refresh"
        onRefrescar ? ( // Solo si se proporciona la función onRefrescar
          <RefreshControl
            refreshing={refrescando} // Estado de refresco
            onRefresh={onRefrescar} // Función a llamar
            tintColor={Colors.primary} // Color del spinner (iOS)
            colors={[Colors.primary]} // Color del spinner (Android)
          />
        ) : undefined
      }
    />
  );
};

const estilos = StyleSheet.create({
  listaContenedor: {
    paddingHorizontal: Layout.spacing.medium, // Padding horizontal para la lista
    paddingVertical: Layout.spacing.medium, // Padding vertical
    flexGrow: 1, // Asegura que el contenedor vacío ocupe espacio
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.xlarge * 2, // Más margen superior
  },
  textoVacio: {
    fontSize: Layout.fontSize.subheading,
    color: Colors.textSecondary,
  },
});

export default KpiList;
