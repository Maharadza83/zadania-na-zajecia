# Zadanie 19: Generowanie prostej dokumentacji

## Prompt

> Endpoint: GET /api/users
> Zwraca listę użytkowników.
> Parametry zapytania:
> - page: numer strony (domyślnie 1)
> - limit: liczba wyników na stronę (domyślnie 10, max 100)
> - role: opcjonalny filtr według roli użytkownika
>
> Stwórz dokumentację tego endpointu w formacie Markdown, zawierającą opis, parametry, przykładowe żądanie i odpowiedź.

Wygenerowana dokumentacja: [`api-docs.md`](api-docs.md)

## Refleksje na temat jakości dokumentacji

**Co wyszło dobrze:**
- Wszystkie wymagane sekcje są obecne: opis, parametry, przykładowe żądanie i odpowiedź.
- Parametry przedstawiono w czytelnej tabeli z typem, wartością domyślną i ograniczeniami – dokładnie według podanego opisu (`limit` max 100).
- Przykład żądania w dwóch formach (surowe HTTP i `curl`) – można go od razu skopiować i przetestować.
- Przykładowa odpowiedź jest spójna z żądaniem (`page=2`, `limit=2`, filtr `admin`), a pola odpowiedzi są opisane w osobnej tabeli.
- AI samo dodało sekcję błędów (400/401/500) i przypadek brzegowy (strona spoza zakresu) – to elementy, o których łatwo zapomnieć.

**Co wymaga weryfikacji / co zostało „wymyślone”:**
- Struktura odpowiedzi (`data` + `pagination`), pola użytkownika (`createdAt`), format błędów i wymaganie tokenu `Bearer` **nie wynikały z opisu** – AI je założyło. Wyglądają rozsądnie, ale muszą zostać porównane z rzeczywistą implementacją, inaczej dokumentacja wprowadzi w błąd.
- Nie wiadomo, jakie są dozwolone wartości `role` ani co się dzieje przy nieznanej roli (pusta lista czy błąd 400?).
- Sortowanie po `id` – również założenie.

**Wnioski:**
- AI świetnie generuje **szkielet i formę** dokumentacji – oszczędza dużo czasu na pisaniu tabel i przykładów.
- Ryzykiem jest to, że model „dopowiada” szczegóły, aby dokumentacja wyglądała kompletnie. Dokumentację trzeba zawsze sprawdzić z kodem lub, lepiej, generować ją ze specyfikacji (np. OpenAPI/Swagger), a AI używać do opisów i przykładów.
- Im więcej szczegółów (np. przykładowy JSON z prawdziwego API) podamy w prompcie, tym mniej model musi zgadywać.
