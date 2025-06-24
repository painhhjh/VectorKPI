// Pantalla principal del módulo de Inventario. Muestra lista de productos/categorías.
// hay que agregar que la lista de categorías se renderiza detrás del modal de crear producto

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
// Importaciones de Expo Router, servicios, tipos y componentes UI.
import { useFocusEffect, useRouter, Stack } from 'expo-router';
import { obtenerProductos, obtenerCategorias, crearProducto, crearCategoria } from '../../services/inventoryService';
import { Producto, Categoria } from '../../types';
import IndicadorCarga from '../../components/Common/LoadingIndicator';
import MensajeError from '../../components/Common/ErrorMessage';
import Boton from '../../components/Common/Button';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import CampoEntrada from '../../components/Common/InputField';

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
  const [creando, setCreando] = useState(false); // Estado de carga para la creación de producto.
  const [errorCrear, setErrorCrear] = useState<string | null>(null); // Error específico de creación de producto.

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
      Alert.alert("Éxito", "Producto creado correctamente."); // Notificación de éxito
    } catch (err: any) {
      setErrorCrear(err.message || 'Error al crear el producto.');
    } finally {
      setCreando(false); // Finaliza el estado de carga.
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
      setNuevoProducto(prev => ({
        ...prev,
        category_id: createdCategory.id
      }));
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
      {/* Configuración del título de la pantalla para Expo Router */}
      <Stack.Screen options={{ title: 'Inventario' }} />

      <Text style={estilos.tituloPlaceholder}>Inventario</Text>
      <Text style={estilos.subtituloPlaceholder}>Lista de Productos</Text>

      {/* Contenedor para los botones de acción principales */}
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

      {/* Modal para crear un nuevo producto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)} // Permite cerrar con botón atrás (Android).
      >
        {/* Contenedor del modal con fondo semitransparente */}
        <View style={estilos.modalOverlay}>
          {/* Contenido del modal de producto */}
          <View style={estilos.modalContenido}>
            <Text style={estilos.modalTitulo}>Crear Producto</Text>
            {/* Campos del formulario de producto */}
            <CampoEntrada
              etiqueta="Nombre del Producto" // Usar CampoEntrada para consistencia
              placeholder="Nombre"
              value={nuevoProducto.name}
              onChangeText={text => setNuevoProducto({ ...nuevoProducto, name: text })}
              style={estilos.input}
            />
            <CampoEntrada
              etiqueta="SKU (opcional)"
              placeholder="SKU"
              value={nuevoProducto.sku || ''}
              onChangeText={text => setNuevoProducto({ ...nuevoProducto, sku: text })}
              style={estilos.input}
            />
            <CampoEntrada
              etiqueta="Stock"
              placeholder="Stock"
              value={nuevoProducto.stock?.toString() || ''}
              onChangeText={text => {
                const numericValue = text.replace(/[^0-9]/g, ''); // Solo números.
                setNuevoProducto({ ...nuevoProducto, stock: Number(numericValue) });
              }}
              keyboardType="numeric"
              style={estilos.input}
            />
             <CampoEntrada
              etiqueta="Precio (opcional)"
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

            {/* Botones de acción del modal de producto */}
            <View style={estilos.modalBotonesContenedor}>
              <Boton
                  titulo="Cancelar"
                  onPress={() => setModalVisible(false)}
                  variante="secundario"
                  estiloContenedor={estilos.botonModal}
              />
              <Boton
                  titulo={creando ? 'Creando...' : 'Crear Producto'}
                  onPress={handleCrearProducto}
                  deshabilitado={creando || estadoCargaCat !== 'exito'}
                  cargando={creando}
                  estiloContenedor={estilos.botonModal}
              />
            </View>
            {/* Indicador de carga y mensaje de error para la creación */}
            {creando && <IndicadorCarga tamaño="small" />}
            {errorCrear && <MensajeError mensaje={errorCrear} />}
          </View>
        </View>
      </Modal>

      {/* Modal UNIFICADO para seleccionar la categoría */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={estilos.categoryModalOverlay}>
          <View style={estilos.modalContenidoCategoria}>
            <Text style={estilos.modalTitulo}>Seleccionar Categoría</Text>

            {/* NOTA: El botón "Crear Nueva Categoría" ha sido movido a la pantalla principal */}
            {/* Si aún deseas un botón aquí, tendrías que volver a añadirlo y decidir su comportamiento */}

            {/* Separador visual */}
            <View style={estilos.separator} />

            {/* Contenido mejorado para la lista de categorías */}
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
                        nuevoProducto.category_id === item.id && estilos.itemCategoriaSeleccionada
                    ]}
                    onPress={() => {
                      setNuevoProducto({ ...nuevoProducto, category_id: item.id });
                      setShowCategoryModal(false); // Cierra el modal al seleccionar
                    }}
                  >
                    <Text style={[
                      estilos.itemCategoryText,
                      nuevoProducto.category_id === item.id && { color: Colors.white } // Texto blanco si seleccionado
                    ]}>
                       {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                style={estilos.categoryList} // Asegura que FlatList tome espacio
                contentContainerStyle={estilos.categoryListContent} // Estilo para el contenido de la lista
              />
            )}

            {/* Botón para cerrar el modal de categorías */}
            <Boton
              titulo="Cerrar"
              onPress={() => setShowCategoryModal(false)}
              variante="texto"
              estiloContenedor={estilos.closeCategoryModalButton}
            />
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
  mainActionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.medium,
    gap: Layout.spacing.small,
  },
  mainActionButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.tiny,
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
    maxWidth: 400,
  },
  modalTitulo: {
    fontWeight: 'bold',
    fontSize: Layout.fontSize.heading,
    marginBottom: Layout.spacing.medium,
    color: Colors.text,
    textAlign: 'center',
  },
  input: {
    marginBottom: Layout.spacing.medium,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  labelCategoria: {
    marginBottom: Layout.spacing.small,
    marginTop: Layout.spacing.small,
    color: Colors.textSecondary,
    fontSize: Layout.fontSize.body,
    fontWeight: '500',
  },
  selectorCategoriaTouchable: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.medium,
    marginBottom: Layout.spacing.medium,
    justifyContent: 'center',
    minHeight: 48,
    backgroundColor: Colors.white,
  },
  modalBotonesContenedor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.large,
  },
  botonModal: {
    flex: 1,
    marginHorizontal: Layout.spacing.tiny,
  },
  modalContenidoCategoria: {
    backgroundColor: Colors.white,
    padding: Layout.spacing.large,
    borderRadius: Layout.borderRadius.medium,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  createCategoryButton: {
    marginTop: Layout.spacing.small,
    marginBottom: Layout.spacing.medium,
    width: '100%',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.lightGray,
    marginVertical: Layout.spacing.medium,
  },
  categoryList: {
    width: '100%',
    flex: 1,
  },
  categoryListContent: {
    width: '100%',
    flexGrow: 1,
    paddingBottom: Layout.spacing.small,
  },
  itemCategoriaModal: {
    paddingVertical: Layout.spacing.medium * 1.2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.small,
    marginBottom: Layout.spacing.tiny,
    paddingHorizontal: Layout.spacing.medium,
  },
  itemCategoriaSeleccionada: {
     backgroundColor: Colors.primary,
     borderColor: Colors.primary,
     borderWidth: 1,
  },
  itemCategoryText: {
    fontSize: Layout.fontSize.body,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  closeCategoryModalButton: {
    marginTop: Layout.spacing.medium,
    alignSelf: 'flex-end',
  },
  textoModalInformativo: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Layout.fontSize.body,
    marginTop: Layout.spacing.medium,
    padding: Layout.spacing.small,
  },
  botonCerrarModalCategoria: {
    marginTop: Layout.spacing.medium,
    alignSelf: 'flex-end',
    paddingVertical: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    backgroundColor: 'transparent',
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
  formError: {
    marginBottom: Layout.spacing.medium,
    width: '100%',
  },
});
