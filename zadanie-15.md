# Zadanie 15: Refaktoryzacja prostej funkcji

## Prompt

> Zrefaktoryzuj tę funkcję, aby była bardziej czytelna i łatwiejsza w utrzymaniu.

## Pliki

- [`config.js`](config.js) – oryginalna funkcja z łańcuchem `if / else if`,
- [`config-refactored.js`](config-refactored.js) – wersja po refaktoryzacji.

## Wersja po refaktoryzacji

```javascript
const DEFAULT_ENV = 'development';

const ENVIRONMENT_CONFIGS = Object.freeze({
  development: { apiUrl: 'http://localhost:3000/api',      debug: true,  timeout: 5000 },
  testing:     { apiUrl: 'http://test-server:3000/api',    debug: true,  timeout: 5000 },
  staging:     { apiUrl: 'https://staging.example.com/api', debug: false, timeout: 10000 },
  production:  { apiUrl: 'https://api.example.com',         debug: false, timeout: 15000 }
});

function getEnvironmentConfig(env) {
  const config = ENVIRONMENT_CONFIGS[env] ?? ENVIRONMENT_CONFIGS[DEFAULT_ENV];
  return { ...config };
}
```

## Opis zmian

1. **Łańcuch `if / else if` zastąpiony obiektem-mapą (lookup table).** Konfiguracja to dane, a nie logika – wszystkie środowiska są opisane w jednym miejscu, w formie tabeli.
2. **Usunięcie duplikacji.** W oryginale konfiguracja `development` była zapisana dwa razy (w gałęzi `development` i w `else`). Teraz domyślna wartość wskazuje na istniejący wpis przez stałą `DEFAULT_ENV`.
3. **Operator `??` (nullish coalescing)** – czytelnie wyraża: „jeśli nie ma takiego środowiska, użyj domyślnego”.
4. **`Object.freeze` + zwracanie kopii (`{ ...config }`)** – kod wywołujący nie może przypadkiem zmodyfikować współdzielonej konfiguracji (w oryginale każde wywołanie tworzyło nowy obiekt, więc kopia zachowuje to samo zachowanie).
5. **Komentarz JSDoc** opisujący parametry i wynik.

## Korzyści

- **Łatwiejsze utrzymanie** – dodanie nowego środowiska (np. `qa`) to dopisanie jednej linii w obiekcie, bez dotykania logiki funkcji.
- **Czytelność** – wartości dla wszystkich środowisk można porównać „na oko”, jak w tabeli; funkcja ma 2 linie zamiast 30.
- **Mniej miejsc na błąd** – brak duplikatu domyślnej konfiguracji, który przy zmianie łatwo zaktualizować tylko w jednym miejscu.
- **Łatwiejsze testowanie i rozszerzanie** – obiekt konfiguracji można wyeksportować, przenieść do pliku JSON lub wczytywać ze zmiennych środowiskowych.
- **Identyczne zachowanie** – dla każdego wejścia (w tym nieznanego środowiska) funkcja zwraca te same wartości co oryginał.
