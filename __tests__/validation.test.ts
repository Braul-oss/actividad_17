import {
  parseCoordinate,
  sanitizeLabel,
  validateLocationParams,
  validateSearchQuery,
} from '../src/utils/validation';

describe('validateSearchQuery', () => {
  it.each(['Toluca', 'Ciudad de México', "St. John's", 'Saint-Denis', 'Toluca, México', '50000', 'Ñuñoa'])(
    'acepta "%s"',
    (text) => {
      expect(validateSearchQuery(text)).toEqual({ ok: true, value: text });
    },
  );

  it('normaliza espacios', () => {
    expect(validateSearchQuery('   Nueva    York  ')).toEqual({ ok: true, value: 'Nueva York' });
  });

  it.each([
    ['', 'Escribe el nombre de una ciudad.'],
    ['   ', 'Escribe el nombre de una ciudad.'],
    ['a', 'Escribe al menos 2 caracteres.'],
    ['x'.repeat(61), 'La búsqueda no puede superar 60 caracteres.'],
  ])('rechaza "%s"', (text, error) => {
    expect(validateSearchQuery(text)).toEqual({ ok: false, error });
  });

  it.each(['<script>', 'Toluca; DROP TABLE', 'a&count=100', '../../etc', 'Mexico%00', '😀😀'])(
    'rechaza caracteres no permitidos en "%s"',
    (text) => {
      const result = validateSearchQuery(text);
      expect(result.ok).toBe(false);
    },
  );

  it('rechaza texto solo con signos', () => {
    expect(validateSearchQuery("-.-'").ok).toBe(false);
  });

  it('rechaza valores que no son texto', () => {
    expect(validateSearchQuery(undefined).ok).toBe(false);
    expect(validateSearchQuery(42).ok).toBe(false);
  });
});

describe('validateLocationParams', () => {
  it('acepta coordenadas válidas', () => {
    expect(validateLocationParams({ lat: '19.28786', lon: '-99.65324', name: 'Toluca', region: 'México' })).toEqual({
      ok: true,
      value: { latitude: 19.28786, longitude: -99.65324, name: 'Toluca', region: 'México' },
    });
  });

  it.each([
    ['91', '0'],
    ['-90.5', '0'],
    ['0', '180.1'],
    ['abc', '0'],
    ['', ''],
    [undefined, undefined],
    ['1e2', '0'],
    ['19.2;alert(1)', '0'],
  ])('rechaza lat=%s lon=%s', (lat, lon) => {
    expect(validateLocationParams({ lat, lon }).ok).toBe(false);
  });

  it('usa un nombre por defecto y limpia caracteres de control', () => {
    const result = validateLocationParams({ lat: '0', lon: '0', name: '\u0000\u0007' });
    expect(result.ok && result.value.name).toBe('Ubicación seleccionada');
  });
});

describe('utilidades', () => {
  it('parseCoordinate toma el primer elemento de un arreglo', () => {
    expect(parseCoordinate(['10.5', '20'])).toBe(10.5);
  });

  it('sanitizeLabel recorta la longitud', () => {
    expect(sanitizeLabel('x'.repeat(200), 10)).toHaveLength(10);
  });
});
