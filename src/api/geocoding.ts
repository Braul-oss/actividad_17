import { TtlCache } from './cache';
import { ApiError } from './errors';
import { buildUrl, getJson } from './http';
import { validateSearchQuery, isValidLatitude, isValidLongitude } from '../utils/validation';

/** Documentación oficial: https://open-meteo.com/en/docs/geocoding-api */
export const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
export const MAX_RESULTS = 10;

export interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string;
  timezone?: string;
  population?: number;
  elevation?: number;
}

const cache = new TtlCache<Place[]>(10 * 60_000); // 10 minutos

/** Busca ciudades por nombre (HTTP GET a la API de geocodificación). */
export async function searchPlaces(
  rawQuery: string,
  options: { signal?: AbortSignal } = {},
): Promise<Place[]> {
  const validation = validateSearchQuery(rawQuery);
  if (!validation.ok) throw new ApiError('validation', validation.error);
  const query = validation.value;

  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = buildUrl(GEOCODING_URL, {
    name: query,
    count: MAX_RESULTS,
    language: 'es',
    format: 'json',
  });
  const json = await getJson(url, { signal: options.signal });
  const places = parseGeocodingResponse(json);
  cache.set(cacheKey, places);
  return places;
}

/**
 * Valida la estructura del JSON y extrae solo los campos que usa la app.
 * Cuando no hay coincidencias, la API omite la propiedad `results`.
 */
export function parseGeocodingResponse(json: unknown): Place[] {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    throw new ApiError('invalid_response', 'Se esperaba un objeto JSON');
  }
  const results = (json as { results?: unknown }).results;
  if (results === undefined) return [];
  if (!Array.isArray(results)) {
    throw new ApiError('invalid_response', '`results` no es un arreglo');
  }

  const places: Place[] = [];
  for (const item of results) {
    const place = toPlace(item);
    if (place) places.push(place);
  }
  return places;
}

function toPlace(item: unknown): Place | null {
  if (typeof item !== 'object' || item === null) return null;
  const r = item as Record<string, unknown>;
  if (
    typeof r.id !== 'number' ||
    typeof r.name !== 'string' ||
    typeof r.latitude !== 'number' ||
    typeof r.longitude !== 'number' ||
    !isValidLatitude(r.latitude) ||
    !isValidLongitude(r.longitude)
  ) {
    return null; // Se descartan registros incompletos en lugar de fallar.
  }
  return {
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: typeof r.country === 'string' ? r.country : '',
    countryCode: typeof r.country_code === 'string' ? r.country_code : '',
    admin1: typeof r.admin1 === 'string' ? r.admin1 : undefined,
    timezone: typeof r.timezone === 'string' ? r.timezone : undefined,
    population: typeof r.population === 'number' ? r.population : undefined,
    elevation: typeof r.elevation === 'number' ? r.elevation : undefined,
  };
}

/** Solo para pruebas. */
export function clearGeocodingCache(): void {
  cache.clear();
}
