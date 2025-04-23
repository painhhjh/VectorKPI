// Servicio para gestión de KPIs usando helpers API
import { get, post, put, del } from './api';
import ApiConstants from '../constants/Api';
import { KPI, KpiListResponse, KpiFilters } from '../types';

// Obtiene KPIs con filtros y paginación
export const obtenerKpis = async (filtros?: KpiFilters): Promise<KpiListResponse> => {
  try {
    const params = construirParams(filtros);
    const { data } = await get<KpiListResponse>(ApiConstants.KPI_ENDPOINT, params);
    return { ...data, results: normalizarKpis(data.results) };
  } catch (error) {
    console.error('[KpiService] Error obteniendo KPIs:', error);
    throw error;
  }
};

// Obtiene detalles de un KPI por ID
export const obtenerDetalleKpi = async (id: string): Promise<KPI> => {
  try {
    const url = `${ApiConstants.KPI_ENDPOINT}/${id}`;
    const { data } = await get<KPI>(url);
    return normalizarKpi(data);
  } catch (error) {
    console.error(`[KpiService] Error obteniendo KPI ${id}:`, error);
    throw error;
  }
};

// Crea nuevo KPI
export const crearKpi = async (nuevoKpi: Omit<KPI, 'id' | 'fechas'>): Promise<KPI> => {
  try {
    const { data } = await post<KPI>(ApiConstants.KPI_ENDPOINT, nuevoKpi);
    return normalizarKpi(data);
  } catch (error) {
    console.error('[KpiService] Error creando KPI:', error);
    throw error;
  }
};

// Actualiza KPI existente
export const actualizarKpi = async (id: string, cambios: Partial<KPI>): Promise<KPI> => {
  try {
    const url = `${ApiConstants.KPI_ENDPOINT}/${id}`;
    const { data } = await put<KPI>(url, cambios);
    return normalizarKpi(data);
  } catch (error) {
    console.error(`[KpiService] Error actualizando KPI ${id}:`, error);
    throw error;
  }
};

// Elimina KPI por ID
export const eliminarKpi = async (id: string): Promise<void> => {
  try {
    const url = `${ApiConstants.KPI_ENDPOINT}/${id}`;
    await del(url);
  } catch (error) {
    console.error(`[KpiService] Error eliminando KPI ${id}:`, error);
    throw error;
  }
};

// Helpers internos
const construirParams = (filtros?: KpiFilters): Record<string, any> => ({
  ...(filtros?.category && { category: filtros.category }),
  ...(filtros?.trend && { trend: filtros.trend }),
  ...(filtros?.dateRange && { 
    start_date: filtros.dateRange.start,
    end_date: filtros.dateRange.end
  })
});

const normalizarKpis = (kpis: KPI[]): KPI[] => kpis.map(normalizarKpi);
const normalizarKpi = (kpi: KPI): KPI => ({
  ...kpi,
  lastUpdated: kpi.lastUpdated ? new Date(kpi.lastUpdated).toISOString() : '',
  createdAt: kpi.createdAt ? new Date(kpi.createdAt).toISOString() : ''
});