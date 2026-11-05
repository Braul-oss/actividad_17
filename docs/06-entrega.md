# 6. Documento de entrega

## 6.1 Datos de identificación

| Campo | Valor |
|-------|-------|
| Institución | _[completar]_ |
| Asignatura | _[completar]_ |
| Actividad | Actividad 18 — Prototipo de aplicación móvil que consume una API pública |
| Alumno(a) | _[completar]_ |
| Matrícula / Grupo | _[completar]_ |
| Docente | _[completar]_ |
| Fecha de entrega | _[completar]_ |
| Nombre del prototipo | **ClimaYa** v1.0.0 |

## 6.2 Resumen

ClimaYa es un prototipo móvil hecho con **Expo (React Native) y TypeScript** que consume la API pública y gratuita de **Open-Meteo** mediante solicitudes **HTTP GET por HTTPS**. Permite **buscar ciudades** y **consultar y actualizar** su clima actual y su pronóstico de 7 días. Incluye indicadores de carga, estados vacíos, mensajes de error, validación de parámetros y manejo de errores de conexión, respuestas inesperadas y límites de solicitudes. La API no requiere clave, así que la app no contiene credenciales.

**Resultados de verificación (31/10/2026):** 62/62 pruebas unitarias, 7/7 pruebas de integración contra la API real, 23/23 comprobaciones de punta a punta, y casos de prueba CP-01 (16/16) y CP-02 (6/6) **aprobados**. TypeScript, ESLint y `expo-doctor` sin errores. El bundle de Android compila correctamente.

## 6.3 Contenido de la entrega

```
actividad_17_aplicacion_movil/
├── README.md                         Instalación, ejecución y uso
├── docs/
│   ├── 01-analisis-y-arquitectura.md Requerimientos, escenarios, stack y arquitectura
│   ├── 02-identificacion-api.md      Identificación y documentación de la API
│   ├── 03-seguridad.md               Medidas de seguridad
│   ├── 04-casos-de-prueba.md         Casos de prueba CP-01 y CP-02
│   ├── 05-capturas-de-pantalla.md    Capturas que demuestran el funcionamiento
│   └── 06-entrega.md                 Este documento
├── evidencias/
│   ├── capturas/                     20 capturas finales numeradas
│   ├── casos-de-prueba/              Capturas por paso + registro HTTP (JSON)
│   └── verificacion/                 Capturas de la verificación completa
├── src/                              Código fuente de la app
├── __tests__/  integration/          Pruebas unitarias y de integración
├── scripts/                          Generación del PDF y del ZIP de entrega
├── app.json  package.json  tsconfig.json  jest*.config.js  eslint.config.js
└── entrega/
    ├── ClimaYa-Documentacion.pdf     Documentación consolidada con capturas
    └── ClimaYa-codigo-fuente.zip     Proyecto sin node_modules
```

## 6.4 Matriz de cumplimiento

| Requisito de la actividad | Cómo se cumple | Evidencia |
|---------------------------|----------------|-----------|
| Analizar requerimientos y seleccionar escenario y API | Tabla de requerimientos y comparación de 5 opciones; se eligió Open-Meteo | `docs/01` §1.1–1.2 |
| Investigar la documentación oficial de la API | Endpoints, parámetros, códigos de error y límites verificados en la documentación oficial y con llamadas reales | `docs/02` |
| Definir y justificar arquitectura y tecnologías | Stack justificado, diagrama de capas y estructura | `docs/01` §1.3–1.4 |
| Crear el proyecto y configurar dependencias | Proyecto Expo SDK 58 creado desde cero; `expo-doctor` 20/20 | `package.json`, `README.md` |
| Interfaz móvil intuitiva y moderna | Dos pantallas con tarjetas, sugerencias, íconos de clima y navegación con botón atrás | Capturas 01, 03, 04, 05 |
| Integrar la API mediante HTTP GET | `getJson()` con `method: 'GET'` a 2 endpoints | `src/api/http.ts`; capturas 17 y 18; registro HTTP de CP-01 |
| Procesar JSON y mostrar ≥ 3 campos por resultado | 7 campos por ciudad y 6 campos de clima actual, más el pronóstico diario | Capturas 03, 04, 05; CP-01 paso 3 y 5 |
| Búsqueda / actualización de información | Búsqueda manual y automática; actualización con botón y gesto | Capturas 03, 06, 07; CP-01 paso 6 |
| Indicadores de carga, estados vacíos y mensajes de error | Componente `StateView` y aviso no bloqueante | Capturas 02, 08, 11, 12 |
| Ejecución en dispositivo o emulador | Bundle Android (Hermes) compilado; app ejecutable con Expo Go | `README.md` §Ejecución; ver limitación 1 |
| Usar HTTPS | Solo `https://` y lista blanca de hosts | `docs/03` S1–S2; captura 17; prueba unitaria |
| Evitar exponer claves o credenciales | API sin clave; sin secretos en el código | `docs/03` S3 |
| Validaciones de parámetros | Texto, coordenadas y parámetros de ruta | `docs/03` S4–S6; capturas 09, 10, 16 |
| Manejar errores de conexión, respuestas inesperadas y límites | Errores tipados, reintento, timeout, limitador local, caché y HTTP 429 | `docs/03` S7–S11; capturas 11–15; CP-02 |
| Verificar condiciones de uso y atribución | Uso no comercial; atribución CC BY 4.0 en ambas pantallas | `docs/02` §2.2; captura 05 |
| Pruebas de integración con la API | 7 pruebas contra la API real | `integration/`; captura 20 |
| Dos casos de prueba completos | CP-01 y CP-02 con todos los elementos solicitados | `docs/04` |
| Identificar capturas de pantalla | 20 capturas clasificadas por requisito y 6 recomendadas en teléfono | `docs/05` |

## 6.5 Instrucciones rápidas para el evaluador

```bash
npm install                   # 1. Instalar dependencias
npm start                     # 2. Escanear el QR con Expo Go (o: npm run web)
npm test                      # 3. Pruebas unitarias (62)
npm run test:integration      # 4. Pruebas contra la API real (7, requiere internet)
```

Flujo sugerido para la demostración: buscar **Toluca** → tocar **Toluca de Lerdo** → revisar el clima → **Actualizar** → activar el modo avión → **Actualizar** (aparece el aviso) → volver y buscar otra ciudad (aparece el error con **Reintentar**) → desactivar el modo avión → **Reintentar**.

## 6.6 Limitaciones conocidas y mejoras futuras

1. **Prueba en dispositivo físico pendiente.** Las pruebas de interfaz se hicieron con la versión web en vista móvil, porque el equipo de desarrollo no tiene emulador Android. El bundle nativo de Android compila sin errores, pero falta ejecutarlo en Expo Go y tomar las capturas F1–F6 (`docs/05` §5.5).
2. **Errores 429 y JSON inválido simulados.** Se simularon interceptando la red, porque provocarlos en la API real implicaría abusar del servicio. El manejo con respuestas reales de la API se comprobó para HTTP 200 y HTTP 400.
3. **Caché solo en memoria.** Se pierde al cerrar la app; no hay modo sin conexión persistente.
4. **Uso no comercial.** El plan gratuito de Open-Meteo no permite publicar la app con fines comerciales sin contratar un plan de pago.
5. **Mejoras posibles:** ciudades favoritas guardadas en el dispositivo, clima por ubicación GPS (requiere permiso), pronóstico por hora y modo oscuro.

## 6.7 Lista de verificación antes de entregar

- [ ] Completar los datos de identificación (§6.1) y regenerar el PDF con `npm run docs:pdf`.
- [ ] Ejecutar la app en un teléfono con Expo Go y tomar las capturas F1–F6.
- [ ] Llenar la tabla "Repetición en dispositivo físico" de `docs/04`.
- [ ] Regenerar el ZIP con `npm run entrega:zip` (incluye el PDF y las capturas nuevas) y revisar que abre e instala con `npm install`.
- [ ] Subir el PDF y el ZIP a la plataforma de la asignatura.
