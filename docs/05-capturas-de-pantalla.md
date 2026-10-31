# 5. Capturas de pantalla para demostrar el funcionamiento

Las capturas finales están en **`evidencias/capturas/`**, numeradas en el orden en que conviene presentarlas. Se tomaron el 31/10/2026 con la app en vista móvil (390 × 844 px) y datos reales de Open-Meteo.

Carpetas de apoyo:
- `evidencias/casos-de-prueba/`: capturas de cada paso de CP-01 y CP-02, con el registro HTTP `registro-ejecucion.json`.
- `evidencias/verificacion/`: capturas de la verificación de punta a punta completa (23 comprobaciones).

## 5.1 Funcionamiento principal

| # | Archivo | Qué muestra | Qué demuestra | Requisito |
|---|---------|-------------|---------------|-----------|
| 01 | `01-pantalla-inicial.png` | Pantalla de búsqueda con mensaje de bienvenida y ciudades sugeridas | Interfaz móvil intuitiva y estado inicial | Interfaz |
| 02 | `02-indicador-de-carga.png` | Spinner "Buscando ciudades… Consultando "Toluca"" y botón Buscar deshabilitado | Indicador de carga durante la solicitud GET | Indicadores de carga |
| 03 | `03-resultados-busqueda.png` | "10 resultados para "Toluca"" con tarjetas | Búsqueda en la API y **≥ 3 campos por resultado**: nombre, estado, país, coordenadas, altitud y población | Búsqueda · JSON · ≥ 3 campos |
| 04 | `04-clima-actual.png` | Clima de Toluca de Lerdo: 19 °C, Parcialmente nublado, humedad, viento, precipitación y sensación térmica | Segunda llamada GET y presentación de 6 campos del JSON | Integración API · ≥ 3 campos |
| 05 | `05-pronostico-7-dias.png` | Pronóstico de 7 días, hora de medición, botón Actualizar y atribución | Procesamiento de arreglos JSON y atribución CC BY 4.0 | JSON · Condiciones de uso |
| 06 | `06-actualizacion.png` | Pantalla tras pulsar "Actualizar" (hora "Actualizado en la app" nueva) | Actualización de la información | Actualización |
| 07 | `07-busqueda-automatica-acentos.png` | Resultados de "Ciudad de México", escrita letra por letra | Búsqueda automática con retardo (1 sola solicitud) y soporte de acentos | Búsqueda |

## 5.2 Estados vacíos y validaciones

| # | Archivo | Qué muestra | Qué demuestra | Requisito |
|---|---------|-------------|---------------|-----------|
| 08 | `08-estado-vacio.png` | "Sin resultados para "Zzqqxxlugarinexistente"" con sugerencia | Estado vacío cuando la API no encuentra coincidencias | Estados vacíos |
| 09 | `09-validacion-longitud.png` | Texto "a" → "Escribe al menos 2 caracteres." | Validación de parámetros antes de llamar a la API | Validaciones |
| 10 | `10-validacion-caracteres.png` | Texto `<script>` → "Usa solo letras, números, espacios y los signos . , ' -" | Rechazo de entradas maliciosas (0 solicitudes enviadas) | Seguridad · Validaciones |

## 5.3 Manejo de errores

| # | Archivo | Qué muestra | Qué demuestra | Requisito |
|---|---------|-------------|---------------|-----------|
| 11 | `11-error-conexion-actualizar.png` | Aviso amarillo "No hay conexión… Se muestran los últimos datos obtenidos" | Error de conexión sin perder los datos ni cerrar la app | Errores de conexión |
| 12 | `12-error-conexion-busqueda.png` | "No se pudo completar la búsqueda" con botón **Reintentar** | Mensaje de error comprensible y opción de recuperación | Mensajes de error |
| 13 | `13-recuperacion-reintentar.png` | Resultados de Monterrey tras reconectar y pulsar Reintentar | Recuperación después del error | Errores de conexión |
| 14 | `14-limite-solicitudes-429.png` | "Se alcanzó el límite de solicitudes. Espera 30 segundos…" | Manejo de HTTP 429 (simulado, porque no se debe saturar la API real) | Límites de solicitudes |
| 15 | `15-respuesta-inesperada.png` | "Se recibió una respuesta inesperada del servicio…" | Manejo de una respuesta que no es JSON (simulada) | Respuestas inesperadas |
| 16 | `16-parametros-ruta-invalidos.png` | "No se puede mostrar el clima — La ubicación seleccionada no es válida." | Validación de parámetros manipulados (`lat=999&lon=abc`) sin llamar a la API | Seguridad · Validaciones |

## 5.4 Integración con la API y pruebas

| # | Archivo | Qué muestra | Qué demuestra | Requisito |
|---|---------|-------------|---------------|-----------|
| 17 | `17-api-respuesta-geocodificacion.png` | Solicitud `GET https://geocoding-api…/v1/search?name=Toluca…`, `HTTP 200`, `content-type: application/json` y JSON. Para la captura se recortó a 2 de los 10 resultados (la línea "… (8 resultados más)" es una anotación, no parte de la respuesta) | Uso de HTTPS, método GET y estructura del JSON | Identificación de la API |
| 18 | `18-api-respuesta-pronostico.png` | Solicitud `GET https://api.open-meteo.com/v1/forecast…`, `HTTP 200` y JSON completo | Los valores coinciden con la captura 04 (18.7 → 19 °C, 38 %, 6 km/h, `weather_code` 2 → Parcialmente nublado) | Procesamiento de JSON |
| 19 | `19-pruebas-unitarias.png` | Salida de `npm test`: 62/62 aprobadas | Validaciones, seguridad y manejo de errores automatizados | Pruebas |
| 20 | `20-pruebas-integracion.png` | Salida de `npm run test:integration`: 7/7 aprobadas contra la API real | Pruebas de integración con la API | Pruebas de integración |

Las capturas 19 y 20 se generaron a partir del reporte JSON de Jest (`--json`), con el formato de la terminal. Los nombres, resultados y tiempos son los de la ejecución real del 31/10/2026.

## 5.5 Capturas pendientes en dispositivo físico (recomendadas)

Las capturas anteriores se tomaron en la versión web de la app con vista móvil. Para demostrar que el prototipo corre en un teléfono, toma también estas capturas:

| # | Captura a tomar | Cómo obtenerla |
|---|-----------------|----------------|
| F1 | Terminal con el código QR de Expo | Ejecuta `npm start` y toma una captura de la terminal |
| F2 | App abierta en Expo Go: pantalla inicial | Escanea el QR con Expo Go; en el teléfono, botón de encendido + bajar volumen |
| F3 | Resultados de búsqueda de "Toluca" | Equivalente a la captura 03 |
| F4 | Clima de Toluca de Lerdo | Equivalente a la captura 04 |
| F5 | Gesto "deslizar para actualizar" en curso | Desliza hacia abajo en la pantalla de clima y captura mientras gira el indicador |
| F6 | Aviso sin conexión con el modo avión activado | Equivalente a la captura 11; que se vea el ícono de avión en la barra de estado |

Guárdalas en `evidencias/capturas/dispositivo/` con el prefijo `F1-`, `F2-`, etc.
