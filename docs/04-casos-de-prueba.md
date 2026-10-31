# 4. Casos de prueba

## Datos de la ejecución

| Concepto | Detalle |
|----------|---------|
| Aplicación | ClimaYa v1.0.0 (Expo SDK 58 / React Native 0.88) |
| Fecha de ejecución | 31/10/2026, de 10:18:40 a 10:19:07 (hora del centro de México) |
| Entorno | Versión web de la app servida por Expo (`npm run web`), en Microsoft Edge 156 con vista móvil táctil de 390 × 844 px |
| API | Open-Meteo en producción (sin simulaciones; respuestas reales) |
| Evidencias | Capturas en `evidencias/casos-de-prueba/` y registro de solicitudes HTTP en `evidencias/casos-de-prueba/registro-ejecucion.json` |

> **Nota sobre el entorno:** ambos casos se ejecutaron con la versión web de la app en vista móvil, porque el equipo de desarrollo no tiene emulador Android. El código de pantallas, validación y conexión es el mismo que se ejecuta en el teléfono. La pérdida de conexión del CP-02 se simuló con el modo sin conexión del navegador, que equivale al modo avión del teléfono. Se recomienda repetir ambos casos en un teléfono con Expo Go antes de la entrega (ver la sección final).

---

## CP-01 — Búsqueda de una ciudad y consulta y actualización de su clima

| Elemento | Descripción |
|----------|-------------|
| **Identificador** | CP-01 |
| **Nombre** | Búsqueda de una ciudad y consulta y actualización de su clima |
| **Tipo** | Prueba funcional de integración con la API (camino feliz) |
| **Objetivo** | Comprobar que la app consulta la API de Open-Meteo mediante solicitudes HTTP GET por HTTPS, procesa el JSON y muestra correctamente los datos de búsqueda y de clima, y que el botón "Actualizar" obtiene información nueva. |
| **Justificación** | Es el flujo principal del prototipo y cubre los requerimientos centrales de la actividad: integración con una API pública por GET y HTTPS, procesamiento de JSON con al menos tres campos por resultado, búsqueda, actualización de información, indicador de carga y atribución de la fuente. Si este caso falla, la app no cumple su propósito. |

### Precondiciones

1. Dependencias instaladas (`npm install`) y app en ejecución (`npm start` en el teléfono o `npm run web` en el navegador).
2. El dispositivo tiene conexión a internet.
3. La API de Open-Meteo está disponible (`https://geocoding-api.open-meteo.com` y `https://api.open-meteo.com`).
4. La app está recién abierta, en la pantalla de búsqueda, sin consultas previas.

### Datos de prueba

| Dato | Valor |
|------|-------|
| Texto de búsqueda | `Toluca` |
| Resultado a seleccionar | Toluca de Lerdo, Estado de México, México |

### Pasos de ejecución

| # | Acción |
|---|--------|
| 1 | Abrir la aplicación |
| 2 | Escribir `Toluca` en el buscador y pulsar **Buscar** |
| 3 | Revisar los datos de la tarjeta "Toluca de Lerdo" |
| 4 | Tocar la tarjeta "Toluca de Lerdo" |
| 5 | Revisar los datos de clima mostrados y desplazarse hasta el pronóstico de 7 días |
| 6 | Pulsar **↻ Actualizar** |

### Resultado esperado

| # | Resultado esperado |
|---|--------------------|
| 1 | Se muestra la pantalla "ClimaYa" con el buscador, un mensaje inicial y ciudades sugeridas |
| 2 | Aparece el indicador de carga "Buscando ciudades…". Se envía un `GET` por HTTPS a la API de geocodificación y se muestra una lista de resultados con su número total |
| 3 | La tarjeta muestra al menos tres campos y coinciden con el JSON: nombre, estado, país, coordenadas, altitud y población |
| 4 | Se envía un `GET` por HTTPS a la API de pronóstico (HTTP 200) y se abre la pantalla de clima de Toluca de Lerdo |
| 5 | Se muestran temperatura, condición, sensación térmica, humedad, viento y precipitación, con valores iguales (redondeados) a los del JSON. También aparecen el pronóstico de 7 días y la atribución "Datos meteorológicos por Open-Meteo.com · CC BY 4.0" |
| 6 | Se envía un nuevo `GET` (HTTP 200) y cambia la hora de "Actualizado en la app" |

### Resultado obtenido

| # | Resultado obtenido | Evidencia |
|---|--------------------|-----------|
| 1 | Se mostró la pantalla de búsqueda con el mensaje "Consulta el clima de cualquier ciudad" y 4 sugerencias | `CP01-01-pantalla-inicial.png` |
| 2 | Se mostró el indicador "Buscando ciudades… Consultando "Toluca"" y el botón Buscar se deshabilitó durante la carga. Solicitud: `GET https://geocoding-api.open-meteo.com/v1/search?name=Toluca&count=10&language=es&format=json` → **HTTP 200**. Se mostró "10 resultados para "Toluca"" (la API devolvió 10 registros) | `CP01-02-cargando.png`, `CP01-03-resultados.png` |
| 3 | Pantalla: *MX · Toluca de Lerdo · Estado de México, México · 19.29° N, 99.65° O · 2671 m · 489,333 hab.* JSON: `name=Toluca de Lerdo`, `admin1=Estado de México`, `country=México`, `latitude=19.28786`, `longitude=-99.65324`, `elevation=2671`, `population=489333`. **Coinciden los 7 campos** | `CP01-03-resultados.png` |
| 4 | Solicitud: `GET https://api.open-meteo.com/v1/forecast?latitude=19.2879&longitude=-99.6532&current=…&daily=…&timezone=auto&forecast_days=7` → **HTTP 200**. Se abrió la pantalla "Toluca de Lerdo" | `CP01-04-clima.png` |
| 5 | Comparación pantalla / JSON: temperatura **19 °C** / `18.7`; condición **Parcialmente nublado** / `weather_code=2`; humedad **38 %** / `38`; viento **6 km/h** / `6`; precipitación **0.0 mm** / `0`; sensación térmica **18°** / `17.5`. Pronóstico del 31/10/2026 al 06/11/2026 (7 días). Atribución visible | `CP01-04-clima.png`, `CP01-05-pronostico-7-dias.png` |
| 6 | Se envió un nuevo `GET` a la API de pronóstico → **HTTP 200**. "Actualizado en la app" cambió de **10:19:00** a **10:19:03**. No hubo errores de JavaScript | `CP01-06-actualizado.png` |

### Estado: ✅ **APROBADA**

Todos los resultados obtenidos coincidieron con los esperados (16/16 verificaciones).

---

## CP-02 — Manejo de pérdida de conexión y recuperación

| Elemento | Descripción |
|----------|-------------|
| **Identificador** | CP-02 |
| **Nombre** | Manejo de pérdida de conexión y recuperación |
| **Tipo** | Prueba de manejo de errores (camino alterno / negativo) |
| **Objetivo** | Comprobar que, sin conexión a internet, la app no se cierra ni muestra errores técnicos: informa al usuario con un mensaje claro, conserva los datos ya obtenidos, ofrece reintentar y se recupera al volver la conexión. |
| **Justificación** | En un teléfono la pérdida de conexión es frecuente (túneles, zonas sin cobertura, cambio de Wi-Fi a datos). La actividad exige manejar errores de conexión e incluir mensajes de error. Este caso valida esa robustez y la medida de seguridad S11: no mostrar información técnica al usuario. |

### Precondiciones

1. Haber ejecutado CP-01: la app muestra el clima de **Toluca de Lerdo** con datos cargados.
2. El dispositivo tiene conexión a internet al iniciar la prueba.
3. Se puede desactivar la conexión: modo avión en el teléfono o modo sin conexión en el navegador.

### Datos de prueba

| Dato | Valor |
|------|-------|
| Ciudad con datos cargados | Toluca de Lerdo |
| Texto de búsqueda sin conexión | `Monterrey` |

### Pasos de ejecución

| # | Acción |
|---|--------|
| 1 | Verificar que la pantalla de clima de Toluca de Lerdo muestra datos |
| 2 | Desactivar la conexión a internet (modo avión) |
| 3 | Pulsar **↻ Actualizar** |
| 4 | Volver a la búsqueda con ←, escribir `Monterrey` y pulsar **Buscar** |
| 5 | Reactivar la conexión y pulsar **Reintentar** |

### Resultado esperado

| # | Resultado esperado |
|---|--------------------|
| 1 | Se muestran los datos del clima |
| 2 | La app sigue abierta, sin cambios visibles |
| 3 | Aparece el aviso "No hay conexión con el servicio… Se muestran los últimos datos obtenidos". Los datos previos se conservan y la app no se cierra |
| 4 | Aparece el estado de error "No se pudo completar la búsqueda" con un mensaje comprensible (sin trazas técnicas) y el botón **Reintentar** |
| 5 | La búsqueda se completa (HTTP 200) y se muestran los resultados de Monterrey |

### Resultado obtenido

| # | Resultado obtenido | Evidencia |
|---|--------------------|-----------|
| 1 | Se mostró la temperatura **19 °C** y los demás datos del clima | `CP01-06-actualizado.png` |
| 2 | Se activó el modo sin conexión. La app permaneció abierta | — |
| 3 | Apareció el aviso: *"⚠️ No hay conexión con el servicio. Revisa tu conexión a internet e intenta de nuevo. Se muestran los últimos datos obtenidos."* La temperatura siguió en **19 °C** (antes y después). El registro HTTP muestra **2 intentos fallidos** (`net::ERR_INTERNET_DISCONNECTED`): el intento original y el reintento automático | `CP02-03-aviso-sin-conexion.png` |
| 4 | Se mostró *"No se pudo completar la búsqueda — No hay conexión con el servicio. Revisa tu conexión a internet e intenta de nuevo."* con el botón **Reintentar**. Hubo 2 intentos fallidos registrados, sin mensajes técnicos en pantalla | `CP02-04-error-busqueda.png` |
| 5 | Al pulsar Reintentar: `GET …/v1/search?name=Monterrey…` → **HTTP 200**. Primer resultado: *Monterrey · Estado de Nuevo León, México · 25.68° N, 100.32° O · 560 m · 1,135,512 hab.* No hubo errores de JavaScript durante la prueba | `CP02-05-recuperado.png` |

### Estado: ✅ **APROBADA**

Todos los resultados obtenidos coincidieron con los esperados (6/6 verificaciones).

---

## Resumen

| ID | Nombre | Tipo | Verificaciones | Estado |
|----|--------|------|----------------|--------|
| CP-01 | Búsqueda de una ciudad y consulta y actualización de su clima | Funcional / integración con API | 16/16 | ✅ Aprobada |
| CP-02 | Manejo de pérdida de conexión y recuperación | Manejo de errores | 6/6 | ✅ Aprobada |

## Pruebas automatizadas complementarias

Además de los dos casos documentados, el proyecto incluye pruebas automatizadas que se pueden volver a ejecutar en cualquier momento:

| Conjunto | Comando | Qué cubre | Resultado (31/10/2026) |
|----------|---------|-----------|------------------------|
| Unitarias | `npm test` | Validación de entradas (texto, coordenadas, caracteres maliciosos); solo HTTPS y lista blanca de hosts; codificación de parámetros; errores 400, 429, 5xx, red, timeout y JSON inválido; reintentos; limitador de solicitudes; lectura del JSON | 62/62 aprobadas |
| Integración | `npm run test:integration` | Llamadas reales a ambos endpoints de Open-Meteo, búsqueda sin coincidencias, HTTP 400 real ante coordenadas imposibles | 7/7 aprobadas |

## Repetición en dispositivo físico (recomendada)

Para entregar evidencias desde un teléfono real, sigue los mismos pasos con Expo Go (`npm start` y escanear el código QR). Para el paso 2 del CP-02, activa el **modo avión**. Toma una captura en cada paso y anota cualquier diferencia en la columna "Resultado obtenido".

| Caso | Fecha | Dispositivo / SO | Resultado | Estado |
|------|-------|------------------|-----------|--------|
| CP-01 | | | | |
| CP-02 | | | | |
