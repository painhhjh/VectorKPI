/**
 * @file Pantalla principal del módulo de Inventario.
 * @description (Placeholder) Mostrará la lista de productos/categorías.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { obtenerProductos, obtenerCategorias } from '../../services/inventoryService'; // Ajusta la ruta
import { Producto, Categoria } from '../../types'; // Ajusta la ruta
import IndicadorCarga from '../../components/Common/LoadingIndicator'; // Ajusta la ruta
import MensajeError from '../../components/Common/ErrorMessage'; // Ajusta la ruta
import Boton from '../../components/Common/Button'; // Ajusta la ruta
import Colors from '../../constants/Colors'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta

type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

export default function PantallaInventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estadoCargaProd, setEstadoCargaProd] = useState<EstadoCarga>('idle');
  const [estadoCargaCat, setEstadoCargaCat] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Función para cargar datos
  const cargarDatos = useCallback(async () => {
    console.log('[InventoryScreen] Cargando datos de inventario...');
    setEstadoCargaProd('cargando');
    setEstadoCargaCat('cargando');
    setError(null);

    try {
      // Carga categorías y productos en paralelo
      const [categoriasRes, productosRes] = await Promise.all([
        obtenerCategorias(),
        obtenerProductos() // Podrías añadir filtros aquí si es necesario
      ]);
      setCategorias(categoriasRes);
      setProductos(productosRes.results); // Asumiendo que la respuesta tiene 'results'
      setEstadoCargaCat('exito');
      setEstadoCargaProd('exito');
      console.log('[InventoryScreen] Datos de inventario cargados.');
    } catch (err: any) {
      console.error('[InventoryScreen] Error cargando datos:', err);
      setError(err.message || 'No se pudieron cargar los datos del inventario.');
      setEstadoCargaProd('error');
      setEstadoCargaCat('error');
      setProductos([]);
      setCategorias([]);
    }
  }, []);

  // Carga los datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      if (estadoCargaProd === 'idle' || estadoCargaProd === 'error') {
        cargarDatos();
      }
      return () => {};
    }, [cargarDatos, estadoCargaProd])
  );

  // Navega al detalle del producto
  const verDetalleProducto = (id: number) => {
      router.push({
          pathname: '/(tabs)/kpi-detail',
          params: { id: id.toString() }
      });
  };

  // Renderiza un item de la lista de productos
  const renderizarProducto = ({ item }: { item: Producto }) => (
    <TouchableOpacity onPress={() => verDetalleProducto(item.id)} style={estilos.itemProducto}>
      <View style={estilos.infoProducto}>
          <Text style={estilos.nombreProducto}>{item.name}</Text>
          <Text style={estilos.skuProducto}>SKU: {item.sku || 'N/A'}</Text>
      </View>
      <Text style={estilos.stockProducto}>Stock: {item.stock}</Text>
    </TouchableOpacity>
  );

  // Renderizado condicional
  if (estadoCargaProd === 'cargando' || estadoCargaCat === 'cargando') {
    return <IndicadorCarga tamaño="large" />;
  }

  if (error) {
    return <MensajeError mensaje={error} />;
  }

  return (
    <View style={estilos.contenedor}>
       <Text style={estilos.tituloPlaceholder}>Módulo de Inventario (Placeholder)</Text>
       <Text style={estilos.subtituloPlaceholder}>Aquí se mostrará la lista de productos.</Text>

        {/* Botón para añadir producto (Placeholder) */}
        <Boton
            titulo="Añadir Producto"
            onPress={() => alert('Funcionalidad Añadir Producto no implementada')}
            variante="primario"
            estiloContenedor={{ marginBottom: Layout.spacing.medium }}
        />

       {/* Lista de Productos */}
       <FlatList
            data={productos}
            renderItem={renderizarProducto}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={estilos.textoVacio}>No hay productos en el inventario.</Text>}
            contentContainerStyle={{ paddingBottom: Layout.spacing.large }} // Espacio al final
       />

    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.medium,
  },
  tituloPlaceholder: {
    fontSize: Layout.fontSize.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.spacing.small,
    color: Colors.primary,
  },
  subtituloPlaceholder: {
      fontSize: Layout.fontSize.body,
      textAlign: 'center',
      marginBottom: Layout.spacing.large,
      color: Colors.textSecondary,
  },
  itemProducto: {
    backgroundColor: Colors.cardBackground,
    padding: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoProducto: {
      flex: 1, // Ocupa el espacio disponible
      marginRight: Layout.spacing.small,
  },
  nombreProducto: {
    fontSize: Layout.fontSize.subheading,
    fontWeight: '500',
    color: Colors.text,
  },
  skuProducto: {
      fontSize: Layout.fontSize.caption,
      color: Colors.textSecondary,
      marginTop: Layout.spacing.tiny,
  },
  stockProducto: {
      fontSize: Layout.fontSize.body,
      fontWeight: '600',
      color: Colors.primary,
  },
  textoVacio: {
    textAlign: 'center',
    marginTop: Layout.spacing.large,
    color: Colors.textSecondary,
  },
});