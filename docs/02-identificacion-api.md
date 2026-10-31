# 2. Identificación y documentación de la API

## 2.1 Ficha de la API

| Concepto | Detalle |
|----------|---------|
| Nombre | **Open-Meteo** (Weather Forecast API + Geocoding API) |
| Proveedor | Open-Meteo.com (proyecto de código abierto, Patrick Zippenfenig) |
| Tipo | API REST pública, respuestas JSON |
| Protocolo | HTTPS (TLS) |
| Método usado | `GET` |
| Autenticación | **Ninguna** para uso no comercial (no se requiere clave) |
| Documentación oficial | Pronóstico: https://open-meteo.com/en/docs · Geocodificación: https://open-meteo.com/en/docs/geocoding-api |
| Términos de uso | https://open-meteo.com/en/terms |
| Licencia de los datos | **CC BY 4.0** — https://open-meteo.com/en/licence |
| Fuentes de datos | Modelos de servicios meteorológicos nacionales (DWD, NOAA, ECMWF, Météo-France, etc.); ciudades de la base **GeoNames** |
| Costo | Gratuita para uso no comercial |

## 2.2 Condiciones de uso y límites (plan gratuito)

| Límite | Valor |
|--------|-------|
| Por minuto | 600 llamadas |
| Por hora | 5 000 llamadas |
| Por día | 10 000 llamadas |
| Por mes | 300 000 llamadas |
| Uso permitido | Solo **no comercial** (proyectos personales, educativos, de investigación) |
| Al exceder límites | Los límites se aplican por IP. Open-Meteo puede bloquear aplicaciones o IP que abusen del servicio |

**Atribución obligatoria (CC BY 4.0):** se debe dar crédito a Open-Meteo, enlazar la licencia y colocar un enlace junto a los datos mostrados (texto sugerido: *"Weather data by Open-Meteo.com"*).
➡️ ClimaYa muestra en ambas pantallas: *"Datos meteorológicos por **Open-Meteo.com** · **CC BY 4.0**"* (pantalla de clima) y *"Búsqueda de ciudades por **Open-Meteo.com** (base GeoNames) · **CC BY 4.0**"* (pantalla de búsqueda), con enlaces a ambos sitios.

**Uso en este proyecto:** es académico y no comercial, así que cumple las condiciones del plan gratuito.

## 2.3 Endpoint 1 — Búsqueda de ciudades (Geocoding)

```
GET https://geocoding-api.open-meteo.com/v1/search
```

| Parámetro | Tipo | Obligatorio | Valor usado | Descripción |
|-----------|------|-------------|-------------|-------------|
| `name` | string | Sí | Texto validado del usuario | Nombre de la ciudad o código postal. Con 2 caracteres busca coincidencia exacta y con 3 o más busca por prefijo |
| `count` | entero | No | `10` | Número de resultados (1–100) |
| `language` | string | No | `es` | Idioma de los nombres de país y región |
| `format` | string | No | `json` | Formato de respuesta |

**Ejemplo de solicitud:**
```
https://geocoding-api.open-meteo.com/v1/search?name=Toluca&count=10&language=es&format=json
```

**Ejemplo de respuesta (resumida, obtenida en vivo):**
```json
{
  "results": [
    {
      "id": 3515302,
      "name": "Toluca de Lerdo",
      "latitude": 19.28786,
      "longitude": -99.65324,
      "elevation": 2671.0,
      "country_code": "MX",
      "timezone": "America/Mexico_City",
      "population": 489333,
      "country": "México",
      "admin1": "Estado de México"
    }
  ],
  "generationtime_ms": 0.288
}
```

> ⚠️ **Particularidad:** si no hay coincidencias, la API **omite** la propiedad `results` (responde `{"generationtime_ms": 0.04}`) en lugar de enviar un arreglo vacío. La app lo trata como "sin resultados".

**Campos que muestra la app por resultado:** `name`, `admin1` (estado), `country`, `country_code` (bandera), `latitude`/`longitude`, `elevation` y `population`.

## 2.4 Endpoint 2 — Clima actual y pronóstico (Forecast)

```
GET https://api.open-meteo.com/v1/forecast
```

| Parámetro | Valor usado | Descripción |
|-----------|-------------|-------------|
| `latitude` | p. ej. `19.2879` | Latitud (−90 a 90) |
| `longitude` | p. ej. `-99.6532` | Longitud (−180 a 180) |
| `current` | `temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m` | Variables del clima actual |
| `daily` | `weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` | Variables diarias |
| `timezone` | `auto` | Horas en la zona horaria local de la ubicación |
| `forecast_days` | `7` | Días de pronóstico |

**Ejemplo de respuesta (resumida, obtenida en vivo):**
```json
{
  "timezone": "America/Mexico_City",
  "current": {
    "time": "2026-10-31T09:30",
    "temperature_2m": 16.9,
    "relative_humidity_2m": 42,
    "apparent_temperature": 14.9,
    "is_day": 1,
    "precipitation": 0.0,
    "weather_code": 3,
    "wind_speed_10m": 6.1
  },
  "daily": {
    "time": ["2026-10-31", "2026-11-01", "2026-11-02"],
    "weather_code": [3, 2, 1],
    "temperature_2m_max": [23.3, 22.8, 23.1],
    "temperature_2m_min": [9.9, 9.1, 8.9],
    "precipitation_probability_max": [0, 2, 0]
  }
}
```

**Campos que muestra la app:**

| Campo JSON | Se muestra como | Unidad |
|------------|-----------------|--------|
| `current.temperature_2m` | Temperatura actual (grande) | °C |
| `current.weather_code` | Condición en español + ícono (tabla WMO) | — |
| `current.apparent_temperature` | Sensación térmica | °C |
| `current.relative_humidity_2m` | Humedad | % |
| `current.wind_speed_10m` | Viento | km/h |
| `current.precipitation` | Precipitación | mm |
| `current.is_day` | Tarjeta en color de día/noche e ícono 🌙 | — |
| `current.time` | Hora local de la medición | — |
| `daily.*` | Pronóstico de 7 días: día, ícono, probabilidad de lluvia, mínima y máxima | °C / % |

Los datos de "current" se actualizan cada **15 minutos** (`"interval": 900`).

## 2.5 Códigos de respuesta y errores

| Código | Situación | Cuerpo | Tratamiento en la app |
|--------|-----------|--------|-----------------------|
| 200 | Éxito | JSON con datos | Se valida la estructura y se muestra |
| 200 sin `results` | Búsqueda sin coincidencias | `{"generationtime_ms": …}` | Estado vacío "Sin resultados para …" |
| 400 | Parámetro inválido | `{"error": true, "reason": "Latitude must be in range of -90 to 90°. Given: 999.0."}` (verificado en vivo) | Error `bad_request`: "El servicio rechazó la consulta…" |
| 429 | Límite de solicitudes excedido | — | Error `rate_limit`: "Espera N segundos…" (usa `Retry-After` si viene) |
| 5xx | Falla del servidor | — | 1 reintento automático; si persiste: "El servicio no está disponible…" |
| — | Sin conexión / DNS / TLS | — | Error `network`: "No hay conexión…" + botón Reintentar |
| — | Más de 10 s sin respuesta | — | Error `timeout` + reintento automático |
| — | JSON mal formado o campos faltantes | — | Error `invalid_response`: "Se recibió una respuesta inesperada…" |

## 2.6 Tabla de códigos WMO (`weather_code`)

| Código | Condición | Código | Condición |
|--------|-----------|--------|-----------|
| 0 | Despejado | 61/63/65 | Lluvia ligera/moderada/fuerte |
| 1 | Mayormente despejado | 66/67 | Lluvia helada |
| 2 | Parcialmente nublado | 71/73/75 | Nevada ligera/moderada/fuerte |
| 3 | Nublado | 77 | Granos de nieve |
| 45/48 | Niebla | 80/81/82 | Chubascos |
| 51/53/55 | Llovizna | 85/86 | Chubascos de nieve |
| 56/57 | Llovizna helada | 95/96/99 | Tormenta (con o sin granizo) |
