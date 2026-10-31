# 3. Medidas de seguridad implementadas

| # | Riesgo | Medida | Dónde |
|---|--------|--------|-------|
| S1 | Datos interceptados o alterados en tránsito | **Solo HTTPS.** `assertAllowedUrl()` rechaza cualquier URL que no empiece con `https://` *antes* de llamar a `fetch`. La app no habilita tráfico HTTP sin cifrar | `src/api/http.ts` |
| S2 | Conexiones a servidores no autorizados | **Lista blanca de hosts:** solo `api.open-meteo.com` y `geocoding-api.open-meteo.com`. Se comprueba el host exacto, así que `api.open-meteo.com.evil.com` también se rechaza | `src/api/http.ts` (`ALLOWED_HOSTS`) |
| S3 | Exposición de claves o credenciales | La API elegida **no requiere clave**. No hay secretos, tokens ni archivos `.env` en el código ni en el paquete de la app. `.gitignore` excluye `.env*.local`, `*.key`, `*.p12`, `*.jks` y `*.pem` | Diseño, `.gitignore` |
| S4 | Entradas maliciosas o malformadas | **Validación de búsqueda:** se recortan espacios; se exigen 2–60 caracteres; se usa una lista blanca de caracteres (letras con acentos/ñ, dígitos, espacios y `. , ' -`); se rechazan `<`, `>`, `;`, `&`, `=`, `%`, `/`, emojis y textos sin letras | `src/utils/validation.ts` |
| S5 | Manipulación de parámetros de la URL | Los parámetros se codifican con `encodeURIComponent`, así que una entrada como `a&count=100` no puede añadir parámetros extra | `buildUrl()` en `src/api/http.ts` |
| S6 | Enlaces profundos manipulados (`climaya://weather?lat=…`) | La pantalla de clima **vuelve a validar** latitud (−90..90) y longitud (−180..180) con una expresión regular numérica estricta, limpia caracteres de control y recorta los textos. Si algo es inválido, muestra "Ubicación inválida" sin llamar a la API | `validateLocationParams()` |
| S7 | Respuestas inesperadas o maliciosas | **Validación del esquema JSON:** se comprueba el tipo de cada campo usado; los registros incompletos se descartan; las respuestas mal formadas producen un error controlado en lugar de un fallo de la app. Los datos se muestran como texto plano (React Native no interpreta HTML) | `parseGeocodingResponse()`, `parseForecastResponse()` |
| S8 | Saturar el servicio o exceder los límites de la API | **Limitador local** de 30 solicitudes/min (muy por debajo de las 600/min permitidas), **caché** (10 min para búsquedas, 5 min para clima), **retardo de 600 ms** al escribir y cancelación de búsquedas obsoletas con `AbortController` | `rateLimiter.ts`, `cache.ts`, `index.tsx` |
| S9 | Respuesta HTTP 429 (límite excedido) | Se detecta y se informa al usuario cuántos segundos esperar (lee `Retry-After` si existe). No se reintenta automáticamente para no empeorar el bloqueo | `http.ts` |
| S10 | Solicitudes que nunca terminan | Timeout de 10 s con `AbortController`; un solo reintento con espera progresiva (solo ante fallas de red, timeout o 5xx) | `http.ts` |
| S11 | Filtración de información técnica | Los errores internos se convierten en mensajes genéricos en español; nunca se muestran trazas, URLs ni respuestas crudas | `toUserMessage()` en `errors.ts` |
| S12 | Permisos innecesarios | Solo se usa `INTERNET`. En `app.json` se bloquean explícitamente ubicación, cámara y micrófono | `app.json` |
| S13 | Datos personales | La app no recopila, guarda ni envía datos personales: solo el nombre de ciudad que se busca y sus coordenadas públicas | Diseño |
| S14 | Cumplimiento de la licencia | Atribución CC BY 4.0 con enlaces a Open-Meteo y a la licencia en ambas pantallas | `src/components/Attribution.tsx` |

## Verificación

Todas las medidas S1, S2, S4–S11 tienen pruebas automatizadas en `__tests__/` (unitarias) e `integration/` (contra la API real). Ver la sección de ejecución en el `README.md`.
