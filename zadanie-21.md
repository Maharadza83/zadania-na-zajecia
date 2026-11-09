# Zadanie 21: Transformacja danych

## Prompt

> Przekształć te dane JSON do formatu CSV z kolumnami: id, name, email, roles.

## Pliki

- [`users.json`](users.json) – dane wejściowe,
- [`users.csv`](users.csv) – wynik konwersji:

```csv
id,name,email,roles
1,Jan Kowalski,jan@example.com,admin;user
2,Anna Nowak,anna@example.com,user
```

## Proces konwersji

1. **Wybór rekordów** – w CSV każdy wiersz odpowiada jednemu elementowi tablicy `users`. Obiekt nadrzędny (`{"users": [...]}`) znika – CSV nie ma pojęcia zagnieżdżenia.
2. **Nagłówek** – pierwszy wiersz zawiera nazwy kolumn, odpowiadające kluczom obiektów: `id,name,email,roles`.
3. **Spłaszczenie wartości** – pola proste (`id`, `name`, `email`) są przepisywane bezpośrednio. Pole `roles` jest tablicą, więc musi zostać zamienione na pojedynczy napis.
4. **Escapowanie** – wartość zawierająca przecinek, cudzysłów lub znak nowej linii musi być ujęta w cudzysłowy (`"..."`), a cudzysłowy wewnątrz podwojone (`""`) – zgodnie z RFC 4180. W tych danych nie było to potrzebne.

Przykładowa automatyzacja (Node.js):

```javascript
const { users } = require('./users.json');

const escape = v => /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v);

const csv = [
  'id,name,email,roles',
  ...users.map(u => [u.id, u.name, u.email, u.roles.join(';')].map(escape).join(','))
].join('\n');

require('fs').writeFileSync('users.csv', csv + '\n');
```

## Wyzwania przy takiej transformacji

**1. Reprezentacja tablicy `roles`** – CSV to format płaski (jedna komórka = jedna wartość). Możliwe podejścia:

| Sposób | Przykład | Zalety | Wady |
|---|---|---|---|
| Separator wewnątrz komórki (wybrany) | `admin;user` | prosty, czytelny, 1 wiersz = 1 użytkownik | trzeba znać separator przy odczycie; problem, gdy rola zawiera `;` |
| Lista z przecinkami w cudzysłowie | `"admin,user"` | naturalny zapis | łatwo pomylić z separatorem kolumn, wymaga poprawnego escapowania |
| JSON w komórce | `"[""admin"",""user""]"` | odwracalna konwersja bez utraty informacji | nieczytelne, podwójne cudzysłowy |
| Wiersz na każdą rolę | `1,Jan Kowalski,jan@example.com,admin` + `1,...,user` | dobre do analiz (pivot, filtrowanie) | duplikacja danych, więcej wierszy niż użytkowników |
| Kolumny logiczne | `is_admin,is_user` → `true,true` | idealne do Excela i filtrów | wymaga znajomości wszystkich ról z góry |

Wybrano średnik, bo zachowuje relację „1 wiersz = 1 użytkownik” i nie koliduje z przecinkiem – separatorem kolumn.

**2. Utrata typów** – w CSV wszystko jest tekstem. `id` przestaje być liczbą, tablica przestaje być tablicą; przy odczycie trzeba je ponownie sparsować.

**3. Kodowanie znaków** – polskie znaki (ą, ę, ł) wymagają UTF-8. Excel w Windows często otwiera CSV jako Windows-1250 – pomaga dodanie BOM (`﻿`) na początku pliku.

**4. Separator regionalny** – w polskich ustawieniach Excela domyślnym separatorem listy jest średnik, a nie przecinek, więc plik może otworzyć się w jednej kolumnie.

**5. Niejednorodne obiekty** – gdyby niektórzy użytkownicy mieli dodatkowe pola lub głębsze zagnieżdżenie (np. `address.city`), trzeba ustalić pełny zestaw kolumn i spłaszczyć nazwy (`address_city`), a brakujące wartości zostawić puste.
