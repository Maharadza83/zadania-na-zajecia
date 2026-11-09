# Zadanie 22: Generowanie README dla projektu

## Prompt

> Nazwa projektu: Simple Task API
> Opis: REST API do zarządzania zadaniami, napisane w Node.js z Express i MongoDB.
> Główne funkcje:
> - Tworzenie, odczytywanie, aktualizacja i usuwanie zadań
> - Filtrowanie zadań według statusu i priorytetów
> - Prostą autoryzację użytkowników
>
> Stwórz prosty plik README.md dla tego projektu, zawierający sekcje: opis, instalacja, użycie, endpointy API.

Wygenerowany plik: [`project-readme.md`](project-readme.md)

## Uwagi dotyczące jakości wygenerowanej dokumentacji

**Mocne strony:**
- Zawiera wszystkie wymagane sekcje (opis, instalacja, użycie, endpointy API) w logicznej kolejności.
- Instalacja jest opisana krok po kroku i daje się wykonać „kopiuj–wklej”: klonowanie, `npm install`, przykładowy `.env`, a nawet uruchomienie MongoDB w Dockerze.
- Endpointy w tabelach z informacją, czy wymagany jest token – szybki przegląd całego API.
- Praktyczny przykład z `curl` pokazujący pełny scenariusz: rejestracja → logowanie → użycie tokenu.
- Opisany model danych i kody odpowiedzi HTTP.

**Słabe strony / co trzeba poprawić:**
- **Wiele szczegółów zostało wymyślonych**: wersje (Node 20, Express 4, MongoDB 7), JWT + bcrypt, wartości statusów (`todo`, `in-progress`, `done`) i priorytetów, skrypty `npm run dev`, licencja MIT, adres repozytorium. W opisie było tylko „prosta autoryzacja” – to mogła być np. sesja lub klucz API. Przed publikacją trzeba to zsynchronizować z kodem.
- W sekcji „Licencja” AI arbitralnie wybrało MIT – to decyzja właściciela projektu, nie dokumentacji.
- Brakuje sekcji, które przydają się w prawdziwym projekcie: struktura katalogów, uruchamianie w Docker Compose, jak współtworzyć (contributing), link do pełnej specyfikacji (Swagger/OpenAPI).
- Brak informacji o paginacji listy zadań – przy dużej liczbie zadań to istotne.

**Wniosek:** jako punkt startowy README jest bardzo dobre – oszczędza czas na formatowaniu i pamięta o elementach, które łatwo pominąć (`.env`, przykłady `curl`, kody błędów). Jest jednak „zbyt pewne siebie” – przedstawia założenia jako fakty. Dokumentację wygenerowaną przez AI należy traktować jak szkic do weryfikacji, najlepiej podając w prompcie rzeczywisty `package.json` i pliki z routingiem, aby model opisywał istniejący kod, a nie wyobrażony.
