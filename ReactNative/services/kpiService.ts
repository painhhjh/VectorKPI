// Servicio para gestión de KPIs usando helpers API
import { get, post, put, del } from './api';
import ApiConstants, { getKpiUrl } from '../constants/Api';
import { KPI, KpiListResponse, KpiFilters, KpiTrend } from '../types';


export const obtenerKpisDebug = async () => {
  const response = await fetch(`${ApiConstants.BASE_URL}/${ApiConstants.KPIS}`);
  const raw = await response.json();
  console.log('RAW API RESPONSE:', raw);
  return raw;
};


// Obtener lista de KPIs
export const obtenerKpis = async (
  filtros?: KpiFilters,
  pagina: number = 1,
  porPagina: number = 10
): Promise<KpiListResponse> => {
  try {


    const params = construirQueryParams(filtros, pagina, porPagina);
    const { data } = await get<KpiListResponse>(ApiConstants.KPIS);
  
    return normalizarRespuestaKpis(data);



  } catch (error) {
    throw new Error(`Error al obtener KPIs: ${(error as Error).message}`);
  }
};

// Obtiene detalles de un KPI por ID
export const obtenerDetalleKpi = async (id: number): Promise<KPI> => {
  try {
    const url = getKpiUrl(id);
    const { data } = await get<KPI>(url);
    return normalizarKpi(data);
  } catch (error) {
    throw new Error(`Error al obtener KPI #${id}: ${(error as Error).message}`);
  }
};

// Crear nuevo KPI ===============================================================================
export const crearKpi = async (nuevoKpi: Omit<KPI, 'id'>): Promise<KPI> => {
  try {
    const { data } = await post<KPI>(ApiConstants.KPIS, nuevoKpi);
    return normalizarKpi(data);
  } catch (error) {
    throw new Error(`Error al crear KPI: ${(error as Error).message}`);
  }
};

// Actualizar KPI existente =====================================================================
// (VERSION VIEJA DONDE ES UN PUT EN VEZ DE UN POST, NECESITAMOS QUE SEA UN POST)
// export const actualizarKpi = async (id: number, cambios: Partial<KPI>): Promise<KPI> => {
//   try {
//     const url = getKpiUrl(id);
//     const { data } = await put<KPI>(url, cambios);
//     return normalizarKpi(data);
//   } catch (error) {
//     throw new Error(`Error al actualizar KPI #${id}: ${(error as Error).message}`);
//   }
// };

export const actualizarKpiVersion = async (kpiOriginal: KPI, nuevosValores: {
  value: number;
  unit?: string;
  trend?: KpiTrend;
  description?: string;
}): Promise<KPI> => {
  try {
    const { data } = await post<KPI>(ApiConstants.KPIS, {
      // Preserve these from original
      name: kpiOriginal.name,
      category: kpiOriginal.category,
      created_at: kpiOriginal.created_at, // Keep original creation date
      
      // Update these values
      value: nuevosValores.value,
      unit: nuevosValores.unit || kpiOriginal.unit,
      trend: nuevosValores.trend || kpiOriginal.trend,
      description: nuevosValores.description || kpiOriginal.description,
      
      // System-generated
      last_updated: new Date().toISOString(),
      target: kpiOriginal.target,
      progreso: undefined // Will be recalculated
    });
        
    return normalizarKpi(data);
  } catch (error) {
    throw new Error(`Error al crear nueva versión del KPI: ${(error as Error).message}`);
  }
};

// Eliminar KPI ==================================================================================
export const eliminarKpi = async (id: number): Promise<void> => {
  try {
    const url = getKpiUrl(id);
    await del(url);
  } catch (error) {
    throw new Error(`Error al eliminar KPI #${id}: ${(error as Error).message}`);
  }
};

// Helpers =======================================================================================
const construirQueryParams = (
  filtros?: KpiFilters,
  pagina: number = 1,
  porPagina: number = 10
): Record<string, any> => {
  const params: Record<string, any> = {
    // Paginación
    skip: (pagina - 1) * porPagina,
    limit: porPagina,
  };

  // Filtros opcionales
  if (filtros) {
    if (filtros.category) {
      params.category = filtros.category;
    }
    if (filtros.trend) {
      params.trend = filtros.trend;
    }
    if (filtros.dateRange) {
      const { start, end } = filtros.dateRange;
      if (start) {
        params.start_date = start;
      }
      if (end) {
        params.end_date = end;
      }
    }
    if (filtros.sortBy) {
      params.sort_by = filtros.sortBy;
    }
    if (filtros.orderBy) {
      params.order_by = filtros.orderBy;
    }
  }

  return params;
};

const normalizarRespuestaKpis = (respuesta: KpiListResponse): KpiListResponse => ({
  count: respuesta.count,
  results: respuesta.results.map(normalizarKpi)
});

export const normalizarKpi = (kpi: KPI): KPI => ({
  ...kpi,
  last_updated: kpi.last_updated ? new Date(kpi.last_updated).toISOString() : new Date().toISOString(),
  created_at: kpi.created_at ? new Date(kpi.created_at).toISOString() : new Date().toISOString(),
  // Normalizar valores numéricos
  value: Number(kpi.value) || 0,
  target: kpi.target !== undefined ? Number(kpi.target) : undefined,
  progreso: calcularProgreso(kpi.value, kpi.target || 0)
});

const calcularProgreso = (actual: number, objetivo: number): number => {
  if (objetivo <= 0) return 0;
  return Math.min(Math.round((actual / objetivo) * 100), 100);
};