/**
 * Validación de parámetros de entrada. Todo lo que llega del usuario o de la
 * navegación (incluyendo enlaces profundos) se valida antes de usarse para
 * construir una solicitud a la API.
 */

export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 60;

/**
 * Letras latinas (incluye acentos y ñ), dígitos (códigos postales), espacios y
 * los signos . , ' - que aparecen en nombres de lugares ("St. John's",
 * "Saint-Denis", "Toluca, México").
 */
const SEARCH_ALLOWED = /^[A-Za-z0-9À-ÖØ-öø-ɏ .,'\-]+$/;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Normaliza y valida el texto de búsqueda de una ciudad. */
export function validateSearchQuery(raw: unknown): ValidationResult<string> {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Escribe el nombre de una ciudad.' };
  }
  const value = raw.replace(/\s+/g, ' ').trim();
  if (value.length === 0) {
    return { ok: false, error: 'Escribe el nombre de una ciudad.' };
  }
  if (value.length < SEARCH_MIN_LENGTH) {
    return { ok: false, error: `Escribe al menos ${SEARCH_MIN_LENGTH} caracteres.` };
  }
  if (value.length > SEARCH_MAX_LENGTH) {
    return { ok: false, error: `La búsqueda no puede superar ${SEARCH_MAX_LENGTH} caracteres.` };
  }
  if (!SEARCH_ALLOWED.test(value)) {
    return {
      ok: false,
      error: "Usa solo letras, números, espacios y los signos . , ' -",
    };
  }
  if (!/[A-Za-z0-9À-ɏ]/.test(value)) {
    return { ok: false, error: 'La búsqueda debe contener letras o números.' };
  }
  return { ok: true, value };
}

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

/** Convierte un parámetro de ruta (string | string[] | undefined) en número. */
export function parseCoordinate(raw: unknown): number {
  const text = Array.isArray(raw) ? raw[0] : raw;
  if (typeof text !== 'string' || !/^-?\d{1,3}(\.\d{1,8})?$/.test(text.trim())) return NaN;
  return Number(text);
}

/** Limpia un texto para mostrarse (quita caracteres de control y recorta). */
export function sanitizeLabel(raw: unknown, maxLength = 80): string {
  const text = Array.isArray(raw) ? raw[0] : raw;
  if (typeof text !== 'string') return '';
  return text.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

export interface LocationParams {
  latitude: number;
  longitude: number;
  name: string;
  region: string;
}

/** Valida los parámetros que recibe la pantalla de clima. */
export function validateLocationParams(params: {
  lat?: unknown;
  lon?: unknown;
  name?: unknown;
  region?: unknown;
}): ValidationResult<LocationParams> {
  const latitude = parseCoordinate(params.lat);
  const longitude = parseCoordinate(params.lon);
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return { ok: false, error: 'La ubicación seleccionada no es válida.' };
  }
  const name = sanitizeLabel(params.name) || 'Ubicación seleccionada';
  const region = sanitizeLabel(params.region, 120);
  return { ok: true, value: { latitude, longitude, name, region } };
}
