/**
 * @file Define las interfaces TypeScript para las entidades del módulo de inventario.
 */
import { Usuario } from './user'; // Asumiendo que UserRead se mapea a Usuario

// Interfaz para Categoría de Producto
export interface Categoria {
  id: number;
  name: string;
  description?: string | null;
  created_at: string; // Fecha ISO 8601
  updated_at?: string | null; // Fecha ISO 8601
}

// Interfaz para Producto
export interface Producto {
  id: number;
  name: string;
  description?: string | null;
  price?: number | string; // FastAPI Numeric/Decimal puede ser string o number en JSON
  stock: number;
  sku?: string | null;
  category_id?: number | null;
  created_at: string; // Fecha ISO 8601
  updated_at?: string | null; // Fecha ISO 8601
  category?: Categoria | null; // Objeto categoría anidado (opcional, según la respuesta API)
}

// Tipos permitidos para las transacciones
export type TipoTransaccion = "IN" | "OUT" | "ADJUSTMENT";

// Interfaz para Transacción de Inventario
export interface Transaccion {
  id: number;
  product_id: number;
  quantity: number;
  type: TipoTransaccion;
  reason?: string | null;
  timestamp: string; // Fecha ISO 8601
  user_id?: number | null; // Asumiendo que el ID del usuario es numérico
  product?: Producto | null; // Objeto producto anidado (opcional)
  user?: Usuario | null; // Objeto usuario anidado (opcional)
}

// Interfaz para la respuesta de lista de productos (si la API pagina o estructura así)
export interface ListaProductosResponse {
    count: number; // Total de productos que coinciden con los filtros
    results: Producto[]; // Array de productos en la página actual
    // Podrías añadir 'next' y 'previous' si tu API los devuelve
    // next?: string | null;
    // previous?: string | null;
}

// Interfaz para la respuesta de lista de categorías (si es necesario)
export interface ListaCategoriasResponse {
    count: number;
    results: Categoria[];
}

// Interfaz para la respuesta de lista de transacciones (si es necesario)
export interface ListaTransaccionesResponse {
    count: number;
    results: Transaccion[];
}