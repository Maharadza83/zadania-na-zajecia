# Zadanie 13: Generowanie komentarzy dokumentacyjnych

## Prompt

> Dodaj do tej funkcji komentarze dokumentacyjne w formacie JSDoc.

## Pliki

- [`fetch-user.js`](fetch-user.js) – oryginalna funkcja bez komentarzy,
- [`fetch-user-documented.js`](fetch-user-documented.js) – ta sama funkcja z komentarzami JSDoc.

## Czym jest JSDoc?

**JSDoc** to standard komentarzy dokumentacyjnych dla JavaScriptu. Komentarz zaczyna się od `/**` (dwie gwiazdki) i jest umieszczany bezpośrednio nad funkcją, klasą lub zmienną. Wewnątrz używa się **tagów** zaczynających się od `@`, opisujących parametry, zwracane wartości, typy itp.

Najważniejsze tagi użyte w tym zadaniu:

| Tag | Znaczenie |
|---|---|
| `@param {typ} nazwa - opis` | parametr funkcji i jego typ |
| `@returns {typ} opis` | co funkcja zwraca |
| `@async` | funkcja asynchroniczna (zwraca `Promise`) |
| `@typedef` / `@property` | definicja własnego typu obiektu i jego pól |
| `@example` | przykład użycia |
| `{@link nazwa}` | odnośnik do innego elementu dokumentacji |

**Korzyści:**
- edytory (VS Code, WebStorm, Cursor) pokazują opis i typy w podpowiedziach po najechaniu na funkcję,
- TypeScript potrafi sprawdzać typy w zwykłych plikach `.js` na podstawie JSDoc (`// @ts-check`),
- z komentarzy można wygenerować stronę HTML z dokumentacją: `npx jsdoc fetch-user-documented.js`.

W udokumentowanej wersji szczególnie wartościowe jest opisanie, że funkcja **nie rzuca błędu, tylko zwraca `null`** – tego nie widać na pierwszy rzut oka z sygnatury, a ma wpływ na kod wywołujący.
