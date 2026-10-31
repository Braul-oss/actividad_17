# 1. Análisis, selección de escenario y arquitectura

## 1.1 Requerimientos de la actividad

| # | Requerimiento | Cómo se cubre en ClimaYa |
|---|---------------|--------------------------|
| R1 | Prototipo móvil funcional | App Expo/React Native ejecutable en Android/iOS (Expo Go) y en navegador |
| R2 | Consumir una API pública mediante HTTP GET | Dos endpoints GET de Open-Meteo (geocodificación y pronóstico) |
| R3 | Procesar JSON y mostrar ≥ 3 campos por resultado | Búsqueda: nombre, estado/región, país, coordenadas, altitud, población. Clima: temperatura, sensación térmica, humedad, viento, precipitación, condición, pronóstico de 7 días |
| R4 | Búsqueda y/o actualización de información | Búsqueda de ciudades (con búsqueda automática al escribir) + actualización del clima (botón y "deslizar para actualizar") |
| R5 | Indicadores de carga, estados vacíos y errores | Componente `StateView` con variantes de carga, vacío, error (con "Reintentar") e informativo; aviso no bloqueante si falla una actualización |
| R6 | HTTPS, sin credenciales expuestas | Solo URLs `https://` de una lista de hosts permitidos; la API no requiere clave |
| R7 | Validación de parámetros | Validación de texto de búsqueda, coordenadas y parámetros de navegación |
| R8 | Manejo de errores de conexión, respuestas inesperadas y límites | Errores tipados (red, timeout, 400, 429, 5xx, JSON inválido), reintento automático, limitador local y caché |
| R9 | Condiciones de uso y atribución | Atribución CC BY 4.0 visible en ambas pantallas |

## 1.2 Evaluación de escenarios

Las instrucciones que recibí no incluían la lista de escenarios propuestos de la actividad, así que comparé los escenarios más comunes para este tipo de práctica según los criterios que pide la actividad: API pública, gratuita, accesible por HTTPS y sin registro.

| Escenario | API candidata | ¿Requiere clave? | Gratuita | Búsqueda | Actualización | Veredicto |
|-----------|---------------|------------------|----------|----------|---------------|-----------|
| **Clima / pronóstico** | **Open-Meteo** | **No** | **Sí (uso no comercial)** | **Sí (geocodificación)** | **Sí (datos cada 15 min)** | **Seleccionado** |
| Clima | OpenWeatherMap | Sí | Plan limitado | Sí | Sí | Descartado: exige clave que quedaría expuesta en la app |
| Tipo de cambio | Frankfurter / ExchangeRate | No / Sí | Sí | Limitada | Diaria | Poca variedad de campos y de búsqueda |
| Películas | TMDB / OMDb | Sí | Sí | Sí | No | Exige clave |
| Noticias | NewsAPI | Sí | Solo desarrollo | Sí | Sí | Exige clave y no permite uso en cliente en producción |

**Justificación:** Open-Meteo permite cubrir ambas funciones (búsqueda **y** actualización), devuelve JSON con muchos campos útiles, no necesita clave (así no hay credenciales que proteger dentro de la app) y su documentación es pública y detallada.

## 1.3 Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework móvil | **Expo SDK 58 + React Native 0.88** | Permite ejecutar el prototipo en un teléfono real con **Expo Go** (escaneando un código QR) sin instalar Android Studio ni Xcode; también corre en navegador para demostraciones |
| Lenguaje | **TypeScript (modo estricto)** | Tipos para las respuestas de la API y menos errores en tiempo de ejecución |
| Navegación | **Expo Router** (rutas por archivos en `src/app/`) | Solución recomendada por Expo; pila nativa con botón "atrás" |
| HTTP | **`fetch` nativo + `AbortController`** | Sin dependencias extra; permite timeouts y cancelar solicitudes obsoletas |
| Pruebas | **Jest + jest-expo** | Pruebas unitarias (lógica, validación, manejo de errores) y de integración contra la API real |

No se añadieron librerías de terceros con código nativo, así que la app funciona en Expo Go sin compilar.

## 1.4 Arquitectura

```
┌──────────────────────── Interfaz (src/app, src/components) ───────────────────────┐
│  index.tsx (Búsqueda)              weather.tsx (Clima)                              │
│  SearchBar · PlaceCard · StateView WeatherHero · StatTile · DailyList · Attribution │
└──────────────┬─────────────────────────────────────┬───────────────────────────────┘
               │ searchPlaces(texto)                 │ getForecast(lat, lon)
┌──────────────▼─────────────────────────────────────▼───────────────────────────────┐
│ Servicios (src/api): geocoding.ts · forecast.ts                                     │
│  - validan parámetros  - construyen la URL  - validan/transforman el JSON  - caché  │
└──────────────┬──────────────────────────────────────────────────────────────────────┘
               │ getJson(url)
┌──────────────▼──────────────────────────────────────────────────────────────────────┐
│ Cliente HTTP (src/api/http.ts)                                                       │
│  HTTPS + lista blanca de hosts · timeout 10 s · 1 reintento · limitador 30/min ·     │
│  traducción de errores (errors.ts)                                                   │
└──────────────┬──────────────────────────────────────────────────────────────────────┘
               │ HTTPS GET
     geocoding-api.open-meteo.com          api.open-meteo.com
```

### Estructura del proyecto

```
├── app.json                 Configuración Expo (nombre, esquema, permisos)
├── package.json             Dependencias y scripts
├── jest.config.js           Configuración de pruebas
├── src/
│   ├── app/                 Pantallas (Expo Router)
│   │   ├── _layout.tsx      Pila de navegación y estilo del encabezado
│   │   ├── index.tsx        Pantalla de búsqueda de ciudades
│   │   ├── weather.tsx      Pantalla de clima actual + pronóstico
│   │   └── +not-found.tsx   Ruta desconocida
│   ├── api/
│   │   ├── http.ts          Cliente GET seguro (HTTPS, timeout, reintentos)
│   │   ├── errors.ts        Errores tipados y mensajes al usuario
│   │   ├── rateLimiter.ts   Límite local de solicitudes
│   │   ├── cache.ts         Caché en memoria con expiración
│   │   ├── geocoding.ts     Búsqueda de ciudades
│   │   └── forecast.ts      Clima actual y pronóstico
│   ├── components/          Componentes visuales reutilizables
│   ├── utils/
│   │   ├── validation.ts    Validación de entradas
│   │   └── weather.ts       Códigos WMO y formato en español
│   └── theme.ts             Colores, espaciados y sombras
├── __tests__/               Pruebas unitarias
├── integration/             Pruebas de integración contra la API real
└── docs/                    Documentación de entrega
```

### Flujo de la aplicación

1. El usuario escribe una ciudad. Tras 600 ms sin teclear (o al pulsar **Buscar**) se valida el texto y se consulta la API de geocodificación.
2. Se muestra la lista de coincidencias con nombre, región, país, coordenadas, altitud y población.
3. Al tocar un resultado se abre la pantalla de clima con las coordenadas. Estos parámetros se vuelven a validar.
4. Se consulta la API de pronóstico y se muestra el clima actual, cuatro indicadores y el pronóstico de 7 días.
5. El usuario puede **actualizar** con el botón o deslizando hacia abajo. Si la actualización falla, se conservan los últimos datos y aparece un aviso.
