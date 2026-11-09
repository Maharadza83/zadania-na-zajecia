const sum = require('./sum');

describe('sum', () => {
  test('dodaje 1 + 2 i zwraca 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('działa dla liczb ujemnych', () => {
    expect(sum(-5, 3)).toBe(-2);
  });

  test('dodanie zera nie zmienia wartości', () => {
    expect(sum(7, 0)).toBe(7);
  });

  test('działa dla liczb zmiennoprzecinkowych', () => {
    expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
  });
});
