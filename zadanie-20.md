# Zadanie 20: Generowanie wyrażeń regularnych

## Prompt 1

> Potrzebuję wyrażenia regularnego, które waliduje format adresu IPv4 (np. 192.168.1.1).

## Wyrażenie regularne

```regex
^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$
```

## Prompt 2

> Wyjaśnij, jak działa to wyrażenie regularne i przetestuj je na kilku przykładach (poprawnych i niepoprawnych).

## Wyjaśnienie

Adres IPv4 to 4 liczby (oktety) z zakresu **0–255** rozdzielone kropkami. Regex nie potrafi „liczyć”, więc zakres 0–255 jest opisany jako suma wzorców dla różnych przedziałów:

| Fragment | Dopasowuje | Przykłady |
|---|---|---|
| `25[0-5]` | 250–255 | `250`, `255` |
| `2[0-4]\d` | 200–249 | `200`, `249` |
| `1\d\d` | 100–199 | `100`, `168` |
| `[1-9]?\d` | 0–99 (bez zera wiodącego) | `0`, `7`, `42` |

- `( ... | ... )` – alternatywa: oktet pasuje do jednego z wariantów. Kolejność jest ważna – dłuższe warianty są sprawdzane najpierw.
- `\.` – dosłowna kropka (sama `.` oznacza w regexie „dowolny znak”).
- `(\.OKTET){3}` – trzy powtórzenia „kropka + oktet”, razem z pierwszym oktetem dają 4 liczby.
- `^` i `$` – kotwice początku i końca napisu. Bez nich regex znalazłby poprawny adres **wewnątrz** dłuższego tekstu, np. w `"1192.168.1.1999"`.
- `\d` – dowolna cyfra (0–9).

Wybrano wariant **bez zer wiodących** (`01`, `001` są odrzucane), bo w wielu narzędziach takie zapisy są interpretowane jako liczby ósemkowe, co bywa źródłem błędów i luk bezpieczeństwa.

## Implementacja

Plik [`ipv4-validator.js`](ipv4-validator.js) – funkcja `isValidIPv4(ip)` oraz zestaw testów uruchamianych poleceniem `node ipv4-validator.js`.

## Przykłady testów

| Wejście | Wynik | Dlaczego |
|---|---|---|
| `192.168.1.1` | ✅ poprawny | typowy adres prywatny |
| `0.0.0.0` | ✅ poprawny | wartości minimalne |
| `255.255.255.255` | ✅ poprawny | wartości maksymalne |
| `10.0.0.254` | ✅ poprawny | |
| `8.8.8.8` | ✅ poprawny | jednocyfrowe oktety |
| `256.1.1.1` | ❌ niepoprawny | 256 > 255 |
| `192.168.1` | ❌ niepoprawny | tylko 3 oktety |
| `192.168.1.1.1` | ❌ niepoprawny | 5 oktetów |
| `192.168.01.1` | ❌ niepoprawny | zero wiodące |
| `192.168.1.-1` | ❌ niepoprawny | liczba ujemna |
| `abc.def.ghi.jkl` | ❌ niepoprawny | litery zamiast cyfr |
| `"192.168.1.1 "` | ❌ niepoprawny | spacja na końcu (kotwica `$`) |
| `""` | ❌ niepoprawny | pusty napis |

Wynik uruchomienia `node ipv4-validator.js`: wszystkie 13 przypadków zgodne z oczekiwaniami.
