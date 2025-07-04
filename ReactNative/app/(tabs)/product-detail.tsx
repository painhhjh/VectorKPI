// Pantalla para mostrar los detalles de un Producto específico.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TextInput, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'; // Importa useRouter
import { obtenerDetalleProducto, actualizarProducto, eliminarProducto, obtenerCategorias } from '../../services/inventoryService'; // Importa funciones de servicio
import { Producto, ProductUpdateRequest, Categoria } from '../../types/inventory'; // Asegúrate de que la importación sea de inventory.ts
import IndicadorCarga from '../../components/Common/LoadingIndicator';
import MensajeError from '../../components/Common/ErrorMessage';
import Boton from '../../components/Common/Button';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { useAuth } from '../../contexts/useAuth'; // Para obtener el ID del usuario actual
// import { Picker } from '@react-native-picker/picker'; // Comentado si no se usa directamente en JSX, ya que se usa un modal personalizado

type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

export default function PantallaDetalleProducto() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter(); // Inicializa el router
  const { usuario } = useAuth(); // Obtiene el usuario autenticado para owner_id

  const [producto, setProducto] = useState<Producto | null>(null);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>('idle');
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal de edición
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editProductName, setEditProductName] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductStock, setEditProductStock] = useState('');
  const [editProductSku, setEditProductSku] = useState('');
  const [editSelectedCategoryId, setEditSelectedCategoryId] = useState<number | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categoria[]>([]); // Para el selector de categorías
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

  // Función para cargar los detalles del producto
  const cargarDetalle = useCallback(async () => {
    const productoId = Number(id);
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

  // Función para cargar las categorías
  const cargarCategorias = useCallback(async () => {
    try {
      const cats = await obtenerCategorias();
      setCategories(cats);
    } catch (err) {
      console.error("Error cargando categorías para edición:", err);
      // No es un error crítico si no se pueden cargar las categorías para la edición,
      // pero se debe informar al usuario en el modal.
    }
  }, []);

  // Carga los datos cuando el ID cambia o el componente se monta
  useEffect(() => {
    cargarDetalle();
    cargarCategorias();
  }, [cargarDetalle, cargarCategorias]);

  // Función para abrir el modal de edición y pre-rellenar los campos
  const openEditModal = () => {
    if (producto) {
      setEditProductName(producto.name);
      setEditProductDescription(producto.description || '');
      setEditProductPrice(producto.price?.toString() || '');
      setEditProductStock(producto.stock.toString());
      setEditProductSku(producto.sku || '');
      setEditSelectedCategoryId(producto.category_id || undefined);
      setUpdateError(null); // Limpiar errores previos
      setIsEditModalVisible(true);
    }
  };

  // Función para manejar la actualización del producto
  const handleUpdateProduct = async () => {
    if (!producto || !usuario?.id) {
      Alert.alert('Error', 'No se pudo obtener la información del producto o del usuario.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    // Validaciones básicas
    if (!editProductName || editProductStock === '' || editSelectedCategoryId === undefined) {
      setUpdateError('Nombre, stock y categoría son obligatorios.');
      setIsUpdating(false);
      return;
    }

    const parsedPrice = editProductPrice === '' ? undefined : parseFloat(editProductPrice);
    if (editProductPrice !== '' && isNaN(parsedPrice!)) {
      setUpdateError('El precio debe ser un número válido.');
      setIsUpdating(false);
      return;
    }

    const parsedStock = parseInt(editProductStock);
    if (isNaN(parsedStock)) {
      setUpdateError('El stock debe ser un número entero válido.');
      setIsUpdating(false);
      return;
    }

    try {
      const updateData: ProductUpdateRequest = {
        name: editProductName,
        description: editProductDescription || undefined,
        price: parsedPrice,
        stock: parsedStock,
        sku: editProductSku || undefined,
        category_id: editSelectedCategoryId,
        // owner_id no se envía en ProductUpdate, se maneja en el backend por el current_user
      };

      await actualizarProducto(producto.id, updateData);
      Alert.alert('Éxito', 'Producto actualizado exitosamente.');
      setIsEditModalVisible(false);
      cargarDetalle(); // Recargar los detalles para mostrar los cambios
    } catch (err: any) {
      console.error('Error actualizando producto:', err);
      setUpdateError(err.message || 'No se pudo actualizar el producto.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Función para manejar la eliminación del producto
  const handleDeleteProduct = () => {
    if (!producto || !usuario?.id) {
      Alert.alert('Error', 'No se pudo obtener la información del producto o del usuario.');
      return;
    }

    console.log(`[ProductDetail] Intentando eliminar producto con ID: ${producto.id}`);
    console.log(`[ProductDetail] Propietario del producto: ${producto.owner_id}`);
    console.log(`[ProductDetail] ID del usuario autenticado: ${usuario.id}`);


    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que deseas eliminar "${producto.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // owner_id se pasa para la verificación de permisos en el backend
              console.log(`[ProductDetail] Confirmado eliminar producto ID: ${producto.id}`);
              await eliminarProducto(producto.id); // La función CRUD ya usa owner_id del token
              console.log(`[ProductDetail] Producto eliminado exitosamente en el backend.`);
              Alert.alert('Producto Eliminado', 'El producto ha sido eliminado exitosamente.');
              router.replace('/(tabs)/inventory'); // Navegar de vuelta a la lista de inventario
            } catch (err: any) {
              console.error('[ProductDetail] Error eliminando producto:', err);
              Alert.alert('Error', err.message || 'No se pudo eliminar el producto.');
            }
          },
        },
      ]
    );
  };

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
        <Text style={estilos.infoAdicional}>Precio: {producto.price ? `$${producto.price.toFixed(2)}` : 'No disponible'}</Text>
        <Text style={estilos.infoAdicional}>Categoría: {producto.category?.name || (producto.category_id ? `ID ${producto.category_id}` : 'Sin categoría')}</Text>
        <Text style={estilos.infoAdicional}>Propietario ID: {producto.owner_id}</Text>
        <Text style={estilos.infoAdicional}>Creado: {new Date(producto.created_at).toLocaleString()}</Text>
        {producto.updated_at && <Text style={estilos.infoAdicional}>Actualizado: {new Date(producto.updated_at).toLocaleString()}</Text>}
      </View>

      {/* Sección de Transacciones (Placeholder) */}
      <View style={estilos.seccionTransacciones}>
        <Text style={estilos.tituloSeccion}>Historial de Transacciones</Text>
        {/* Aquí iría la FlatList o mapeo de transacciones */}
        <Text style={estilos.textoVacio}>No hay transacciones registradas para este producto.</Text>
      </View>

      {/* Botones para editar/eliminar */}
      <View style={estilos.contenedorBotones}>
        <Boton
          titulo="Editar Producto"
          onPress={openEditModal} // Llama a la función para abrir el modal de edición
          variante="secundario"
        />
        <Boton
          titulo="Eliminar Producto"
          onPress={handleDeleteProduct} // Llama a la función de eliminación
          variante="peligro"
          estiloContenedor={{ marginTop: Layout.spacing.small }}
        />
      </View>

      {/* Modal de Edición de Producto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <Text style={estilos.modalTitulo}>Editar Producto</Text>
            {updateError && <MensajeError mensaje={updateError} />}

            <TextInput
              placeholder="Nombre del Producto"
              value={editProductName}
              onChangeText={setEditProductName}
              style={estilos.input}
            />
            <TextInput
              placeholder="Descripción (opcional)"
              value={editProductDescription}
              onChangeText={setEditProductDescription}
              multiline
              numberOfLines={3}
              style={[estilos.input, { height: 80 }]}
            />
            <TextInput
              placeholder="Precio (ej: 85.50)"
              value={editProductPrice}
              onChangeText={text => {
                const decimalValue = text.replace(/[^0-9.]/g, '');
                const parts = decimalValue.split('.');
                if (parts.length > 2) return; // Evita múltiples puntos decimales
                setEditProductPrice(decimalValue);
              }}
              keyboardType="decimal-pad"
              style={estilos.input}
            />
            <TextInput
              placeholder="Stock (ej: 100)"
              value={editProductStock}
              onChangeText={text => {
                const numericValue = text.replace(/[^0-9]/g, '');
                setEditProductStock(numericValue);
              }}
              keyboardType="numeric"
              style={estilos.input}
            />
            <TextInput
              placeholder="SKU (opcional)"
              value={editProductSku}
              onChangeText={setEditProductSku}
              style={estilos.input}
            />

            {/* Selector de Categoría para Edición */}
            <Text style={estilos.labelCategoria}>Categoría:</Text>
            <TouchableOpacity
              style={estilos.selectorCategoriaTouchable}
              onPress={() => setShowEditCategoryModal(true)}
            >
              <Text style={{ color: editSelectedCategoryId ? Colors.text : Colors.textSecondary }}>
                {editSelectedCategoryId
                  ? categories.find(cat => cat.id === editSelectedCategoryId)?.name || 'Seleccione...'
                  : categories.length > 0
                    ? 'Seleccione una categoría'
                    : 'No hay categorías'
                }
              </Text>
            </TouchableOpacity>

            <View style={estilos.modalBotonesContenedor}>
              <Boton
                titulo="Cancelar"
                onPress={() => setIsEditModalVisible(false)}
                variante="secundario"
                estiloContenedor={{ marginRight: Layout.spacing.small }}
              />
              <Boton
                titulo={isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                onPress={handleUpdateProduct}
                deshabilitado={isUpdating || !editProductName || editProductStock === '' || editSelectedCategoryId === undefined}
                variante="primario"
              />
            </View>
            {isUpdating && <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 10 }} />}
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar la categoría en edición (similar al de creación) */}
      <Modal
        visible={showEditCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditCategoryModal(false)}
      >
        <View style={estilos.categoryModalOverlay}>
          <View style={estilos.modalContenidoCategoria}>
            <Text style={estilos.modalTitulo}>Seleccionar Categoría</Text>
            {categories.length === 0 ? (
              <Text style={estilos.textoModalInformativo}>No hay categorías disponibles.</Text>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item: Categoria) => item.id.toString()}
                renderItem={({ item }: { item: Categoria }) => (
                  <TouchableOpacity
                    style={[
                      estilos.itemCategoriaModal,
                      editSelectedCategoryId === item.id && estilos.itemCategoriaSeleccionada
                    ]}
                    onPress={() => {
                      setEditSelectedCategoryId(item.id);
                      setShowEditCategoryModal(false);
                    }}
                  >
                    <Text style={{ color: editSelectedCategoryId === item.id ? Colors.primary : Colors.text }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={estilos.botonCerrarModalCategoria}
              onPress={() => setShowEditCategoryModal(false)}
            >
              <Text style={{ color: Colors.textSecondary, fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    marginBottom: Layout.spacing.large,
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
    borderBottomColor: Colors.border + '50',
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
    maxHeight: '80%', // Limita la altura del modal para scroll
  },
  modalTitulo: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.small,
    padding: 10,
    marginBottom: 12,
    fontSize: Layout.fontSize.body,
    color: Colors.text,
  },
  labelCategoria: {
    marginBottom: 5,
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: Layout.fontSize.caption,
  },
  selectorCategoriaTouchable: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.small,
    padding: 10,
    marginBottom: 15,
    justifyContent: 'center',
    minHeight: 40,
  },
  modalBotonesContenedor: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  textoVacio: {
    textAlign: 'center',
    marginTop: Layout.spacing.medium,
    color: Colors.textSecondary,
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
  textoModalInformativo: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Layout.fontSize.body,
    marginTop: Layout.spacing.medium,
  },
});
