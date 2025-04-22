/**
 * @file Servicio para interactuar con los endpoints de la API relacionados con el inventario.
 * @description Define funciones para obtener y gestionar categorías, productos y transacciones.
 */
import clienteApi, { get, post, put, del } from './api'; // Importa instancia y helpers
import ApiConstants from '../constants/Api';
import {
    Categoria,
    Producto,
    Transaccion,
    ListaProductosResponse,
    ListaCategoriasResponse, // Asumiendo que la API podría devolver esto
    ListaTransaccionesResponse // Asumiendo que la API podría devolver esto
} from '../types'; // Importa los tipos necesarios

// --- Categorías ---

/**
 * Obtiene una lista de todas las categorías.
 * @returns Promise<Categoria[]> - Una promesa que resuelve con el array de categorías.
 */
export const obtenerCategorias = async (): Promise<Categoria[]> => {
    console.log('[InventoryService] Obteniendo categorías...');
    try {
        // Asume que el endpoint devuelve directamente un array de categorías
        // Si devuelve un objeto paginado como {count, results}, ajusta el tipo de retorno y la llamada
        // const respuesta = await get<ListaCategoriasResponse>(ApiConstants.INVENTORY_CATEGORIES_ENDPOINT);
        // return respuesta.data.results;
        const respuesta = await get<Categoria[]>(ApiConstants.INVENTORY_CATEGORIES_ENDPOINT);
        console.log(`[InventoryService] ${respuesta.data.length} categorías obtenidas.`);
        return respuesta.data;
    } catch (error) {
        console.error('[InventoryService] Error al obtener categorías:', error);
        throw error;
    }
};

/**
 * Crea una nueva categoría.
 * @param data - Datos de la nueva categoría (nombre, descripción opcional).
 * @returns Promise<Categoria> - Promesa con la categoría creada.
 */
export const crearCategoria = async (data: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> => {
    console.log('[InventoryService] Creando categoría:', data.name);
    try {
        const respuesta = await post<Categoria>(ApiConstants.INVENTORY_CATEGORIES_ENDPOINT, data);
        console.log(`[InventoryService] Categoría "${respuesta.data.name}" creada.`);
        return respuesta.data;
    } catch (error) {
        console.error('[InventoryService] Error al crear categoría:', error);
        throw error;
    }
};

// TODO: Añadir funciones para actualizar (put) y eliminar (del) categorías si es necesario.
// export const actualizarCategoria = async (id: number, data: Partial<Omit<Categoria, 'id' | 'created_at' | 'updated_at'>>): Promise<Categoria> => { ... }
// export const eliminarCategoria = async (id: number): Promise<void> => { ... }


// --- Productos ---

/**
 * Obtiene una lista de productos, opcionalmente filtrada por categoría.
 * @param categoryId - ID opcional de la categoría para filtrar.
 * @returns Promise<ListaProductosResponse> - Promesa con la respuesta paginada o estructurada de productos.
 */
export const obtenerProductos = async (categoryId?: number): Promise<ListaProductosResponse> => {
    console.log(`[InventoryService] Obteniendo productos ${categoryId ? `para categoría ${categoryId}` : ''}...`);
    try {
        const params = categoryId ? { category_id: categoryId } : {};
        // Asume que la API devuelve un objeto {count, results}
        const respuesta = await get<ListaProductosResponse>(ApiConstants.INVENTORY_PRODUCTS_ENDPOINT, params);
        console.log(`[InventoryService] ${respuesta.data.results.length} productos obtenidos (Total: ${respuesta.data.count}).`);
        // Podrías necesitar convertir fechas aquí si no vienen en formato ISO estándar
        return respuesta.data;
    } catch (error) {
        console.error('[InventoryService] Error al obtener productos:', error);
        throw error;
    }
};

/**
 * Obtiene el detalle de un producto específico por su ID.
 * @param id - ID del producto.
 * @returns Promise<Producto> - Promesa con los datos del producto.
 */
export const obtenerDetalleProducto = async (id: number): Promise<Producto> => {
    console.log(`[InventoryService] Obteniendo detalle del producto ID: ${id}`);
    try {
        const url = `${ApiConstants.INVENTORY_PRODUCTS_ENDPOINT}/${id}/`; // Ajusta si es necesario
        const respuesta = await get<Producto>(url);
        console.log(`[InventoryService] Detalle del producto "${respuesta.data.name}" obtenido.`);
        return respuesta.data;
    } catch (error) {
        console.error(`[InventoryService] Error al obtener detalle del producto ${id}:`, error);
        throw error;
    }
};


/**
 * Crea un nuevo producto.
 * @param data - Datos del nuevo producto (excluyendo campos generados por la API).
 * @returns Promise<Producto> - Promesa con el producto creado.
 */
 export const crearProducto = async (data: Omit<Producto, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Producto> => {
    console.log('[InventoryService] Creando producto:', data.name);
    try {
        const respuesta = await post<Producto>(ApiConstants.INVENTORY_PRODUCTS_ENDPOINT, data);
        console.log(`[InventoryService] Producto "${respuesta.data.name}" creado.`);
        return respuesta.data;
    } catch (error) {
        console.error('[InventoryService] Error al crear producto:', error);
        throw error;
    }
 };

// TODO: Añadir funciones para actualizar (put) y eliminar (del) productos si es necesario.
// export const actualizarProducto = async (id: number, data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>>): Promise<Product> => { ... }
// export const eliminarProducto = async (id: number): Promise<void> => { ... }


// --- Transacciones ---

/**
 * Obtiene una lista de transacciones, opcionalmente filtrada por producto.
 * @param productId - ID opcional del producto para filtrar transacciones.
 * @returns Promise<Transaccion[]> - Promesa con el array de transacciones.
 */
export const obtenerTransacciones = async (productId?: number): Promise<Transaccion[]> => {
    console.log(`[InventoryService] Obteniendo transacciones ${productId ? `para producto ${productId}` : ''}...`);
    try {
        const params = productId ? { product_id: productId } : {};
        // Asume que la API devuelve directamente un array de transacciones
        // Si devuelve un objeto paginado como {count, results}, ajusta el tipo y la llamada
        const respuesta = await get<Transaccion[]>(ApiConstants.INVENTORY_TRANSACTIONS_ENDPOINT, params);
        console.log(`[InventoryService] ${respuesta.data.length} transacciones obtenidas.`);
        // Podrías necesitar convertir fechas aquí
        return respuesta.data;
    } catch (error) {
        console.error('[InventoryService] Error al obtener transacciones:', error);
        throw error;
    }
};

/**
 * Crea una nueva transacción de inventario.
 * @param data - Datos de la nueva transacción (excluyendo campos generados por API).
 * @returns Promise<Transaccion> - Promesa con la transacción creada.
 */
export const crearTransaccion = async (data: Omit<Transaccion, 'id' | 'timestamp' | 'user_id' | 'product' | 'user'>): Promise<Transaccion> => {
    console.log('[InventoryService] Creando transacción:', data);
     try {
        const respuesta = await post<Transaccion>(ApiConstants.INVENTORY_TRANSACTIONS_ENDPOINT, data);
        console.log(`[InventoryService] Transacción creada con ID: ${respuesta.data.id}.`);
        return respuesta.data;
    } catch (error) {
        console.error('[InventoryService] Error al crear transacción:', error);
        throw error;
    }
};

// Generalmente las transacciones no se actualizan ni eliminan, pero si tu lógica lo requiere, añade las funciones aquí.

