//Pantalla para mostrar los detalles de un Producto específico. hay que corregir
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { obtenerDetalleProducto } from '../../services/inventoryService'; // Ajusta la ruta
import { Producto } from '../../types'; // Ajusta la ruta
import IndicadorCarga from '../../components/Common/LoadingIndicator'; // Ajusta la ruta
import MensajeError from '../../components/Common/ErrorMessage'; // Ajusta la ruta
import Colors from '../../constants/Colors'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta
import Boton from '../../components/Common/Button'; // Ajusta la ruta

type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

export default function PantallaDetalleProducto() {
  const { id } = useLocalSearchParams<{ id?: string }>(); // Obtiene el ID numérico
  const [producto, setProducto] = useState<Producto | null>(null);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los detalles
  const cargarDetalle = useCallback(async () => {
    const productoId = Number(id); // Convierte el ID a número
    if (!id || isNaN(productoId)) {
      setError('ID de producto inválido.');
      setEstadoCarga('error');
      return;
    }
    console.log(`[ProductDetail] Cargando detalle para Producto ID: ${productoId}`);
    setEstadoCarga('cargando');
    setError(null);

    try {
      const detalle = await obtenerDetalleProducto(productoId);
      setProducto(detalle);
      setEstadoCarga('exito');
      console.log(`[ProductDetail] Detalle cargado para: ${detalle.name || 'Producto sin nombre'}`);
    } catch (err: any) {
      console.error(`[ProductDetail] Error al cargar detalle del producto ${id}:`, err);
      setError(err.message || 'No se pudo cargar el detalle del producto.');
      setEstadoCarga('error');
      setProducto(null);
    }
  }, [id]);

  // Carga los datos cuando el ID cambia o el componente se monta
  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  // Renderizado condicional
  if (estadoCarga === 'cargando' || estadoCarga === 'idle') {
    return <IndicadorCarga tamaño="large" />;
  }

  if (error || !producto) {
    return <MensajeError mensaje={error || 'No se pudo cargar el producto.'} />;
  }

  return (
    <ScrollView style={estilos.contenedorScroll} contentContainerStyle={estilos.contenidoScroll}>
      {/* Configura el título de la cabecera dinámicamente */}
      <Stack.Screen options={{ title: producto.name || 'Detalle Producto' }} />

      <View style={estilos.contenedorInfo}>
        <Text style={estilos.nombre}>{producto.name}</Text>
        {producto.description && <Text style={estilos.descripcion}>{producto.description}</Text>}
        <Text style={estilos.infoAdicional}>SKU: {producto.sku || 'N/A'}</Text>
        <Text style={estilos.infoAdicional}>Stock Actual: {producto.stock}</Text>
        <Text style={estilos.infoAdicional}>Precio: {producto.price ? `$${producto.price}` : 'No disponible'}</Text>
        <Text style={estilos.infoAdicional}>Categoría: {producto.category?.name || (producto.category_id ? `ID ${producto.category_id}` : 'Sin categoría')}</Text>
        <Text style={estilos.infoAdicional}>Creado: {new Date(producto.created_at).toLocaleString()}</Text>
        {producto.updated_at && <Text style={estilos.infoAdicional}>Actualizado: {new Date(producto.updated_at).toLocaleString()}</Text>}
      </View>

      {/* Aquí podrías añadir una sección para ver las transacciones de este producto */}
      <View style={estilos.seccionTransacciones}>
          <Text style={estilos.tituloSeccion}>Historial de Transacciones (Placeholder)</Text>
          {/* FlatList o mapeo de transacciones iría aquí */}
      </View>

       {/* Botones para editar/eliminar (Placeholder) */}
       <View style={estilos.contenedorBotones}>
            <Boton titulo="Editar Producto" onPress={() => alert('Funcionalidad Editar no implementada')} variante="secundario" />
            <Boton titulo="Eliminar Producto" onPress={() => alert('Funcionalidad Eliminar no implementada')} variante="peligro" estiloContenedor={{ marginTop: Layout.spacing.small }}/>
       </View>

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
    marginBottom: Layout.spacing.large, // Más espacio antes de la siguiente sección
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
  infoAdicional: {
    fontSize: Layout.fontSize.body,
    color: Colors.text,
    marginBottom: Layout.spacing.small,
    paddingVertical: Layout.spacing.tiny,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50', // Borde más sutil
  },
  seccionTransacciones: {
      marginTop: Layout.spacing.medium,
      backgroundColor: Colors.cardBackground,
      borderRadius: Layout.borderRadius.medium,
      padding: Layout.spacing.medium,
      marginBottom: Layout.spacing.large,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
  },
  tituloSeccion: {
      fontSize: Layout.fontSize.heading,
      fontWeight: '600',
      color: Colors.text,
      marginBottom: Layout.spacing.medium,
  },
  contenedorBotones: {
      marginTop: Layout.spacing.medium,
  }
});
