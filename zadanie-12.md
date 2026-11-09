# Zadanie 12: Optymalizacja prostego skryptu

## Prompt

> Czy ten kod można zoptymalizować? Jeśli tak, zaproponuj bardziej wydajną wersję.

## Wersja oryginalna

```python
def find_duplicates(list_of_items):
    duplicates = []
    for i in range(len(list_of_items)):
        for j in range(i+1, len(list_of_items)):
            if list_of_items[i] == list_of_items[j] and list_of_items[i] not in duplicates:
                duplicates.append(list_of_items[i])
    return duplicates
```

**Problemy:**
- dwie zagnieżdżone pętle → **O(n²)** porównań,
- dodatkowo `not in duplicates` przeszukuje listę liniowo – w najgorszym razie łącznie nawet **O(n³)**,
- ten sam duplikat jest porównywany wielokrotnie (np. element występujący 5 razy).

## Wersja zoptymalizowana – zbiory (set)

```python
def find_duplicates(list_of_items):
    seen = set()
    duplicates = set()
    for item in list_of_items:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return list(duplicates)
```

- jedno przejście po liście → **O(n)** czasu,
- sprawdzenie `in` dla zbioru to średnio **O(1)** (tablica haszująca),
- pamięć **O(n)** na zbiory `seen` i `duplicates`.

## Wersja z zachowaniem kolejności – `collections.Counter`

Oryginał zwracał duplikaty w kolejności ich pierwszego wystąpienia. Jeśli kolejność ma znaczenie:

```python
from collections import Counter

def find_duplicates(list_of_items):
    counts = Counter(list_of_items)
    return [item for item, count in counts.items() if count > 1]
```

`Counter` (słownik) zachowuje kolejność wstawiania (Python 3.7+), więc wynik jest identyczny jak w oryginale, przy złożoności **O(n)**.

## Porównanie

| | Oryginał | Zoptymalizowana |
|---|---|---|
| Złożoność czasowa | O(n²) – O(n³) | O(n) |
| Dodatkowa pamięć | O(k) – k duplikatów | O(n) |
| 10 000 elementów | ~50 mln porównań, kilka sekund | ~10 000 operacji, milisekundy |
| Czytelność | indeksy i zagnieżdżenia | 3–5 prostych linii |

**Ograniczenie:** wersje z `set`/`Counter` wymagają, aby elementy były *hashowalne* (liczby, napisy, krotki). Dla list zawierających np. słowniki lub listy trzeba zostać przy porównywaniu parami albo zamienić elementy na postać hashowalną (np. `tuple`, `json.dumps`).

Wniosek: zamiana wyszukiwania w liście na wyszukiwanie w zbiorze to jedna z najprostszych i najskuteczniejszych optymalizacji w Pythonie – kosztem niewielkiej ilości dodatkowej pamięci zyskujemy złożoność liniową.
