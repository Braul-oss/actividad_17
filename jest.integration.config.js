/** Pruebas de integración contra la API real de Open-Meteo (requieren internet). */
module.exports = {
  preset: 'jest-expo/node',
  testMatch: ['<rootDir>/integration/**/*.test.ts'],
};
