# Simple Task API

REST API do zarządzania zadaniami, napisane w **Node.js** z wykorzystaniem **Express** i **MongoDB**.

## Opis

Simple Task API pozwala użytkownikom tworzyć, przeglądać, aktualizować i usuwać zadania. Zadania można filtrować według statusu i priorytetu. Dostęp do API wymaga zalogowania – autoryzacja odbywa się za pomocą tokenów JWT.

### Główne funkcje

- ✅ CRUD zadań – tworzenie, odczytywanie, aktualizacja i usuwanie
- 🔍 Filtrowanie zadań według statusu (`todo`, `in-progress`, `done`) i priorytetu (`low`, `medium`, `high`)
- 🔐 Prosta autoryzacja użytkowników (rejestracja, logowanie, token JWT)

### Technologie

- Node.js 20+
- Express 4
- MongoDB 7 + Mongoose
- JSON Web Token (jsonwebtoken), bcrypt

## Instalacja

### Wymagania

- Node.js w wersji 20 lub nowszej
- MongoDB (lokalnie lub w Dockerze)

### Kroki

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/<uzytkownik>/simple-task-api.git
cd simple-task-api

# 2. Zainstaluj zależności
npm install

# 3. Skonfiguruj zmienne środowiskowe
cp .env.example .env
```

Plik `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/simple-task-api
JWT_SECRET=zmien-mnie-na-dlugi-losowy-ciag
JWT_EXPIRES_IN=1h
```

MongoDB w Dockerze (opcjonalnie):

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

## Użycie

```bash
npm run dev     # tryb deweloperski (nodemon, automatyczny restart)
npm start       # tryb produkcyjny
npm test        # testy
```

API jest dostępne pod adresem `http://localhost:3000/api`.

Przykład – rejestracja, logowanie i utworzenie zadania:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jan@example.com","password":"Haslo123!"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jan@example.com","password":"Haslo123!"}'
# => { "token": "eyJhbGciOi..." }

curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Napisać README","priority":"high"}'
```

## Endpointy API

### Autoryzacja

| Metoda | Endpoint | Opis | Wymaga tokenu |
|---|---|---|---|
| `POST` | `/api/auth/register` | Rejestracja nowego użytkownika | nie |
| `POST` | `/api/auth/login` | Logowanie, zwraca token JWT | nie |

### Zadania

| Metoda | Endpoint | Opis | Wymaga tokenu |
|---|---|---|---|
| `GET` | `/api/tasks` | Lista zadań zalogowanego użytkownika | tak |
| `GET` | `/api/tasks/:id` | Szczegóły zadania | tak |
| `POST` | `/api/tasks` | Utworzenie zadania | tak |
| `PUT` | `/api/tasks/:id` | Aktualizacja zadania | tak |
| `DELETE` | `/api/tasks/:id` | Usunięcie zadania | tak |

#### Filtrowanie – `GET /api/tasks`

| Parametr | Wartości | Przykład |
|---|---|---|
| `status` | `todo`, `in-progress`, `done` | `/api/tasks?status=done` |
| `priority` | `low`, `medium`, `high` | `/api/tasks?priority=high` |

Parametry można łączyć: `/api/tasks?status=todo&priority=high`.

#### Model zadania

```json
{
  "id": "665f1c2e8b3a4a0012ab34cd",
  "title": "Napisać README",
  "description": "Uzupełnić sekcję instalacji",
  "status": "todo",
  "priority": "high",
  "createdAt": "2025-05-19T10:15:32Z",
  "updatedAt": "2025-05-19T10:15:32Z"
}
```

### Kody odpowiedzi

| Kod | Znaczenie |
|---|---|
| `200` / `201` | Sukces / zasób utworzony |
| `204` | Usunięto (brak treści) |
| `400` | Niepoprawne dane wejściowe |
| `401` | Brak lub nieważny token |
| `404` | Zadanie nie istnieje |
| `500` | Błąd serwera |

## Licencja

MIT
