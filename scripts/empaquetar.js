/**
 * Crea entrega/ClimaYa-codigo-fuente.zip con el proyecto listo para entregar
 * (sin node_modules ni archivos generados). Uso: npm run entrega:zip
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'entrega', 'ClimaYa-codigo-fuente.zip');
const INCLUDE = [
  'README.md', 'app.json', 'package.json', 'package-lock.json', 'tsconfig.json',
  'jest.config.js', 'jest.integration.config.js', 'eslint.config.js', '.gitignore',
  'assets', 'src', '__tests__', 'integration', 'scripts', 'docs', 'evidencias',
  'entrega/ClimaYa-Documentacion.pdf',
];

// En Windows se usa el tar.exe del sistema (bsdtar), que sabe crear archivos .zip.
const systemTar = 'C:\\Windows\\System32\\tar.exe';
const tar = fs.existsSync(systemTar) ? systemTar : 'tar';

const missing = INCLUDE.filter((p) => !fs.existsSync(path.join(ROOT, p)));
if (missing.length) {
  console.error('Faltan archivos:', missing.join(', '), '\nEjecuta primero: npm run docs:pdf');
  process.exit(1);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
execFileSync(tar, ['-a', '-c', '-f', OUT, ...INCLUDE], { cwd: ROOT, stdio: 'inherit' });
console.log(`ZIP generado: ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1048576).toFixed(1)} MB)`);
