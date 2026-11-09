# Zadanie 5: Wizualizacja ASCII Art

## Prompt 1

> Stwórz prosty diagram ASCII Art przedstawiający połączenie klienta, serwera aplikacji i bazy danych.

**Odpowiedź:**

```
+----------+        +------------------+        +---------------+
|  Klient  | -----> | Serwer aplikacji | -----> | Baza danych   |
+----------+        +------------------+        +---------------+
```

## Prompt 2

> Dodaj do diagramu opisy elementów i kierunki przepływu danych.

**Odpowiedź:**

```
 +-------------------+                +-----------------------+                +---------------------+
 |      KLIENT       |                |   SERWER APLIKACJI    |                |    BAZA DANYCH      |
 |-------------------|  1. żądanie    |-----------------------|  2. zapytanie  |---------------------|
 | przeglądarka /    |  HTTP(S)       | Node.js / Express     |  SQL           | PostgreSQL          |
 | aplikacja mobilna | =============> | - logika biznesowa    | =============> | - tabele: users,    |
 |                   |  GET /api/...  | - walidacja danych    |  SELECT ...    |   orders, products  |
 | wyświetla dane    |                | - autoryzacja (JWT)   |                | - indeksy, relacje  |
 | użytkownikowi     |  4. odpowiedź  |                       |  3. wynik      |                     |
 |                   | <============= |                       | <============= |                     |
 +-------------------+  JSON 200 OK   +-----------------------+  wiersze       +---------------------+
       port 443                              port 3000                              port 5432

 Przepływ danych:
   1. Klient wysyła żądanie HTTP(S) do serwera aplikacji (np. GET /api/users).
   2. Serwer weryfikuje żądanie i wysyła zapytanie SQL do bazy danych.
   3. Baza zwraca wynik zapytania (wiersze tabeli).
   4. Serwer przetwarza dane i odsyła klientowi odpowiedź w formacie JSON.
```
