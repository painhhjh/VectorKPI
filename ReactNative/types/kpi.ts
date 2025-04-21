//Define interfaces de TypeScript relacionadas con Indicadores Clave de Rendimiento (KPIs).

// Define las posibles direcciones de tendencia para un KPI
export type KpiTrend = 'up' | 'down' | 'stable';

// Define las posibles categorías para KPIs en el contexto de la industria petrolera
export type KpiCategory = 'perforación' | 'producción' | 'logística' | 'seguridad';

// Interfaz que representa un solo punto de datos de un KPI
export interface KPI {
  id: string; // Identificador único para el KPI
  name: string; // Nombre de visualización del KPI (por ejemplo, "Eficiencia de Perforación")
  description?: string; // Descripción más larga opcional
  value: number; // El valor actual del KPI
  target?: number; // El valor objetivo para el KPI (opcional)
  unit: string; // La unidad de medición (por ejemplo, "%", "bbl/día", "USD/bbl", "días")
  trend: KpiTrend; // La tendencia reciente del valor del KPI
  category: KpiCategory; // Categoría a la que pertenece el KPI
  lastUpdated: string; // Cadena de fecha ISO 8601 de la última actualización
  // Agregar campos para datos históricos si se necesitan para gráficos directamente en este objeto
}

// Interfaz para la estructura de la respuesta de la API al obtener una lista de KPIs
export interface KpiListResponse {
  count: number;
  next?: string | null; // URL para la siguiente página de resultados, si está paginada
  previous?: string | null; // URL para la página anterior de resultados, si está paginada
  results: KPI[];
}

// Interfaz para opciones de filtro potenciales al obtener KPIs
export interface KpiFilters {
  category?: KpiCategory;
  trend?: KpiTrend;
  dateRange?: { start: string; end: string };
  // Agrega otros filtros potenciales
  sortBy?: 'name' | 'value' | 'trend'; // Ordenar por nombre, valor o tendencia
  orderBy?: 'asc' | 'desc'; // Orden ascendente o descendente
}

// Interfaz para opciones de paginación al obtener KPIs
export interface KpiPaginationOptions {
  limit: number; // Número máximo de resultados por página
  offset: number; // Desplazamiento para la paginación
}

// Interfaz para la estructura de la solicitud de creación de un nuevo KPI
export interface CreateKpiRequest {
  name: string;
  description?: string;
  value: number;
  target?: number;
  unit: string;
  category: KpiCategory;
}

// Interfaz para la estructura de la solicitud de actualización de un KPI existente
export interface UpdateKpiRequest {
  id: string;
  name?: string;
  description?: string;
  value?: number;
  target?: number;
  unit?: string;
  category?: KpiCategory;
}
