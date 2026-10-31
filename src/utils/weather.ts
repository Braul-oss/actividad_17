/**
 * Interpretación de códigos WMO (campo `weather_code` de Open-Meteo) y
 * utilidades de formato en español.
 */

interface WeatherInfo {
  label: string;
  icon: string;
}

const WMO: Record<number, WeatherInfo> = {
  0: { label: 'Despejado', icon: '☀️' },
  1: { label: 'Mayormente despejado', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Niebla', icon: '🌫️' },
  48: { label: 'Niebla con escarcha', icon: '🌫️' },
  51: { label: 'Llovizna ligera', icon: '🌦️' },
  53: { label: 'Llovizna moderada', icon: '🌦️' },
  55: { label: 'Llovizna intensa', icon: '🌧️' },
  56: { label: 'Llovizna helada ligera', icon: '🌧️' },
  57: { label: 'Llovizna helada intensa', icon: '🌧️' },
  61: { label: 'Lluvia ligera', icon: '🌦️' },
  63: { label: 'Lluvia moderada', icon: '🌧️' },
  65: { label: 'Lluvia fuerte', icon: '🌧️' },
  66: { label: 'Lluvia helada ligera', icon: '🌧️' },
  67: { label: 'Lluvia helada fuerte', icon: '🌧️' },
  71: { label: 'Nevada ligera', icon: '🌨️' },
  73: { label: 'Nevada moderada', icon: '🌨️' },
  75: { label: 'Nevada fuerte', icon: '❄️' },
  77: { label: 'Granos de nieve', icon: '❄️' },
  80: { label: 'Chubascos ligeros', icon: '🌦️' },
  81: { label: 'Chubascos moderados', icon: '🌧️' },
  82: { label: 'Chubascos violentos', icon: '⛈️' },
  85: { label: 'Chubascos de nieve ligeros', icon: '🌨️' },
  86: { label: 'Chubascos de nieve fuertes', icon: '🌨️' },
  95: { label: 'Tormenta eléctrica', icon: '⛈️' },
  96: { label: 'Tormenta con granizo ligero', icon: '⛈️' },
  99: { label: 'Tormenta con granizo fuerte', icon: '⛈️' },
};

export function describeWeather(code: number, isDay = true): WeatherInfo {
  const info = WMO[code];
  if (!info) return { label: 'Condición desconocida', icon: '🌡️' };
  if (!isDay && code <= 1) return { label: info.label, icon: '🌙' };
  if (!isDay && code === 2) return { label: info.label, icon: '☁️' };
  return info;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "2026-10-31" → { weekday: "Hoy" | "Mañana" | "Lun", date: "31 oct" } */
export function formatDay(isoDate: string, index: number): { weekday: string; date: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return { weekday: isoDate, date: '' };
  const [, y, m, d] = match;
  const weekdayIndex = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))).getUTCDay();
  const weekday = index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : WEEKDAYS[weekdayIndex];
  return { weekday, date: `${Number(d)} ${MONTHS[Number(m) - 1]}` };
}

/** "2026-10-31T09:30" → "09:30" */
export function formatLocalTime(isoDateTime: string): string {
  const match = /T(\d{2}:\d{2})/.exec(isoDateTime);
  return match ? match[1] : isoDateTime;
}

/** Hora del dispositivo en que se obtuvieron los datos. */
export function formatClock(epochMs: number): string {
  const date = new Date(epochMs);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`;
}

export function formatPopulation(value: number | undefined): string | null {
  if (value === undefined || value <= 0) return null;
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(2)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lon = `${Math.abs(longitude).toFixed(2)}° ${longitude >= 0 ? 'E' : 'O'}`;
  return `${lat}, ${lon}`;
}
