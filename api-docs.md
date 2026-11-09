# Dokumentacja API – Użytkownicy

## `GET /api/users`

Zwraca stronicowaną listę użytkowników. Opcjonalnie lista może zostać zawężona do użytkowników o określonej roli.

### Parametry zapytania (query string)

| Parametr | Typ | Wymagany | Domyślnie | Opis |
|---|---|---|---|---|
| `page` | integer | nie | `1` | Numer strony wyników (liczony od 1). |
| `limit` | integer | nie | `10` | Liczba wyników na stronę. Minimum `1`, maksimum `100`. |
| `role` | string | nie | – | Filtr według roli użytkownika, np. `admin`, `user`. |

### Przykładowe żądanie

```http
GET /api/users?page=2&limit=2&role=admin HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer <token>
```

```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/users?page=2&limit=2&role=admin"
```

### Przykładowa odpowiedź – `200 OK`

```json
{
  "data": [
    {
      "id": 17,
      "name": "Jan Kowalski",
      "email": "jan@example.com",
      "role": "admin",
      "createdAt": "2025-03-14T09:21:00Z"
    },
    {
      "id": 23,
      "name": "Anna Nowak",
      "email": "anna@example.com",
      "role": "admin",
      "createdAt": "2025-04-02T15:48:12Z"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 2,
    "totalItems": 5,
    "totalPages": 3
  }
}
```

| Pole | Typ | Opis |
|---|---|---|
| `data` | array | Lista użytkowników na bieżącej stronie (może być pusta). |
| `data[].id` | integer | Identyfikator użytkownika. |
| `data[].name` | string | Imię i nazwisko. |
| `data[].email` | string | Adres e-mail. |
| `data[].role` | string | Rola użytkownika. |
| `data[].createdAt` | string (ISO 8601) | Data utworzenia konta. |
| `pagination.page` | integer | Bieżąca strona. |
| `pagination.limit` | integer | Liczba wyników na stronę. |
| `pagination.totalItems` | integer | Łączna liczba użytkowników spełniających kryteria. |
| `pagination.totalPages` | integer | Łączna liczba stron. |

### Błędy

| Kod | Kiedy | Przykładowa odpowiedź |
|---|---|---|
| `400 Bad Request` | `page` lub `limit` nie jest dodatnią liczbą całkowitą albo `limit > 100` | `{ "error": "INVALID_PARAMETER", "message": "limit must be between 1 and 100" }` |
| `401 Unauthorized` | brak lub nieważny token | `{ "error": "UNAUTHORIZED", "message": "Missing or invalid token" }` |
| `500 Internal Server Error` | błąd po stronie serwera | `{ "error": "INTERNAL_ERROR", "message": "Unexpected error" }` |

### Uwagi

- Zapytanie o stronę spoza zakresu (np. `page=99`) zwraca `200 OK` z pustą tablicą `data`.
- Wyniki są sortowane rosnąco według `id`.
