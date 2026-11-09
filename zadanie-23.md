# Zadanie 23: Analiza złożoności algorytmu

## Prompt

> Jaka jest złożoność czasowa i pamięciowa tego algorytmu? Czy można go zoptymalizować?

## Pliki

- [`find-pairs.js`](find-pairs.js) – oryginalny algorytm,
- [`find-pairs-optimized.js`](find-pairs-optimized.js) – wersja zoptymalizowana (+ porównanie wyników: `node find-pairs-optimized.js`).

## Analiza oryginału

```javascript
for (let i = 0; i < arr.length; i++) {
  for (let j = i + 1; j < arr.length; j++) {
    if (arr[i] + arr[j] === targetSum) pairs.push([arr[i], arr[j]]);
  }
}
```

**Złożoność czasowa: O(n²).** Pętla zewnętrzna wykonuje się `n` razy, wewnętrzna kolejno `n-1, n-2, …, 1` razy. Łącznie `n(n-1)/2` porównań – dla 10 000 elementów to ok. 50 mln operacji, dla 100 000 – ok. 5 mld.

**Złożoność pamięciowa: O(1) dodatkowej pamięci** (pomijając wynik). Sam wynik może mieć w najgorszym razie O(n²) par – np. dla `[3, 3, 3, …]` i `targetSum = 6` każda para indeksów jest poprawna.

## Optymalizacja – tablica haszująca (Map)

Zamiast dla każdego elementu przeszukiwać resztę tablicy, wystarczy zapytać: *„ile razy na prawo od bieżącej pozycji występuje liczba `targetSum - value`?”*. Odpowiedź daje mapa liczności w czasie O(1).

```javascript
function findPairs(arr, targetSum) {
  const remaining = new Map();
  for (const value of arr) remaining.set(value, (remaining.get(value) || 0) + 1);

  const pairs = [];
  for (const value of arr) {
    remaining.set(value, remaining.get(value) - 1);   // element nie łączy się sam ze sobą
    const complement = targetSum - value;
    const count = remaining.get(complement) || 0;
    for (let c = 0; c < count; c++) pairs.push([value, complement]);
  }
  return pairs;
}
```

- **Czas: O(n + k)**, gdzie `k` to liczba znalezionych par (dwa przejścia po tablicy + wypisanie wyniku). Gdy par jest niewiele, to praktycznie **O(n)**.
- **Pamięć: O(n)** na mapę liczności.
- Zwraca **dokładnie ten sam wynik w tej samej kolejności** co oryginał, łącznie z duplikatami – zweryfikowane testami w pliku.

### Wariant: unikalne pary wartości – O(n)

Jeśli interesuje nas tylko, *jakie* pary liczb dają sumę (bez powtórzeń), wystarczy zbiór `seen`:

```javascript
for (const value of arr) {
  if (seen.has(targetSum - value)) /* dodaj parę, jeśli nowa */;
  seen.add(value);
}
```

### Inne podejście: sortowanie + dwa wskaźniki – O(n log n)

Po posortowaniu tablicy jeden wskaźnik idzie od początku, drugi od końca; jeśli suma jest za mała, przesuwamy lewy, jeśli za duża – prawy. Pamięć O(1) (przy sortowaniu w miejscu), ale zmienia kolejność elementów i jest wolniejsze niż wersja z mapą.

## Porównanie

| Wersja | Czas | Pamięć | Duplikaty jak oryginał |
|---|---|---|---|
| Oryginał (dwie pętle) | O(n²) | O(1) | tak |
| Map z licznościami | O(n + k) | O(n) | tak |
| Set – unikalne pary | O(n) | O(n) | nie (celowo) |
| Sortowanie + 2 wskaźniki | O(n log n) | O(1) | zależy od implementacji |

**Wniosek:** klasyczny kompromis *czas ↔ pamięć* – za cenę O(n) dodatkowej pamięci zamieniamy czas kwadratowy na liniowy. Przy dużych tablicach różnica jest ogromna (sekundy/minuty vs milisekundy). Trzeba jednak doprecyzować wymaganie (czy liczą się pary indeksów, czy unikalne pary wartości), bo od tego zależy wybór wersji.
