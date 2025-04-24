// Servicio para gestión de inventario usando helpers API
import { get, post } from './api';
import ApiConstants from '../constants/Api';
import { Categoria, Producto, Transaccion, ListaProductosResponse } from '../types';

// Obtiene todas las categorías
export const obtenerCategorias = async (): Promise<Categoria[]> => {
  try {
    const { data } = await get<Categoria[]>(ApiConstants.INVENTORY_CATEGORIES_ENDPOINT);
    return data.map(c => ({...c, created_at: c.created_at ? new Date(c.created_at).toISOString() : ''}));
  } catch (error) {
    console.error('[InventoryService] Error obteniendo categorías:', error);
    throw error;
  }
};

// Crea nueva categoría
export const crearCategoria = async (datos: Omit<Categoria, 'id'>): Promise<Categoria> => {
  try {
    const { data } = await post<Categoria>(ApiConstants.INVENTORY_CATEGORIES_ENDPOINT, datos);
    return {...data, created_at: data.created_at ? new Date(data.created_at).toISOString() : ''};
  } catch (error) {
    console.error('[InventoryService] Error creando categoría:', error);
    throw error;
  }
};

// Obtiene los detalles de un producto por su ID
export const obtenerDetalleProducto = async (productoId: number): Promise<Producto> => {
 
  try {
     const { data } = await get<Producto>(`${ApiConstants.INVENTORY_PRODUCTS_ENDPOINT}/${productoId}`);
     return normalizarProducto(data);
   } catch (error) {
     console.error('[InventoryService] Error obteniendo detalles del producto:', error);
     throw error;
   }
 };

// Obtiene productos con filtro opcional
export const obtenerProductos = async (categoriaId?: number): Promise<ListaProductosResponse> => {
 
 try {
    const params = categoriaId ? { category_id: categoriaId } : {};
    const { data } = await get<ListaProductosResponse>(ApiConstants.INVENTORY_PRODUCTS_ENDPOINT, params);
    return normalizarProductos(data);
  } catch (error) {
    console.error('[InventoryService] Error obteniendo productos:', error);
    throw error;
  }
};

// Crea nuevo producto
export const crearProducto = async (datos: Omit<Producto, 'id'>): Promise<Producto> => {
  try {
    const { data } = await post<Producto>(ApiConstants.INVENTORY_PRODUCTS_ENDPOINT, datos);
    return normalizarProducto(data);
  } catch (error) {
    console.error('[InventoryService] Error creando producto:', error);
    throw error;
  }
};

// Obtiene transacciones con filtro opcional
export const obtenerTransacciones = async (productoId?: number): Promise<Transaccion[]> => {
  try {
    const params = productoId ? { product_id: productoId } : {};
    const { data } = await get<Transaccion[]>(ApiConstants.INVENTORY_TRANSACTIONS_ENDPOINT, params);
    return data.map(t => ({...t, timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : ''}));
  } catch (error) {
    console.error('[InventoryService] Error obteniendo transacciones:', error);
    throw error;
  }
};
// Helpers internos
const normalizarProductos = (respuesta: ListaProductosResponse): ListaProductosResponse => ({
  count: respuesta.count,
  results: respuesta.results.map(normalizarProducto)
});

const normalizarProducto = (producto: Producto): Producto => ({
  ...producto,
  price: Number(producto.price) || 0,
  created_at: producto.created_at ? new Date(producto.created_at).toISOString() : '',
  updated_at: producto.updated_at ? new Date(producto.updated_at).toISOString() : ''
});