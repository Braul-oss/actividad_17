/**
 * Genera entrega/ClimaYa-Documentacion.pdf a partir de docs/*.md y las capturas de evidencias/.
 * Uso: npm run docs:pdf   (requiere Microsoft Edge o Google Chrome instalado)
 *
 * Los datos de la portada se toman de la tabla de la sección 6.1 de docs/06-entrega.md.
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT_DIR = path.join(ROOT, 'entrega');
const OUT_PDF = path.join(OUT_DIR, 'ClimaYa-Documentacion.pdf');

const BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/microsoft-edge',
  '/usr/bin/chromium',
];

const read = (file) => fs.readFileSync(path.join(DOCS, file), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const imageData = (file) => `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;

/** Filas "| a | b | ... |" de una tabla Markdown que empiezan con el patrón indicado. */
function tableRows(markdown, firstCellPattern) {
  return markdown
    .split('\n')
    .filter((l) => l.startsWith('|') && firstCellPattern.test(l.split('|')[1].trim()))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
}

const strip = (md) => md.replace(/`/g, '').replace(/\*\*/g, '').replace(/_\[completar\]_/g, '[completar]');

function coverData() {
  const section = read('06-entrega.md').split('## 6.2')[0];
  return tableRows(section, /^(?!Campo$|-+$).+/).map(([k, v]) => [strip(k), strip(v)]);
}

function gallery(dir, captions, { phone = true } = {}) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
  const items = files.map((f) => {
    const isPhone = phone && !/^(1[7-9]|20)-/.test(f);
    const caption = captions[f] ?? f;
    return `<figure class="${isPhone ? 'phone' : 'wide'}"><img src="${imageData(path.join(dir, f))}"><figcaption><b>${esc(f.replace('.png', ''))}</b><br>${esc(caption)}</figcaption></figure>`;
  });
  return `<div class="gallery">${items.join('\n')}</div>`;
}

function build() {
  const docs = [
    '01-analisis-y-arquitectura.md',
    '02-identificacion-api.md',
    '03-seguridad.md',
    '04-casos-de-prueba.md',
    '05-capturas-de-pantalla.md',
    '06-entrega.md',
  ];

  // Leyendas de las capturas finales (tabla de docs/05: | # | archivo | qué muestra | ...).
  const captions = {};
  for (const [, file, shows] of tableRows(read('05-capturas-de-pantalla.md'), /^\d{2}$/)) {
    captions[file.replace(/`/g, '')] = strip(shows);
  }
  const cpCaptions = {
    'CP01-01-pantalla-inicial.png': 'CP-01 paso 1: pantalla inicial',
    'CP01-02-cargando.png': 'CP-01 paso 2: indicador de carga',
    'CP01-03-resultados.png': 'CP-01 pasos 2–3: resultados de "Toluca"',
    'CP01-04-clima.png': 'CP-01 pasos 4–5: clima de Toluca de Lerdo',
    'CP01-05-pronostico-7-dias.png': 'CP-01 paso 5: pronóstico de 7 días y atribución',
    'CP01-06-actualizado.png': 'CP-01 paso 6: datos actualizados',
    'CP02-03-aviso-sin-conexion.png': 'CP-02 paso 3: aviso sin conexión, datos conservados',
    'CP02-04-error-busqueda.png': 'CP-02 paso 4: error en búsqueda con Reintentar',
    'CP02-05-recuperado.png': 'CP-02 paso 5: recuperación al reconectar',
  };

  marked.setOptions({ gfm: true });
  const sections = docs.map((file) => {
    let html = marked.parse(read(file));
    if (file.startsWith('04')) {
      html += `<h2>Evidencias de la ejecución</h2>${gallery(path.join(ROOT, 'evidencias', 'casos-de-prueba'), cpCaptions)}`;
    }
    if (file.startsWith('05')) {
      html += `<h2>Galería de capturas</h2>${gallery(path.join(ROOT, 'evidencias', 'capturas'), captions)}`;
    }
    return `<section>${html}</section>`;
  });

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const install = readme.slice(readme.indexOf('## Requisitos'), readme.indexOf('## Tecnologías'));
  sections.push(`<section><h1>Anexo A. Instalación y ejecución</h1>${marked.parse(install)}</section>`);

  const titles = sections.map((s) => (/<h1[^>]*>(.*?)<\/h1>/.exec(s) || [])[1]).filter(Boolean);
  const cover = coverData()
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td class="${v.includes('[completar]') ? 'todo' : ''}">${esc(v)}</td></tr>`)
    .join('');

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>ClimaYa — Documentación</title>
<style>
  @page { size: A4; margin: 18mm 16mm 20mm; }
  body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; font-size: 10.5pt; color: #0f1b2d; line-height: 1.45; }
  h1 { font-size: 20pt; color: #1553b8; border-bottom: 3px solid #1f6feb; padding-bottom: 4px; margin-top: 0; }
  h2 { font-size: 14pt; color: #1553b8; margin-top: 18px; break-after: avoid; }
  h3 { font-size: 12pt; margin-top: 14px; break-after: avoid; }
  section { break-before: page; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0 12px; font-size: 9pt; }
  th, td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #e3edfd; }
  tr { break-inside: avoid; }
  code { font-family: Consolas, monospace; font-size: 8.5pt; background: #f1f5f9; padding: 0 3px; border-radius: 3px; overflow-wrap: anywhere; }
  pre { background: #0f1b2d; color: #e2e8f0; padding: 10px; border-radius: 6px; font-size: 8pt; white-space: pre-wrap; break-inside: avoid; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #f59e0b; background: #fff7e6; margin: 8px 0; padding: 6px 10px; }
  a { color: #1553b8; text-decoration: none; }
  .gallery { display: flex; flex-wrap: wrap; gap: 3mm; justify-content: flex-start; }
  figure { margin: 0; break-inside: avoid; border: 1px solid #dce4ef; border-radius: 6px; padding: 1.5mm; background: #f8fafc; box-sizing: border-box; }
  figure.phone { width: 42mm; }
  figure.wide { width: 100%; }
  figure img { width: 100%; display: block; border-radius: 4px; }
  /* Las capturas de terminal muy altas se reducen para caber en una página. */
  figure.wide img { width: auto; max-width: 100%; max-height: 228mm; margin: 0 auto; }
  figcaption { font-size: 8pt; color: #475569; margin-top: 4px; }
  .cover { text-align: center; padding-top: 30mm; }
  .cover h1 { border: none; font-size: 34pt; margin-bottom: 0; }
  .cover .sub { font-size: 14pt; color: #475569; margin: 6px 0 24mm; }
  .cover table { width: 75%; margin: 0 auto; font-size: 11pt; }
  .cover th { width: 35%; }
  .todo { color: #b45309; font-style: italic; }
  .toc { font-size: 12pt; line-height: 2; }
</style></head><body>
<div class="cover">
  <div style="font-size:54pt">🌤️</div>
  <h1>ClimaYa</h1>
  <div class="sub">Prototipo móvil de consulta del clima con la API pública de Open-Meteo</div>
  <table>${cover}</table>
</div>
<section><h1>Contenido</h1><ol class="toc">${titles.map((t) => `<li>${t.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol></section>
${sections.join('\n')}
</body></html>`;
}

(async () => {
  const executablePath = BROWSERS.find((p) => fs.existsSync(p));
  if (!executablePath) {
    console.error('No se encontró Microsoft Edge ni Google Chrome. Instala uno de ellos para generar el PDF.');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const html = build();

  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:7pt;color:#94a3b8;width:100%;text-align:right;padding-right:16mm">ClimaYa — Actividad 17</div>',
    footerTemplate: '<div style="font-size:7pt;color:#94a3b8;width:100%;text-align:center">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
    margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' },
  });
  await browser.close();
  console.log(`PDF generado: ${path.relative(ROOT, OUT_PDF)}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
