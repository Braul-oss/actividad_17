import { parseForecastResponse } from '../src/api/forecast';
import { parseGeocodingResponse } from '../src/api/geocoding';
import { describeWeather, formatCoordinates, formatDay, formatPopulation } from '../src/utils/weather';

describe('parseGeocodingResponse', () => {
  it('devuelve [] cuando la API omite `results` (sin coincidencias)', () => {
    expect(parseGeocodingResponse({ generationtime_ms: 0.04 })).toEqual([]);
  });

  it('extrae los campos relevantes', () => {
    const [place] = parseGeocodingResponse({
      results: [
        {
          id: 3515302,
          name: 'Toluca de Lerdo',
          latitude: 19.28786,
          longitude: -99.65324,
          elevation: 2671,
          country_code: 'MX',
          timezone: 'America/Mexico_City',
          population: 489333,
          country: 'México',
          admin1: 'Estado de México',
        },
      ],
    });
    expect(place).toEqual({
      id: 3515302,
      name: 'Toluca de Lerdo',
      latitude: 19.28786,
      longitude: -99.65324,
      elevation: 2671,
      countryCode: 'MX',
      timezone: 'America/Mexico_City',
      population: 489333,
      country: 'México',
      admin1: 'Estado de México',
    });
  });

  it('descarta registros incompletos o con coordenadas imposibles', () => {
    const places = parseGeocodingResponse({
      results: [
        { id: 1, name: 'Sin coordenadas' },
        { id: 2, name: 'Fuera de rango', latitude: 120, longitude: 0 },
        null,
        { id: 3, name: 'Válida', latitude: 1, longitude: 2 },
      ],
    });
    expect(places.map((p) => p.id)).toEqual([3]);
  });

  it.each([null, 'texto', [], { results: 'x' }])('rechaza estructura inesperada %p', (body) => {
    expect(() => parseGeocodingResponse(body)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });
});

const validForecast = {
  timezone: 'America/Mexico_City',
  current: {
    time: '2026-10-31T09:30',
    temperature_2m: 16.9,
    relative_humidity_2m: 42,
    apparent_temperature: 14.9,
    is_day: 1,
    precipitation: 0,
    weather_code: 3,
    wind_speed_10m: 6.1,
  },
  daily: {
    time: ['2026-10-31', '2026-11-01'],
    weather_code: [3, 2],
    temperature_2m_max: [23.3, 22.8],
    temperature_2m_min: [9.9, 9.1],
    precipitation_probability_max: [0, null],
  },
};

describe('parseForecastResponse', () => {
  it('mapea clima actual y pronóstico diario', () => {
    const f = parseForecastResponse(validForecast, 1234);
    expect(f.current).toEqual({
      time: '2026-10-31T09:30',
      temperature: 16.9,
      apparentTemperature: 14.9,
      humidity: 42,
      precipitation: 0,
      windSpeed: 6.1,
      weatherCode: 3,
      isDay: true,
    });
    expect(f.daily).toHaveLength(2);
    expect(f.daily[1].precipitationProbability).toBeNull();
    expect(f.fetchedAt).toBe(1234);
  });

  it('rechaza respuestas sin campos obligatorios', () => {
    const broken = { ...validForecast, current: { ...validForecast.current, temperature_2m: 'caliente' } };
    expect(() => parseForecastResponse(broken)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
    expect(() => parseForecastResponse({ current: validForecast.current })).toThrow(/daily/);
  });

  it('rechaza arreglos diarios de distinta longitud', () => {
    const broken = { ...validForecast, daily: { ...validForecast.daily, temperature_2m_max: [1] } };
    expect(() => parseForecastResponse(broken)).toThrow(/temperature_2m_max/);
  });
});

describe('formato', () => {
  it('describe códigos WMO', () => {
    expect(describeWeather(0).label).toBe('Despejado');
    expect(describeWeather(0, false).icon).toBe('🌙');
    expect(describeWeather(999).label).toBe('Condición desconocida');
  });

  it('formatea días', () => {
    expect(formatDay('2026-10-31', 0)).toEqual({ weekday: 'Hoy', date: '31 oct' });
    expect(formatDay('2026-11-02', 2)).toEqual({ weekday: 'Lun', date: '2 nov' });
  });

  it('formatea población y coordenadas', () => {
    expect(formatPopulation(489333)).toBe('489,333');
    expect(formatPopulation(undefined)).toBeNull();
    expect(formatCoordinates(19.28786, -99.65324)).toBe('19.29° N, 99.65° O');
  });
});
