const DEFAULT_ENV = 'development';

const ENVIRONMENT_CONFIGS = Object.freeze({
  development: {
    apiUrl: 'http://localhost:3000/api',
    debug: true,
    timeout: 5000
  },
  testing: {
    apiUrl: 'http://test-server:3000/api',
    debug: true,
    timeout: 5000
  },
  staging: {
    apiUrl: 'https://staging.example.com/api',
    debug: false,
    timeout: 10000
  },
  production: {
    apiUrl: 'https://api.example.com',
    debug: false,
    timeout: 15000
  }
});

/**
 * Zwraca konfigurację dla podanego środowiska.
 * Dla nieznanego środowiska zwraca konfigurację deweloperską.
 *
 * @param {string} env - nazwa środowiska (development, testing, staging, production)
 * @returns {{apiUrl: string, debug: boolean, timeout: number}}
 */
function getEnvironmentConfig(env) {
  const config = ENVIRONMENT_CONFIGS[env] ?? ENVIRONMENT_CONFIGS[DEFAULT_ENV];
  return { ...config };
}

module.exports = getEnvironmentConfig;
