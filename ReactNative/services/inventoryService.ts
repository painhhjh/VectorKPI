// Servicio para gestión de inventario usando helpers API
import { get, post, put, del } from './api';
import ApiConstants, { getCategoryUrl, getProductUrl, getTransactionUrl } from '../constants/Api';
import { Categoria, Producto, Transaccion, ListaProductosResponse } from '../types';

// Obtiene todas las categorías
export const obtenerCategorias = async (): Promise<Categoria[]> => {
  try {
    // El backend devuelve List[CategoryRead], que es una lista directa
    const { data } = await get<Categoria[]>(ApiConstants.INVENTORY_CATEGORIES);
    return data.map(normalizarCategoria); // Mapeamos directamente sobre la lista
  } catch (error) {
    console.error('[InventoryService] Error obteniendo categorías:', error); // Descomentar para depuración
    throw new Error(`Error obteniendo categorías: ${(error as Error).message}`);
  }
};

export const obtenerCategoriaPorId = async (id: number): Promise<Categoria> => {
  try {
    const url = getCategoryUrl(id);
    const { data } = await get<Categoria>(url);
    return normalizarCategoria(data);
  } catch (error) {
    console.error(`[InventoryService] Error obteniendo categoría ${id}:`, error); // Descomentar para depuración
    throw new Error(`Error obteniendo categoría ${id}: ${(error as Error).message}`);
  }
};

// Crea nueva categoría
export const crearCategoria = async (datos: Omit<Categoria, 'id'>): Promise<Categoria> => {
  try {
    const { data } = await post<Categoria>(ApiConstants.INVENTORY_CATEGORIES, datos);
    // Normalizamos la respuesta individual
    return normalizarCategoria(data);
  } catch (error) {
    console.error('[InventoryService] Error creando categoría:', error);
    throw error;
  }
};


// Productos

export const obtenerProductos = async (
  categoriaId?: number,
  pagina: number = 1,
  porPagina: number = 20
): Promise<Producto[]> => { // Cambiado el tipo de retorno a Producto[]
  try {
    const params = {
      ...(categoriaId && { category_id: categoriaId }),
      // El backend usa skip/limit, no page/per_page para productos según inventory.py
      skip: (pagina - 1) * porPagina,
      limit: porPagina
    };

    // El backend devuelve List[ProductRead], que es una lista directa
    const { data } = await get<Producto[]>(ApiConstants.INVENTORY_PRODUCTS, params);
    // Normalizamos la lista directamente
    return normalizarListaProductos(data);
  } catch (error) {
    console.error('[InventoryService] Error obteniendo productos:', error); // Descomentar para depuración
    throw new Error(`Error obteniendo productos: ${(error as Error).message}`);
  }
};

export const obtenerDetalleProducto = async (id: number): Promise<Producto> => {
  try {
    const url = getProductUrl(id);
    const { data } = await get<Producto>(url);
    return normalizarProducto(data);
  } catch (error) {
    console.error(`[InventoryService] Error obteniendo producto ${id}:`, error); // Descomentar para depuración
    throw new Error(`Error obteniendo producto ${id}: ${(error as Error).message}`);
  }
};

// Crea nuevo producto
export const crearProducto = async (datos: Omit<Producto, 'id'>): Promise<Producto> => {
  try {
    const { data } = await post<Producto>(ApiConstants.INVENTORY_PRODUCTS, datos);
    return normalizarProducto(data);
  } catch (error) {
    console.error('[InventoryService] Error creando producto:', error);
    throw error;
  }
};

export const actualizarProducto = async (
  id: number,
  cambios: Partial<Omit<Producto, 'id'>>
): Promise<Producto> => {
  try {
    const url = getProductUrl(id);
    const { data } = await put<Producto>(url, cambios);
    return normalizarProducto(data);
  } catch (error) {
    console.error(`[InventoryService] Error actualizando producto ${id}:`, error);
    throw new Error(`Error actualizando producto ${id}: ${(error as Error).message}`);
  }
};

export const eliminarProducto = async (id: number): Promise<void> => {
  try {
    const url = getProductUrl(id);
    await del(url);
  } catch (error) {
    throw new Error(`Error eliminando producto ${id}: ${(error as Error).message}`);
  }
};

// Transacciones

export const obtenerTransacciones = async (
  productoId?: number,
  pagina: number = 1,
  porPagina: number = 50
): Promise<Transaccion[]> => {
  try {
    const params = {
      ...(productoId && { product_id: productoId }),
      skip: (pagina - 1) * porPagina,
      limit: porPagina
    };

    // El backend devuelve List[TransactionRead], que es una lista directa
    const { data } = await get<Transaccion[]>(ApiConstants.INVENTORY_TRANSACTIONS, params);
    return data.map(normalizarTransaccion); // Mapeamos directamente sobre la lista
  } catch (error) {
    console.error('[InventoryService] Error obteniendo transacciones:', error); // Descomentar para depuración
    throw new Error(`Error obteniendo transacciones: ${(error as Error).message}`);
  }
};

export const obtenerDetalleTransaccion = async (id: number): Promise<Transaccion> => {
  try {
    const url = getTransactionUrl(id);
    const { data } = await get<Transaccion>(url);
    return normalizarTransaccion(data);
  } catch (error) {
    console.error(`[InventoryService] Error obteniendo transacción ${id}:`, error); // Descomentar para depuración
    throw new Error(`Error obteniendo transacción ${id}: ${(error as Error).message}`);
  }
};

export const crearTransaccion = async (datos: Omit<Transaccion, 'id'>): Promise<Transaccion> => {
  try {
    const { data } = await post<Transaccion>(ApiConstants.INVENTORY_TRANSACTIONS, datos);
    return normalizarTransaccion(data);
  } catch (error) {
    console.error('[InventoryService] Error creando transacción:', error);
    throw new Error(`Error creando transacción: ${(error as Error).message}`);
  }
};

// Helpers de Normalización

const normalizarCategoria = (categoria: Categoria): Categoria => ({
  ...categoria,
  created_at: normalizarFecha(categoria.created_at),
  updated_at: categoria.updated_at ? normalizarFecha(categoria.updated_at) : ''
});

const normalizarProducto = (producto: Producto): Producto => ({
  ...producto,
  price: Number(producto.price) || 0,
  created_at: normalizarFecha(producto.created_at),
  updated_at: producto.updated_at ? normalizarFecha(producto.updated_at) : '',
  category: producto.category ? normalizarCategoria(producto.category) : undefined
});

const normalizarTransaccion = (transaccion: Transaccion): Transaccion => ({
  ...transaccion,
  timestamp: normalizarFecha(transaccion.timestamp),
  product: transaccion.product ? normalizarProducto(transaccion.product) : undefined
});

const normalizarListaProductos = (listaProductos: Producto[]): Producto[] => {
  // Si el backend ya devuelve objetos Producto correctos, solo mapeamos para normalizar fechas/números
  return listaProductos.map(normalizarProducto);
};

const normalizarFecha = (fecha?: string | Date): string => {
  if (!fecha) return '';
  // Asegurarse de que la fecha sea un formato válido para el constructor de Date
  const date = new Date(fecha);
  return isNaN(date.getTime()) ? '' : date.toISOString();
};