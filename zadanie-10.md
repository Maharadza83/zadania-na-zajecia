# Zadanie 10: Generowanie prostego pliku .gitignore

## Prompt 1

> Stwórz plik .gitignore dla projektu Node.js, który używa Docker i przechowuje dane w lokalnej bazie MongoDB.

Wygenerowany plik zapisano jako [`.gitignore`](.gitignore).

## Prompt 2

> Dlaczego ważne jest ignorowanie tych plików?

## Wyjaśnienie

**`node_modules/`** – katalog z zależnościami potrafi mieć setki MB i dziesiątki tysięcy plików. Można go w każdej chwili odtworzyć z `package.json` i `package-lock.json` poleceniem `npm install` (lub `npm ci`). Commitowanie go zaśmieca historię, spowalnia klonowanie i powoduje konflikty, bo część pakietów zawiera binaria kompilowane pod konkretny system (np. Windows vs Linux w kontenerze).

**Logi (`*.log`, `npm-debug.log*`)** – powstają lokalnie, są różne u każdego programisty i nie mają wartości dla innych. Mogą też zawierać dane wrażliwe (tokeny, dane użytkowników).

**`coverage/`, `dist/`, `build/`** – to artefakty generowane automatycznie (raporty testów, zbudowany kod). Źródłem prawdy jest kod źródłowy; artefakty buduje pipeline CI/CD lub Dockerfile.

**`.env`, `.env.*`** – najważniejszy wpis z punktu widzenia bezpieczeństwa. Pliki `.env` zawierają hasła do bazy, klucze API, sekrety JWT. Raz wypchnięty sekret zostaje w historii Gita na zawsze (nawet po usunięciu pliku) i może zostać przechwycony przez boty skanujące GitHuba. Wyjątek `!.env.example` pozwala commitować szablon z nazwami zmiennych bez wartości.

**`docker-compose.override.yml`** – plik z lokalnymi nadpisaniami konfiguracji Compose (np. inne porty, montowanie katalogów), specyficzny dla maszyny danego programisty.

**Dane MongoDB (`data/`, `mongo-data/`, `dump/`)** – jeśli kontener MongoDB montuje wolumen do katalogu w projekcie, trafiają tam pliki binarne bazy (WiredTiger). Są duże, zmieniają się przy każdym zapisie, mogą zawierać dane osobowe, a ich commitowanie w trakcie działania bazy może dać uszkodzoną kopię. Do współdzielenia danych testowych lepiej używać skryptów seedujących.

**Pliki systemowe i IDE (`.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/`)** – zależą od systemu operacyjnego i edytora konkretnej osoby; nie dotyczą projektu.

**Podsumowanie:** w repozytorium powinien być tylko kod źródłowy i konfiguracja potrzebna do zbudowania projektu. Wszystko, co jest generowane, lokalne lub tajne, powinno być ignorowane – repo jest wtedy mniejsze, bezpieczniejsze i nie ma w nim konfliktów o pliki, które nikogo nie dotyczą.

> Uwaga: warto też dodać plik `.dockerignore` (z `node_modules`, `.env`, `.git`), żeby te pliki nie trafiały do kontekstu budowania obrazu.
