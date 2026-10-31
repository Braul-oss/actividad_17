/**
 * Pruebas de integración contra la API REAL de Open-Meteo (requieren internet).
 * Ejecutar con: npm run test:integration
 */
import { getForecast, FORECAST_DAYS } from '../src/api/forecast';
import { getJson } from '../src/api/http';
import { searchPlaces } from '../src/api/geocoding';

jest.setTimeout(30_000);

describe('Open-Meteo Geocoding API (en vivo)', () => {
  it('encuentra Toluca con los campos esperados', async () => {
    const places = await searchPlaces('Toluca');
    expect(places.length).toBeGreaterThan(0);
    const toluca = places.find((p) => p.countryCode === 'MX' && p.admin1 === 'Estado de México');
    expect(toluca).toBeDefined();
    expect(toluca!.latitude).toBeCloseTo(19.29, 1);
    expect(toluca!.longitude).toBeCloseTo(-99.65, 1);
    expect(toluca!.country).toBe('México'); // language=es
  });

  it('maneja búsquedas con acentos y espacios', async () => {
    const places = await searchPlaces('Ciudad de México');
    expect(places.some((p) => p.countryCode === 'MX')).toBe(true);
  });

  it('devuelve lista vacía cuando no hay coincidencias', async () => {
    await expect(searchPlaces('Zzqqxxlugarinexistente')).resolves.toEqual([]);
  });

  it('rechaza una búsqueda inválida sin llamar a la API', async () => {
    await expect(searchPlaces('<script>')).rejects.toMatchObject({ kind: 'validation' });
  });
});

describe('Open-Meteo Forecast API (en vivo)', () => {
  it('obtiene clima actual y pronóstico de 7 días', async () => {
    const forecast = await getForecast(19.28786, -99.65324, { forceRefresh: true });
    expect(forecast.timezone).toBe('America/Mexico_City');
    expect(typeof forecast.current.temperature).toBe('number');
    expect(forecast.current.humidity).toBeGreaterThanOrEqual(0);
    expect(forecast.current.humidity).toBeLessThanOrEqual(100);
    expect(forecast.current.time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(forecast.daily).toHaveLength(FORECAST_DAYS);
    for (const day of forecast.daily) {
      expect(day.maxTemperature).toBeGreaterThanOrEqual(day.minTemperature);
    }
  });

  it('la API responde HTTP 400 ante coordenadas imposibles y se traduce a bad_request', async () => {
    await expect(
      getJson('https://api.open-meteo.com/v1/forecast?latitude=999&longitude=0&current=temperature_2m'),
    ).rejects.toMatchObject({ kind: 'bad_request', status: 400 });
  });

  it('la app no envía coordenadas inválidas a la API', async () => {
    await expect(getForecast(999, 0)).rejects.toMatchObject({ kind: 'validation' });
  });
});
