# Zadanie 11: Generowanie prostego testu jednostkowego

## Prompt

> Napisz prosty test jednostkowy dla tej funkcji używając Jest. Wyjaśnij, czym jest Jest, jak go zainstalować w projekcie i jak uruchomić ten test. Podaj również strukturę plików projektu.

```javascript
function sum(a, b) {
  return a + b;
}
```

## Czym jest Jest?

**Jest** to framework do testowania kodu JavaScript rozwijany przez Meta (Facebook). Zawiera w jednym pakiecie wszystko, czego potrzeba do testów: *test runner* (wyszukuje i uruchamia testy), bibliotekę asercji (`expect(...).toBe(...)`), mockowanie funkcji i modułów oraz raport pokrycia kodu (`--coverage`). Działa „od razu”, bez dodatkowej konfiguracji – automatycznie znajduje pliki `*.test.js` i `*.spec.js`.

## Struktura plików projektu

```
projekt/
├── package.json
├── sum.js          # testowana funkcja
└── sum.test.js     # testy jednostkowe
```

## Kod

**sum.js** – funkcja musi być wyeksportowana, żeby test mógł ją zaimportować:

```javascript
function sum(a, b) {
  return a + b;
}

module.exports = sum;
```

**sum.test.js:**

```javascript
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
```

- `describe` grupuje powiązane testy,
- `test` (alias `it`) definiuje pojedynczy przypadek testowy,
- `expect(x).toBe(y)` – asercja ścisłej równości (`===`),
- `toBeCloseTo` – porównanie liczb zmiennoprzecinkowych z tolerancją (bo `0.1 + 0.2 = 0.30000000000000004`).

## Instalacja

```bash
npm init -y                 # utworzenie package.json (jeśli go nie ma)
npm install --save-dev jest # instalacja Jest jako zależności deweloperskiej
```

W `package.json` ustaw skrypt testowy:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Uruchomienie testu

```bash
npm test                 # uruchamia wszystkie testy
npx jest sum.test.js     # tylko jeden plik
npx jest --watch         # tryb obserwowania zmian
npx jest --coverage      # z raportem pokrycia kodu
```

Oczekiwany wynik:

```
 PASS  ./sum.test.js
  sum
    ✓ dodaje 1 + 2 i zwraca 3
    ✓ działa dla liczb ujemnych
    ✓ dodanie zera nie zmienia wartości
    ✓ działa dla liczb zmiennoprzecinkowych

Tests:       4 passed, 4 total
```
