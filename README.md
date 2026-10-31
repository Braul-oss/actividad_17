# ClimaYa — Prototipo móvil de consulta del clima

Aplicación móvil (Android / iOS, con versión web para demostración) que consume la **API pública de Open-Meteo** mediante solicitudes **HTTP GET por HTTPS** para:

- 🔍 **Buscar ciudades** por nombre (con búsqueda automática al escribir).
- 🌤️ **Consultar el clima actual**: temperatura, condición, sensación térmica, humedad, viento y precipitación.
- 📅 **Ver el pronóstico de 7 días**: máxima, mínima y probabilidad de lluvia.
- ↻ **Actualizar la información** con un botón o deslizando hacia abajo.

No requiere clave de API ni registro.

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/01-analisis-y-arquitectura.md](docs/01-analisis-y-arquitectura.md) | Requerimientos, evaluación de escenarios, stack, arquitectura y estructura |
| [docs/02-identificacion-api.md](docs/02-identificacion-api.md) | Ficha de la API, endpoints, parámetros, ejemplos JSON, límites, licencia y atribución |
| [docs/03-seguridad.md](docs/03-seguridad.md) | Medidas de seguridad implementadas |
| [docs/04-casos-de-prueba.md](docs/04-casos-de-prueba.md) | Casos de prueba CP-01 y CP-02 con resultados y evidencias |
| [docs/05-capturas-de-pantalla.md](docs/05-capturas-de-pantalla.md) | Capturas que demuestran el funcionamiento, clasificadas por requisito |
| [docs/06-entrega.md](docs/06-entrega.md) | Datos de entrega, matriz de cumplimiento, limitaciones y lista de verificación |
| [entrega/ClimaYa-Documentacion.pdf](entrega/ClimaYa-Documentacion.pdf) | Toda la documentación anterior en un solo PDF, con capturas |

## Requisitos

| Herramienta | Versión probada |
|-------------|-----------------|
| Node.js | 22.x (mínimo 20.19) |
| npm | 11.x |
| Teléfono con **Expo Go** (Android o iOS) | Compatible con Expo SDK 58 |

No se necesita Android Studio ni Xcode para ejecutarlo con Expo Go.

## Instalación

```bash
cd actividad_17_aplicacion_movil
npm install
```

## Ejecución

### Opción A — En un teléfono físico (recomendada)

1. Instala **Expo Go** desde Google Play o la App Store.
2. Conecta la computadora y el teléfono a la **misma red Wi-Fi**.
3. Ejecuta:
   ```bash
   npm start
   ```
4. Escanea el código QR que aparece en la terminal (en Android, desde Expo Go; en iOS, con la cámara).

Si la red de la escuela bloquea la conexión entre dispositivos, usa un túnel: `npx expo start --tunnel`.

### Opción B — En un emulador Android

Con Android Studio y un emulador ya configurados: `npm run android`.

### Opción C — En el navegador (para demostración)

```bash
npm run web
```
Abre http://localhost:8081. Para que se vea como en un teléfono, usa las herramientas de desarrollador del navegador (F12 → vista de dispositivo móvil).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo de Expo (código QR) |
| `npm run android` / `npm run web` | Abre la app en un emulador Android o en el navegador |
| `npm test` | Ejecuta las pruebas unitarias (sin red) |
| `npm run test:integration` | Ejecuta las pruebas de integración contra la API real (requiere internet) |
| `npm run typecheck` | Verifica los tipos de TypeScript |
| `npm run lint` | Analiza la calidad del código con ESLint |
| `npm run docs:pdf` | Genera `entrega/ClimaYa-Documentacion.pdf` a partir de `docs/` y `evidencias/` (requiere Edge o Chrome) |
| `npm run entrega:zip` | Genera `entrega/ClimaYa-codigo-fuente.zip` sin `node_modules` |

## Uso

1. En la pantalla **ClimaYa**, escribe el nombre de una ciudad (p. ej. *Toluca*) o toca una sugerencia.
2. Toca un resultado para ver su clima.
3. En la pantalla de clima, toca **↻ Actualizar** o desliza hacia abajo para obtener datos nuevos.
4. Usa la flecha ← para volver a la búsqueda.

## Tecnologías

Expo SDK 58 · React Native 0.88 · React 19 · TypeScript 6 · Expo Router · Jest 30

## Atribución y licencia de los datos

Datos meteorológicos y de geocodificación por [Open-Meteo.com](https://open-meteo.com/), bajo licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). La base de ciudades proviene de [GeoNames](https://www.geonames.org/). Este proyecto es académico y no comercial, conforme a los [términos de uso](https://open-meteo.com/en/terms) del plan gratuito.
