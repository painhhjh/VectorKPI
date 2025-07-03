// React Native/types/inventory.ts

import { Usuario } from './user'; // Asumiendo que UserRead se mapea a Usuario

// Interfaz para Categoría de Producto (refleja app/schemas/category.py -> CategoryRead)
export interface Categoria {
  id: number;
  name: string;
  description?: string | null;
  created_at: string; // Fecha ISO 8601
  updated_at?: string | null; // Fecha ISO 8601
}

// Interfaz para la solicitud de creación de un producto (refleja app/schemas/product.py -> ProductCreate)
export interface ProductCreateRequest {
  name: string;
  description?: string;
  value?: number; // Usamos 'number' para Decimal en TypeScript
  target?: number; // Nuevo campo para KPI
  unit?: string; // Nuevo campo para KPI
  price?: number; // Usamos 'number' para Decimal en TypeScript
  stock: number;
  sku?: string | null;
  category_id: number; // Requerido en ProductCreate
  owner_id: number; // Requerido en ProductCreate
}

// Interfaz para la actualización de un producto (refleja app/schemas/product.py -> ProductUpdate)
export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  sku?: string;
  category_id?: number;
  owner_id?: number;
}

// Interfaz para la estructura del producto leído (refleja app/schemas/product.py -> ProductRead)
export interface Producto {
  id: number;
  name: string;
  description?: string | null;
  price?: number; // Usamos 'number' para Decimal en TypeScript
  stock: number;
  sku?: string | null;
  category_id?: number | null; // Puede ser nulo en el modelo, pero requerido para creación. Aquí reflejamos ProductRead.
  owner_id: number; // Este campo es requerido en ProductRead
  created_at: string; // Fecha ISO 8601
  updated_at?: string | null; // Fecha ISO 8601
  category?: Categoria | null; // Relación anidada, opcional si no siempre se carga
  owner?: Usuario | null; // Relación anidada con el propietario (si ProductRead lo incluye)
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
  next?: string | null;
  previous?: string | null;
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