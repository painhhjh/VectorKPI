// Pantalla principal del módulo de Inventario. Muestra lista de productos/categorías.
// hay que agregar que la lista de categorías se renderiza detrás del modal de crear producto

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
// Importaciones de Expo Router, servicios, tipos y componentes UI.
import { useFocusEffect, useRouter } from 'expo-router';
import { obtenerProductos, obtenerCategorias, crearProducto } from '../../services/inventoryService';
import { Producto, Categoria } from '../../types';
import IndicadorCarga from '../../components/Common/LoadingIndicator';
import MensajeError from '../../components/Common/ErrorMessage';
import Boton from '../../components/Common/Button';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Define los posibles estados de carga de datos.
type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

// Componente principal de la pantalla de inventario.
export default function PantallaInventario() {
  // --- HOOKS ---

  // Estados para datos (productos, categorías), carga y errores.
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estadoCargaProd, setEstadoCargaProd] = useState<EstadoCarga>('idle');
  const [estadoCargaCat, setEstadoCargaCat] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);

  // Hook para navegación.
  const router = useRouter();

  // Estados para el modal de creación de producto.
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState<Omit<Producto, 'id' | 'created_at' | 'updated_at' | 'category'>>({
    name: '',
    description: '',
    price: '',
    stock: 0,
    sku: '',
    category_id: undefined, // ID de categoría se inicializa vacío.
  });
  const [creando, setCreando] = useState(false); // Estado de carga para la creación.
  const [errorCrear, setErrorCrear] = useState<string | null>(null); // Error específico de creación.

  // Estado para el modal de selección de categoría.
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // --- FUNCIONES ---

  // Carga productos y categorías desde el servicio.
  const cargarDatos = useCallback(async () => {
    console.log('[InventoryScreen] Cargando datos de inventario...');
    setEstadoCargaProd('cargando');
    setEstadoCargaCat('cargando');
    setError(null);

    try {
      // Carga en paralelo.
      const [categoriasRes, productosRes] = await Promise.all([
        obtenerCategorias(),
        obtenerProductos()
      ]);
      setCategorias(categoriasRes);
      setProductos(productosRes);
      setEstadoCargaCat('exito');
      setEstadoCargaProd('exito');
      console.log('[InventoryScreen] Datos de inventario cargados.');

      // Establece categoría por defecto si no hay una seleccionada y hay categorías disponibles.
      setNuevoProducto(prev => ({
        ...prev,
        category_id: prev.category_id === undefined && categoriasRes.length > 0
          ? categoriasRes[0].id
          : prev.category_id
      }));

    } catch (err: any) {
      console.error('[InventoryScreen] Error cargando datos:', err);
      setError(err.message || 'No se pudieron cargar los datos del inventario.');
      setEstadoCargaProd('error');
      setEstadoCargaCat('error');
      setProductos([]); // Limpia en caso de error.
      setCategorias([]);
    }
  }, []); // Sin dependencias, se crea una vez.

  // Ejecuta `cargarDatos` cuando la pantalla obtiene foco.
  useFocusEffect(
    useCallback(() => {
      // Carga solo si no está cargando o si hubo error previo.
      if (estadoCargaProd === 'idle' || estadoCargaProd === 'error' || estadoCargaCat === 'idle' || estadoCargaCat === 'error') {
        cargarDatos();
      }
      return () => {}; // Sin limpieza necesaria aquí.
    }, [cargarDatos, estadoCargaProd, estadoCargaCat]) // Depende de la función y estados de carga.
  );

  // Navega a la pantalla de detalle del producto.
  const verDetalleProducto = (id: number) => {
      router.push({
          pathname: '/(tabs)/product-detail', // Ruta de la pantalla de detalle.
          params: { id: id.toString() } // Pasa el ID como parámetro.
      });
  };

  // Renderiza cada elemento de la lista de productos.
  const renderizarProducto = ({ item }: { item: Producto }) => (
    <TouchableOpacity onPress={() => verDetalleProducto(item.id)} style={estilos.itemProducto}>
      <View style={estilos.infoProducto}>
          <Text style={estilos.nombreProducto}>{item.name}</Text>
          <Text style={estilos.skuProducto}>SKU: {item.sku || 'N/A'}</Text>
      </View>
      <Text style={estilos.stockProducto}>Stock: {item.stock}</Text>
    </TouchableOpacity>
  );

  // Abre el modal de creación, reseteando el formulario.
  const abrirModal = () => {
    setNuevoProducto({ // Resetea los campos del nuevo producto.
      name: '',
      description: '',
      price: '',
      stock: 0,
      sku: '',
      category_id: categorias.length > 0 ? categorias[0].id : undefined, // Preselecciona la primera categoría si existe.
    });
    setErrorCrear(null); // Limpia errores previos.
    setModalVisible(true); // Muestra el modal.
  };

  // Maneja el envío del formulario de creación de producto.
  const handleCrearProducto = async () => {
    setErrorCrear(null);
    setCreando(true);
    try {
      // Validación básica.
      if (!nuevoProducto.name || nuevoProducto.stock === undefined || nuevoProducto.category_id === undefined) {
        throw new Error('El nombre, stock y categoría son obligatorios.');
      }
      // Prepara los datos para enviar.
      const datos = {
        ...nuevoProducto,
        stock: Number(nuevoProducto.stock), // Asegura que stock sea número.
        price: nuevoProducto.price !== '' ? Number(nuevoProducto.price) : undefined, // Convierte precio si existe.
        category_id: nuevoProducto.category_id,
      };
      // Llama al servicio para crear.
      await crearProducto({
        ...datos,
        created_at: new Date().toISOString(), // Añade timestamp (idealmente manejado por backend).
      });
      setModalVisible(false); // Cierra el modal.
      cargarDatos(); // Recarga la lista de productos.
    } catch (err: any) {
      setErrorCrear(err.message || 'Error al crear el producto.');
    } finally {
      setCreando(false); // Finaliza el estado de carga.
    }
  };


  // --- RENDERIZADO CONDICIONAL ---

  // Muestra indicador de carga mientras se obtienen datos.
  if (estadoCargaProd === 'cargando' || estadoCargaCat === 'cargando') {
    return <IndicadorCarga tamaño="large" />;
  }

  // Muestra mensaje de error si la carga falló y no hay productos.
  if (error && productos.length === 0) {
    return <MensajeError mensaje={error} />;
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.tituloPlaceholder}>Módulo de Inventario</Text>
      <Text style={estilos.subtituloPlaceholder}>Lista de Productos</Text>

      {/* Botón para abrir el modal de añadir producto */}
      <Boton
        titulo="Añadir Producto"
        onPress={abrirModal}
        variante="primario"
        estiloContenedor={{ marginBottom: Layout.spacing.medium }}
      />
      {/* Modal para crear un nuevo producto */}
      {modalVisible && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)} // Permite cerrar con botón atrás (Android).
        >
          {/* Contenedor del modal con fondo semitransparente */}
          <View style={estilos.modalOverlay}>


   {/* Modal para seleccionar la categoría */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={estilos.categoryModalOverlay}>
          <View style={estilos.modalContenidoCategoria}>
            <Text style={estilos.modalTitulo}>Seleccionar Categoría</Text>

            {/* MODIFICADO: Contenido mejorado para el modal de categorías */}
            {estadoCargaCat === 'error' ? (
              <Text style={estilos.textoModalInformativo}>Error al cargar categorías.</Text>
            ) : categorias.length === 0 ? (
              <Text style={estilos.textoModalInformativo}>No hay categorías disponibles.</Text> // Adjusted message
            ) : (
              <FlatList
                data={categorias}
                keyExtractor={(item: Categoria) => item.id.toString()}
                renderItem={({ item }: { item: Categoria }) => (
                  <TouchableOpacity
                    style={[
                        estilos.itemCategoriaModal,
                        nuevoProducto.category_id === item.id && estilos.itemCategoriaSeleccionada
                    ]}
                    onPress={() => {
                      setNuevoProducto({ ...nuevoProducto, category_id: item.id });
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={{ color: nuevoProducto.category_id === item.id ? Colors.primary : Colors.text }}>
                       {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            

            {/* Botón para cerrar el modal de categorías */}
            <TouchableOpacity
              style={estilos.botonCerrarModalCategoria}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={{ color: Colors.textSecondary, fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>


            {/* Contenido del modal */}
            <View style={estilos.modalContenido}>
              <Text style={estilos.modalTitulo}>Crear Producto</Text>
              {/* Campos del formulario */}
              <TextInput
                placeholder="Nombre"
                value={nuevoProducto.name}
                onChangeText={text => setNuevoProducto({ ...nuevoProducto, name: text })}
                style={estilos.input}
              />
              <TextInput
                placeholder="SKU"
                value={nuevoProducto.sku || ''}
                onChangeText={text => setNuevoProducto({ ...nuevoProducto, sku: text })}
                style={estilos.input}
              />
              <TextInput
                placeholder="Stock"
                value={nuevoProducto.stock?.toString() || ''}
                onChangeText={text => {
                  const numericValue = text.replace(/[^0-9]/g, ''); // Solo números.
                  setNuevoProducto({ ...nuevoProducto, stock: Number(numericValue) });
                }}
                keyboardType="numeric"
                style={estilos.input}
              />
               <TextInput
                placeholder="Precio"
                value={nuevoProducto.price?.toString() || ''}
                onChangeText={text => {
                  const decimalValue = text.replace(/[^0-9.]/g, ''); // Solo números y punto.
                  const parts = decimalValue.split('.');
                  if (parts.length > 2) return; // Evita múltiples puntos.
                  setNuevoProducto({ ...nuevoProducto, price: decimalValue });
                }}
                keyboardType="decimal-pad"
                style={estilos.input}
              />

              {/* Selector de Categoría (abre otro modal) */}
              <Text style={estilos.labelCategoria}>Categoría:</Text>
              <TouchableOpacity
                style={estilos.selectorCategoriaTouchable}
                onPress={() => setShowCategoryModal(true)} // Abre modal de categorías.
                // MODIFIED: Removed disabled prop to allow modal to always open
                // disabled={estadoCargaCat !== 'exito' || categorias.length === 0} 
              >
                <Text style={{ color: nuevoProducto.category_id ? Colors.text : Colors.textSecondary }}>
                  { // Muestra el nombre de la categoría seleccionada o un placeholder.
                    nuevoProducto.category_id
                      ? categorias.find(cat => cat.id === nuevoProducto.category_id)?.name || 'Seleccione...'
                      : estadoCargaCat === 'exito'
                        ? categorias.length > 0
                          ? 'Seleccione una categoría'
                          : 'No hay categorías'
                        : estadoCargaCat === 'error'
                          ? 'Error al cargar'
                          : 'Cargando...'
                  }
                </Text>
              </TouchableOpacity>

              {/* Botones de acción del modal */}
              <View style={estilos.modalBotonesContenedor}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={estilos.botonCancelarModal}>
                  <Text style={{ color: Colors.textSecondary }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCrearProducto} disabled={creando || estadoCargaCat !== 'exito'}>
                  <Text style={{ color: (creando || estadoCargaCat !== 'exito') ? Colors.textSecondary : Colors.primary, fontWeight: 'bold' }}>
                    {creando ? 'Creando...' : 'Crear'}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Indicador de carga y mensaje de error para la creación */}
              {creando && <IndicadorCarga tamaño="small" />}
              {errorCrear && <MensajeError mensaje={errorCrear} />}
            </View>
          </View>
        </Modal>
      )}

   

      {/* Lista principal de productos */}
      <FlatList
        data={productos}
        renderItem={renderizarProducto}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={!error && productos.length === 0 && estadoCargaProd === 'exito' ? <Text style={estilos.textoVacio}>No hay productos.</Text> : null}
        contentContainerStyle={{ paddingBottom: Layout.spacing.large }}
      />
       {error && productos.length > 0 && <MensajeError mensaje={error} />}
    </View>
  );
}

// Estilos del componente.
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
      flex: 1,
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
  modalOverlay: { 
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModalOverlay: { 
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: { 
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitulo: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
  },
  input: { 
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    paddingVertical: 8,
    fontSize: Layout.fontSize.body,
  },
  labelCategoria: { 
    marginBottom: 5,
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: Layout.fontSize.caption,
  },
  selectorCategoriaTouchable: { 
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    marginBottom: 15,
    justifyContent: 'center',
    minHeight: 40,
  },
  modalBotonesContenedor: { 
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  botonCancelarModal: {
    marginRight: 20,
    paddingVertical: 5,
  },
  modalContenidoCategoria: { 
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '70%', 
  },
  itemCategoriaModal: { 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 8,
  },
  itemCategoriaSeleccionada: { 
     backgroundColor: Colors.primaryLight,
  },
  botonCerrarModalCategoria: { 
    marginTop: 15,
    alignSelf: 'flex-end',
    paddingVertical: 5,
  },
  // ADDED: Styles for informational messages in modals
  contenedorMensajeModal: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.large,
  },
  textoModalInformativo: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Layout.fontSize.body,
    marginTop: Layout.spacing.medium,
  },
});