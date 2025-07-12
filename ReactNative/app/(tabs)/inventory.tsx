// React Native/app/(tabs)/inventory.tsx
// Pantalla principal del módulo de Inventario. Muestra lista de productos/categorías.
// hay que agregar que la lista de categorías se renderiza detrás del modal de crear producto

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'; // Añadido Alert para mensajes
import { useFocusEffect, useRouter } from 'expo-router';
import { obtenerProductos, obtenerCategorias, crearProducto, crearCategoria } from '../../services/inventoryService';
import { Producto, Categoria, ProductCreateRequest, ListaProductosResponse } from '../../types/inventory'; // Importa ProductCreateRequest
import IndicadorCarga from '../../components/Common/LoadingIndicator';
import MensajeError from '../../components/Common/ErrorMessage';
import Boton from '../../components/Common/Button';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { Picker } from '@react-native-picker/picker'; // Importa Picker
import { useAuth } from '../../contexts/useAuth'; // Importa useAuth para obtener el ID del usuario
import CampoEntrada from '@/components/Common/InputField';

// Define los posibles estados de carga de datos.
type EstadoCarga = 'idle' | 'cargando' | 'exito' | 'error';

// Componente principal de la pantalla de inventario.
export default function PantallaInventario() {
  // --- HOOKS ---
  const { usuario } = useAuth(); // Obtiene el objeto usuario del contexto de autenticación

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
  const [nuevoProductoNombre, setNuevoProductoNombre] = useState<string>('');
  const [nuevoProductoDescripcion, setNuevoProductoDescripcion] = useState<string>('');
  const [nuevoProductoPrecio, setNuevoProductoPrecio] = useState<string>(''); // Mantener como string para TextInput
  const [nuevoProductoStock, setNuevoProductoStock] = useState<string>(''); // Mantener como string para TextInput
  const [nuevoProductoSku, setNuevoProductoSku] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);

  // Estado para el modal de selección de categoría.
  const [showCategoryModal, setShowCategoryModal] = useState(false);
    // estados para el modal de creación de categorías
  const [modalCrearCategoriaVisible, setModalCrearCategoriaVisible] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({ name: '', description: '' });
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [errorCrearCategoria, setErrorCrearCategoria] = useState<string | null>(null);

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
      setProductos(productosRes); // productosRes es un array de Producto
      setEstadoCargaCat('exito');
      setEstadoCargaProd('exito');
      console.log('[InventoryScreen] Datos de inventario cargados.');

      // Establece categoría por defecto si no hay una seleccionada y hay categorías disponibles.
      if (selectedCategoryId === undefined && categoriasRes.length > 0) {
        setSelectedCategoryId(categoriasRes[0].id);
      }

    } catch (err: any) {
      console.error('[InventoryScreen] Error cargando datos:', err);
      setError(err.message || 'No se pudieron cargar los datos del inventario.');
      setEstadoCargaProd('error');
      setEstadoCargaCat('error');
      setProductos([]); // Limpia en caso de error.
      setCategorias([]);
    }
  }, [selectedCategoryId]); // Depende de selectedCategoryId para la inicialización

  // Ejecuta `cargarDatos` cuando la pantalla obtiene foco.
  useFocusEffect(
    useCallback(() => {
      if (estadoCargaProd === 'idle' || estadoCargaProd === 'error' ||
          estadoCargaCat === 'idle' || estadoCargaCat === 'error') {
        cargarDatos();
      }
      return () => {};
    }, [cargarDatos, estadoCargaProd, estadoCargaCat])
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
    // Resetea los campos del nuevo producto.
    setNuevoProductoNombre('');
    setNuevoProductoDescripcion('');
    setNuevoProductoPrecio('');
    setNuevoProductoStock('0'); // Inicializa stock a 0
    setNuevoProductoSku('');
    setSelectedCategoryId(categorias.length > 0 ? categorias[0].id : undefined); // Preselecciona la primera categoría si existe.
    setErrorCrear(null); // Limpia errores previos.
    setModalVisible(true); // Muestra el modal.
  };

  // Maneja el envío del formulario de creación de producto.
  const handleCrearProducto = async () => {
    setErrorCrear(null);
    setCreando(true);

    if (!usuario?.id) {
      setErrorCrear('No se pudo determinar el propietario del producto. Por favor, inicie sesión.');
      setCreando(false);
      return;
    }

    if (!nuevoProductoNombre || nuevoProductoStock === '' || selectedCategoryId === undefined) {
      setErrorCrear('El nombre, stock y categoría son obligatorios.');
      setCreando(false);
      return;
    }

    // Validación de números
    const parsedPrice = nuevoProductoPrecio === '' ? undefined : parseFloat(nuevoProductoPrecio);
    if (nuevoProductoPrecio !== '' && isNaN(parsedPrice!)) {
      setErrorCrear('El precio debe ser un número válido.');
      setCreando(false);
      return;
    }

    const parsedStock = parseInt(nuevoProductoStock);
    if (isNaN(parsedStock)) {
      setErrorCrear('El stock debe ser un número entero válido.');
      setCreando(false);
      return;
    }

    try {
      const productData: ProductCreateRequest = {
        name: nuevoProductoNombre,
        description: nuevoProductoDescripcion || undefined,
        price: parsedPrice,
        stock: parsedStock,
        sku: nuevoProductoSku || undefined,
        category_id: selectedCategoryId,
        owner_id: Number(usuario.id), // Usa el ID del usuario autenticado
      };

      await crearProducto(productData);
      setModalVisible(false);
      Alert.alert('Éxito', 'Producto creado exitosamente.');
      cargarDatos(); // Recarga la lista de productos.
    } catch (err: any) {
      console.error('[InventoryScreen] Error al crear el producto:', err);
      setErrorCrear(err.message || 'Error al crear el producto.');
    } finally {
      setCreando(false);
    }
  };

  // función que maneja la creación de una nueva categoría
  const handleCrearNuevaCategoria = async () => {
    setErrorCrearCategoria(null);
    setCreandoCategoria(true);


    // Validación del formulario
    if (!nuevaCategoria.name || nuevaCategoria.name.trim().length < 2) {
      setErrorCrearCategoria("El nombre de la categoría es obligatorio y debe tener al menos 2 caracteres.");
      setCreandoCategoria(false);

      return;
    }
    if (nuevaCategoria.description && nuevaCategoria.description.length > 500) {
      setErrorCrearCategoria("La descripción no puede exceder los 500 caracteres.");
      setCreandoCategoria(false);


      return;
    }

    try {
      // Llama al servicio para crear la categoría
      const createdCategory = await crearCategoria({
        ...nuevaCategoria
      });
      console.log("Categoría creada:", createdCategory);

      // 1. Cerrar automáticamente el modal de creación
      setModalCrearCategoriaVisible(false);
      // 2. Actualizar la lista de categorías
      await cargarDatos();
      // 3. Preseleccionar automáticamente la nueva categoría en el formulario de producto
      // setNuevoProducto(prev => ({
      //   ...prev,
      //   category_id: createdCategory.id
      // }));
      // 4. Retornar al modal de selección con la nueva categoría disponible
      // Esto solo es necesario si el flujo deseado es regresar al selector de categorías.
      // Si el botón de "Crear Categoría" está ahora en la pantalla principal,
      // el usuario podría no esperar volver al selector automáticamente.
      // setShowCategoryModal(true); // Descomentar si el flujo lo requiere.

      // Limpiar el formulario
      setNuevaCategoria({ name: '', description: '' });
      Alert.alert("Éxito", `Categoría "${createdCategory.name}" creada correctamente.`);





    } catch (err: any) {
      console.error("Error al crear categoría:", err);
      // Extrae el mensaje de error del backend si está disponible
      let errorMessage = "Error al crear la categoría. Intente de nuevo.";
      if (err.message) {
          // Asumiendo que el interceptor de Axios ya formatea el error.message
          errorMessage = err.message;
      }
      setErrorCrearCategoria(errorMessage);
    } finally {
      setCreandoCategoria(false);
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

     <View style={estilos.mainActionButtonsContainer}>
      {/* Botón para abrir el modal de añadir producto */}
      <Boton
        titulo="Añadir Producto"
        onPress={abrirModal}
        variante="primario"
        estiloContenedor={estilos.mainActionButton}
      />
      {/* BOTÓN: Crear Categoría en la pantalla principal */}
        <Boton
          titulo="Crear Categoría"
          onPress={() => setModalCrearCategoriaVisible(true)}
          variante="secundario"
          estiloContenedor={estilos.mainActionButton}
        />
    </View> 
      

      {/* Lista principal de productos */}
      <FlatList
        data={productos}
        renderItem={renderizarProducto}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={!error && productos.length === 0 &&
          estadoCargaProd === 'exito' ? <Text style={estilos.textoVacio}>No hay
          productos.</Text> : null}
        contentContainerStyle={{ paddingBottom: Layout.spacing.large }}
      />
      {error && productos.length > 0 && <MensajeError mensaje={error} />}

            {/* Modal para seleccionar la categoría (separado para mejor UX) */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={estilos.categoryModalOverlay}>
          <View style={estilos.modalContenidoCategoria}>
            <Text style={estilos.modalTitulo}>Seleccionar Categoría</Text>
            {estadoCargaCat === 'error' ? (
              <Text style={estilos.textoModalInformativo}>Error al cargar categorías.</Text>
            ) : categorias.length === 0 ? (
              <Text style={estilos.textoModalInformativo}>No hay categorías disponibles.</Text>
            ) : (
              <FlatList
                data={categorias}
                keyExtractor={(item: Categoria) => item.id.toString()}
                renderItem={({ item }: { item: Categoria }) => (
                  <TouchableOpacity
                    style={[
                      estilos.itemCategoriaModal,
                      selectedCategoryId === item.id && estilos.itemCategoriaSeleccionada
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(item.id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={{ color: selectedCategoryId === item.id ? Colors.primary : Colors.text }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={estilos.botonCerrarModalCategoria}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={{ color: Colors.textSecondary, fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para crear un nuevo producto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={estilos.modalOverlay}>
          {/* Contenido del modal */}
          <View style={estilos.modalContenido}>
            <Text style={estilos.modalTitulo}>Crear Producto</Text>
            {/* Campos del formulario */}
            <TextInput
              placeholder="Nombre"
              value={nuevoProductoNombre}
              onChangeText={setNuevoProductoNombre}
              style={estilos.input}
            />
            <TextInput
              placeholder="SKU (Opcional)"
              value={nuevoProductoSku}
              onChangeText={setNuevoProductoSku}
              style={estilos.input}
            />
            <TextInput
              placeholder="Stock"
              value={nuevoProductoStock}
              onChangeText={text => {
                const numericValue = text.replace(/[^0-9]/g, '');
                setNuevoProductoStock(numericValue);
              }}
              keyboardType="numeric"
              style={estilos.input}
            />
            <TextInput
              placeholder="Precio (Opcional)"
              value={nuevoProductoPrecio}
              onChangeText={text => {
                const decimalValue = text.replace(/[^0-9.]/g, '');
                const parts = decimalValue.split('.');
                if (parts.length > 2) return;
                setNuevoProductoPrecio(decimalValue);
              }}
              keyboardType="decimal-pad"
              style={estilos.input}
            />
            <TextInput
              placeholder="Descripción (Opcional)"
              value={nuevoProductoDescripcion}
              onChangeText={setNuevoProductoDescripcion}
              multiline
              numberOfLines={3}
              style={[estilos.input, { height: 80 }]}
            />

            {/* Selector de Categoría */}
            <Text style={estilos.labelCategoria}>Categoría:</Text>
            <TouchableOpacity
              style={estilos.selectorCategoriaTouchable}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={{ color: selectedCategoryId ? Colors.text : Colors.textSecondary }}>
                {selectedCategoryId
                  ? categorias.find(cat => cat.id === selectedCategoryId)?.name || 'Seleccione...'
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
              <TouchableOpacity
                onPress={handleCrearProducto}
                disabled={creando || estadoCargaCat !== 'exito' || !nuevoProductoNombre || nuevoProductoStock === '' || selectedCategoryId === undefined}
              >
                <Text style={{ color: (creando || estadoCargaCat !== 'exito' || !nuevoProductoNombre || nuevoProductoStock === '' || selectedCategoryId === undefined) ? Colors.textSecondary : Colors.primary, fontWeight: 'bold' }}>
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




       {/* Modal para CREAR NUEVA Categoría (este es un modal diferente) */}
      <Modal
        visible={modalCrearCategoriaVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalCrearCategoriaVisible(false);
          setErrorCrearCategoria(null); // Limpiar errores al cerrar
          setNuevaCategoria({ name: '', description: '' }); // Limpiar formulario al cerrar
        }}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenidoCrearCategoria}>
            <Text style={estilos.modalTitulo}>Crear Nueva Categoría</Text>

            <CampoEntrada
              etiqueta="Nombre de la Categoría"
              placeholder="Ej: Perforación, Logística"
              value={nuevaCategoria.name}
              onChangeText={(text) => setNuevaCategoria({ ...nuevaCategoria, name: text })}
              error={errorCrearCategoria && nuevaCategoria.name.trim().length < 2 ? errorCrearCategoria : undefined}
              style={estilos.input}
            />
            <CampoEntrada
              etiqueta="Descripción (opcional)"
              placeholder="Breve descripción de la categoría"
              value={nuevaCategoria.description}
              onChangeText={(text) => setNuevaCategoria({ ...nuevaCategoria, description: text })}
              multiline
              numberOfLines={4}
              error={errorCrearCategoria && nuevaCategoria.description && nuevaCategoria.description.length > 500 ? errorCrearCategoria : undefined}
              style={[estilos.input, estilos.descriptionInput]}
            />

            {errorCrearCategoria && <MensajeError mensaje={errorCrearCategoria} estiloContenedor={estilos.formError} />}

            <View style={estilos.modalBotonesContenedor}>
                <Boton
                  titulo="Cancelar"
                  onPress={() => {
                    setModalCrearCategoriaVisible(false);
                    setErrorCrearCategoria(null);
                    setNuevaCategoria({ name: '', description: '' });
                  }}
                  variante="secundario"
                  estiloContenedor={estilos.botonModal}
                />
                <Boton
                  titulo={creandoCategoria ? "Creando..." : "Crear Categoría"}
                  onPress={handleCrearNuevaCategoria}
                  deshabilitado={creandoCategoria || nuevaCategoria.name.trim().length < 2}
                  cargando={creandoCategoria}
                  estiloContenedor={estilos.botonModal}
                />
            </View>
          </View>
        </View>
      </Modal>
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
    padding: Layout.spacing.large,
    borderRadius: Layout.borderRadius.medium,
    width: '90%',
  },
  modalTitulo: {
    fontWeight: 'bold',
    fontSize: Layout.fontSize.heading,
    marginBottom: Layout.spacing.medium,
    color: Colors.text,
    textAlign: 'center',
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
  modalContenidoCrearCategoria: {
    backgroundColor: Colors.white,
    padding: Layout.spacing.large,
    borderRadius: Layout.borderRadius.medium,
    width: '90%',
    maxWidth: 400,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  botonModal: {
    flex: 1,
    marginHorizontal: Layout.spacing.tiny,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  formError: {
    marginBottom: Layout.spacing.medium,
    width: '100%',
  },
  mainActionButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.tiny,
  },
  mainActionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.medium,
    gap: Layout.spacing.small,
  },
});
