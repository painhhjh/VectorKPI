/**
 * @file Servicio para interactuar con los endpoints de la API relacionados con los KPIs.
 * @description Define funciones para obtener, crear, actualizar y eliminar KPIs.
 */
import clienteApi, { get, post, put, del } from './api'; // Importa la instancia y helpers
import ApiConstants from '../constants/Api';
import { KPI, KpiListResponse, KpiFilters } from '../types'; // Importa los tipos necesarios

/**
 * Obtiene una lista de KPIs desde la API, opcionalmente con filtros.
 * @param filtros - Objeto opcional con los filtros a aplicar (ej. categoría, rango de fechas).
 * @returns Promise<KpiListResponse> - Una promesa que resuelve con la respuesta paginada de la API.
 */
export const obtenerKpis = async (filtros?: KpiFilters): Promise<KpiListResponse> => {
  console.log('[KpiService] Obteniendo lista de KPIs con filtros:', filtros);
  try {
    // Construye los parámetros de consulta a partir de los filtros
    const params: Record<string, any> = {};
    if (filtros?.category) params.category = filtros.category;
    if (filtros?.trend) params.trend = filtros.trend;
    if (filtros?.dateRange) {
      params.start_date = filtros.dateRange.start;
      params.end_date = filtros.dateRange.end;
    }
    // Añade aquí otros filtros que necesites

    // Realiza la petición GET usando el helper 'get'
    const respuesta = await get<KpiListResponse>(ApiConstants.KPI_ENDPOINT, params);

    console.log(`[KpiService] ${respuesta.data.results.length} KPIs obtenidos.`);
    // Asegurarse que los datos tengan el formato correcto, especialmente las fechas
    const kpisConFechas = respuesta.data.results.map(kpi => ({
        ...kpi,
        lastUpdated: kpi.lastUpdated ? new Date(kpi.lastUpdated).toISOString() : new Date().toISOString(), // Asegura formato ISO
    }));

    return { ...respuesta.data, results: kpisConFechas }; // Devuelve los datos de la respuesta

  } catch (error: any) {
    console.error('[KpiService] Error al obtener KPIs:', error);
    // Relanza el error para que el componente que llama pueda manejarlo
    throw error;
  }
};

/**
 * Obtiene los detalles de un KPI específico por su ID.
 * @param id - El ID único del KPI a obtener.
 * @returns Promise<KPI> - Una promesa que resuelve con los datos del KPI.
 */
export const obtenerDetalleKpi = async (id: string): Promise<KPI> => {
  console.log(`[KpiService] Obteniendo detalle del KPI con ID: ${id}`);
  if (!id) {
    console.error('[KpiService] ID de KPI no proporcionado.');
    throw new Error('Se requiere un ID para obtener el detalle del KPI.');
  }
  try {
    // Construye la URL para el endpoint específico del KPI
    // Asegúrate que la URL sea correcta según tu API (puede necesitar o no el '/' al final)
    const url = `${ApiConstants.KPI_ENDPOINT}/${id}/`;

    // Realiza la petición GET
    const respuesta = await get<KPI>(url);

    console.log(`[KpiService] Detalle del KPI "${respuesta.data.name}" obtenido.`);
     // Asegurarse que los datos tengan el formato correcto
     const kpiDetalle = {
         ...respuesta.data,
         lastUpdated: respuesta.data.lastUpdated ? new Date(respuesta.data.lastUpdated).toISOString() : new Date().toISOString(),
     };
    return kpiDetalle; // Devuelve los datos del KPI específico

  } catch (error: any) {
    console.error(`[KpiService] Error al obtener detalle del KPI ${id}:`, error);
    // Relanza el error
    throw error;
  }
};

/**
 * Crea un nuevo KPI en la API.
 * @param nuevoKpiData - Objeto con los datos del nuevo KPI (sin id, lastUpdated, trend).
 * Ajusta los campos requeridos según tu API.
 * @returns Promise<KPI> - Una promesa que resuelve con los datos del KPI recién creado.
 */
export const crearKpi = async (
    nuevoKpiData: Omit<KPI, 'id' | 'lastUpdated' | 'trend'>
): Promise<KPI> => {
  console.log('[KpiService] Creando nuevo KPI:', nuevoKpiData);
  try {
    // Realiza la petición POST al endpoint principal de KPIs
    const respuesta = await post<KPI>(ApiConstants.KPI_ENDPOINT, nuevoKpiData);

    console.log(`[KpiService] KPI "${respuesta.data.name}" creado con ID: ${respuesta.data.id}`);
    // Asegurarse que los datos tengan el formato correcto
    const kpiCreado = {
        ...respuesta.data,
        lastUpdated: respuesta.data.lastUpdated ? new Date(respuesta.data.lastUpdated).toISOString() : new Date().toISOString(),
    };
    return kpiCreado; // Devuelve el KPI creado por la API (con id, etc.)

  } catch (error: any) {
    console.error('[KpiService] Error al crear KPI:', error);
    // Relanza el error
    throw error;
  }
};

/**
 * Actualiza un KPI existente en la API.
 * @param id - El ID del KPI a actualizar.
 * @param kpiData - Objeto con los campos del KPI a actualizar.
 * @returns Promise<KPI> - Una promesa que resuelve con los datos del KPI actualizado.
 */
export const actualizarKpi = async (
    id: string,
    kpiData: Partial<Omit<KPI, 'id' | 'lastUpdated'>> // Permite actualizar campos parciales
): Promise<KPI> => {
  console.log(`[KpiService] Actualizando KPI con ID: ${id}`, kpiData);
  if (!id) {
    console.error('[KpiService] ID de KPI no proporcionado para actualizar.');
    throw new Error('Se requiere un ID para actualizar el KPI.');
  }
  try {
    // Construye la URL para el endpoint específico del KPI
    const url = `${ApiConstants.KPI_ENDPOINT}/${id}/`; // Ajusta si es necesario

    // Realiza la petición PUT (o PATCH si tu API lo soporta)
    const respuesta = await put<KPI>(url, kpiData);

    console.log(`[KpiService] KPI "${respuesta.data.name}" actualizado.`);
     // Asegurarse que los datos tengan el formato correcto
     const kpiActualizado = {
         ...respuesta.data,
         lastUpdated: respuesta.data.lastUpdated ? new Date(respuesta.data.lastUpdated).toISOString() : new Date().toISOString(),
     };
    return kpiActualizado; // Devuelve el KPI actualizado

  } catch (error: any) {
    console.error(`[KpiService] Error al actualizar KPI ${id}:`, error);
    // Relanza el error
    throw error;
  }
};

/**
 * Elimina un KPI de la API por su ID.
 * @param id - El ID del KPI a eliminar.
 * @returns Promise<void> - Una promesa que resuelve cuando la eliminación es exitosa.
 */
export const eliminarKpi = async (id: string): Promise<void> => {
  console.log(`[KpiService] Eliminando KPI con ID: ${id}`);
  if (!id) {
    console.error('[KpiService] ID de KPI no proporcionado para eliminar.');
    throw new Error('Se requiere un ID para eliminar el KPI.');
  }
  try {
    // Construye la URL para el endpoint específico del KPI
    const url = `${ApiConstants.KPI_ENDPOINT}/${id}/`; // Ajusta si es necesario

    // Realiza la petición DELETE
    await del(url); // Axios por defecto no devuelve datos en delete exitoso (status 204)

    console.log(`[KpiService] KPI con ID: ${id} eliminado exitosamente.`);
    // No se devuelve nada en caso de éxito

  } catch (error: any) {
    console.error(`[KpiService] Error al eliminar KPI ${id}:`, error);
    // Relanza el error
    throw error;
  }
};
