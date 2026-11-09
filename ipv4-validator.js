/**
 * Wyrażenie regularne walidujące adres IPv4 w zapisie dziesiętnym z kropkami.
 * Każdy oktet: 0-255, bez zer wiodących (np. "01" jest niepoprawne).
 */
const OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const IPV4_REGEX = new RegExp(`^${OCTET}(\\.${OCTET}){3}$`);
// Równoważny literał:
// /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

/**
 * Sprawdza, czy podany napis jest poprawnym adresem IPv4.
 *
 * @param {string} ip - adres do sprawdzenia
 * @returns {boolean} true, jeśli adres jest poprawny
 */
function isValidIPv4(ip) {
  return typeof ip === 'string' && IPV4_REGEX.test(ip);
}

module.exports = { isValidIPv4, IPV4_REGEX };

// Testy: node ipv4-validator.js
if (require.main === module) {
  const cases = [
    ['192.168.1.1', true],
    ['0.0.0.0', true],
    ['255.255.255.255', true],
    ['10.0.0.254', true],
    ['8.8.8.8', true],
    ['256.1.1.1', false],
    ['192.168.1', false],
    ['192.168.1.1.1', false],
    ['192.168.01.1', false],
    ['192.168.1.-1', false],
    ['abc.def.ghi.jkl', false],
    ['192.168.1.1 ', false],
    ['', false]
  ];

  let failed = 0;
  for (const [input, expected] of cases) {
    const result = isValidIPv4(input);
    const ok = result === expected;
    if (!ok) failed++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${JSON.stringify(input).padEnd(20)} -> ${result}`);
  }
  console.log(failed === 0 ? '\nWszystkie testy przeszły.' : `\nNieudane testy: ${failed}`);
  process.exitCode = failed === 0 ? 0 : 1;
}
