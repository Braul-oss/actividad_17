import { TtlCache } from './cache';
import { ApiError } from './errors';
import { buildUrl, getJson } from './http';
import { isValidLatitude, isValidLongitude } from '../utils/validation';

/** Documentación oficial: https://open-meteo.com/en/docs */
export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const FORECAST_DAYS = 7;

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
] as const;

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
] as const;

export interface CurrentWeather {
  /** Hora local de la medición, formato ISO "YYYY-MM-DDTHH:mm". */
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  weatherCode: number;
  maxTemperature: number;
  minTemperature: number;
  precipitationProbability: number | null;
}

export interface Forecast {
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecast[];
  /** Momento (epoch ms) en que la app obtuvo los datos. */
  fetchedAt: number;
}

const cache = new TtlCache<Forecast>(5 * 60_000); // 5 minutos

/**
 * Obtiene el clima actual y el pronóstico de 7 días (HTTP GET).
 * `forceRefresh` ignora la caché (botón "Actualizar" / deslizar hacia abajo).
 */
export async function getForecast(
  latitude: number,
  longitude: number,
  options: { signal?: AbortSignal; forceRefresh?: boolean } = {},
): Promise<Forecast> {
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    throw new ApiError('validation', 'Las coordenadas de la ubicación no son válidas.');
  }

  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (!options.forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }

  const url = buildUrl(FORECAST_URL, {
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: CURRENT_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    timezone: 'auto',
    forecast_days: FORECAST_DAYS,
  });
  const json = await getJson(url, { signal: options.signal });
  const forecast = parseForecastResponse(json);
  cache.set(cacheKey, forecast);
  return forecast;
}

export function parseForecastResponse(json: unknown, now: number = Date.now()): Forecast {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    throw new ApiError('invalid_response', 'Se esperaba un objeto JSON');
  }
  const body = json as Record<string, unknown>;
  const current = body.current as Record<string, unknown> | undefined;
  const daily = body.daily as Record<string, unknown> | undefined;

  if (typeof current !== 'object' || current === null) {
    throw new ApiError('invalid_response', 'Falta el bloque `current`');
  }
  for (const field of CURRENT_FIELDS) {
    if (typeof current[field] !== 'number') {
      throw new ApiError('invalid_response', `Campo current.${field} inválido`);
    }
  }
  if (typeof current.time !== 'string') {
    throw new ApiError('invalid_response', 'Campo current.time inválido');
  }

  if (typeof daily !== 'object' || daily === null || !Array.isArray(daily.time)) {
    throw new ApiError('invalid_response', 'Falta el bloque `daily`');
  }
  const days = daily.time as unknown[];
  for (const field of DAILY_FIELDS) {
    const values = daily[field];
    if (!Array.isArray(values) || values.length !== days.length) {
      throw new ApiError('invalid_response', `Campo daily.${field} inválido`);
    }
  }

  const dailyItems: DailyForecast[] = [];
  days.forEach((date, i) => {
    const code = (daily.weather_code as unknown[])[i];
    const max = (daily.temperature_2m_max as unknown[])[i];
    const min = (daily.temperature_2m_min as unknown[])[i];
    const prob = (daily.precipitation_probability_max as unknown[])[i];
    // La API puede devolver null en días sin datos; esos días se omiten.
    if (typeof date !== 'string' || typeof code !== 'number' || typeof max !== 'number' || typeof min !== 'number') {
      return;
    }
    dailyItems.push({
      date,
      weatherCode: code,
      maxTemperature: max,
      minTemperature: min,
      precipitationProbability: typeof prob === 'number' ? prob : null,
    });
  });

  return {
    timezone: typeof body.timezone === 'string' ? body.timezone : 'GMT',
    current: {
      time: current.time,
      temperature: current.temperature_2m as number,
      apparentTemperature: current.apparent_temperature as number,
      humidity: current.relative_humidity_2m as number,
      precipitation: current.precipitation as number,
      windSpeed: current.wind_speed_10m as number,
      weatherCode: current.weather_code as number,
      isDay: current.is_day === 1,
    },
    daily: dailyItems,
    fetchedAt: now,
  };
}

/** Solo para pruebas. */
export function clearForecastCache(): void {
  cache.clear();
}
