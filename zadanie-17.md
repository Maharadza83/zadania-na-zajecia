# Zadanie 17: Generowanie kodu na podstawie opisu

## Prompt

> Potrzebuję funkcji JavaScript, która:
> - przyjmuje tablicę obiektów reprezentujących zadania (każdy z polami: id, title, status)
> - filtruje tylko zadania o statusie "completed"
> - sortuje je według id (rosnąco)
> - zwraca tablicę zawierającą tylko tytuły tych zadań

Implementacja: [`task-filter.js`](task-filter.js)

## Opis rozwiązania

```javascript
function getCompletedTaskTitles(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Argument tasks musi być tablicą');
  }

  return tasks
    .filter(task => task.status === 'completed')
    .sort((a, b) => a.id - b.id)
    .map(task => task.title);
}
```

Funkcja to łańcuch trzech metod tablicowych, z których każda realizuje jedno wymaganie:

1. **`filter`** – tworzy nową tablicę tylko z zadaniami, których `status === 'completed'`.
2. **`sort((a, b) => a.id - b.id)`** – sortuje rosnąco po `id`. Funkcja porównująca jest konieczna, bo domyślny `sort()` porównuje elementy jako napisy (wtedy `10` byłoby przed `2`).
3. **`map`** – zamienia każdy obiekt zadania na sam tytuł.

Dodatkowe decyzje:
- `filter` jest wywoływany **przed** `sort`, więc sortujemy mniej elementów, a ponieważ `filter` zwraca nową tablicę, `sort` (który działa „w miejscu”) **nie modyfikuje tablicy wejściowej**,
- walidacja wejścia – czytelny błąd `TypeError`, gdy zamiast tablicy przekazano coś innego,
- złożoność: O(n log n) przez sortowanie.

## Przykład użycia

```javascript
const getCompletedTaskTitles = require('./task-filter');

const tasks = [
  { id: 3, title: 'Napisać testy', status: 'completed' },
  { id: 1, title: 'Skonfigurować CI', status: 'completed' },
  { id: 2, title: 'Przygotować Dockerfile', status: 'in-progress' },
  { id: 5, title: 'Wdrożyć na staging', status: 'pending' },
  { id: 4, title: 'Code review', status: 'completed' }
];

console.log(getCompletedTaskTitles(tasks));
// [ 'Skonfigurować CI', 'Napisać testy', 'Code review' ]

console.log(getCompletedTaskTitles([]));
// []
```

Przykład można uruchomić bezpośrednio: `node task-filter.js`.
