# Zadanie 25: Generowanie prostego Jenkinsfile

## Prompt 1

> Wygeneruj prosty Jenkinsfile dla aplikacji Node.js, który będzie zawierał etapy:
> - checkout kodu z repozytorium
> - instalacja zależności (npm install)
> - uruchomienie testów (npm test)
> - budowanie aplikacji (npm run build)
> - budowanie obrazu Docker
> - publikowanie obrazu do rejestru Docker
>
> Użyj składni deklaratywnej Jenkinsa.

Wygenerowany plik: [`Jenkinsfile`](Jenkinsfile)

## Prompt 2

> Wyjaśnij, co dokładnie dzieje się w każdym etapie tego Jenkinsfile i jakie są najlepsze praktyki przy tworzeniu pipeline'ów Jenkins.

## Struktura pliku

- **`pipeline { }`** – blok główny składni deklaratywnej.
- **`agent any`** – pipeline może działać na dowolnym dostępnym agencie (węźle) Jenkinsa.
- **`tools { nodejs 'NodeJS-20' }`** – Jenkins dodaje do `PATH` instalację Node.js o tej nazwie (wymaga wtyczki *NodeJS* i konfiguracji w *Manage Jenkins → Tools*).
- **`environment { }`** – zmienne dostępne we wszystkich etapach: nazwa obrazu, tag (= numer builda, dzięki czemu każdy build ma unikalny obraz) oraz ID poświadczeń do rejestru.
- **`options { }`** – ustawienia pipeline: limit czasu 30 min (zawieszony build nie blokuje agenta), przechowywanie 20 ostatnich buildów, zakaz równoległych buildów tej samej gałęzi, znaczniki czasu w logach.

## Etapy

| Etap | Co się dzieje |
|---|---|
| **Checkout** | `checkout scm` pobiera kod z repozytorium skonfigurowanego w zadaniu Jenkins (ta sama gałąź i commit, które wyzwoliły build). |
| **Install dependencies** | `npm install` instaluje zależności z `package.json` do `node_modules`. |
| **Test** | `npm test` uruchamia testy; niezerowy kod wyjścia przerywa pipeline. Sekcja `post { always { junit ... } }` publikuje raport testów w interfejsie Jenkinsa nawet wtedy, gdy testy nie przeszły. |
| **Build** | `npm run build` buduje wersję produkcyjną (np. transpilacja TypeScript, bundling) – wynik zwykle trafia do `dist/`. |
| **Build Docker image** | `docker.build(...)` (wtyczka *Docker Pipeline*) buduje obraz z `Dockerfile` w katalogu głównym i taguje go jako `nazwa:numer_builda`. |
| **Push Docker image** | Wykonywany **tylko dla gałęzi `main`** (`when { branch 'main' }`). `docker.withRegistry` loguje się do rejestru przy użyciu poświadczeń z Jenkins Credentials, a następnie publikuje obraz z tagiem numeru builda oraz `latest`. |

**Sekcja `post`** (po wszystkich etapach):
- `success` / `failure` – komunikaty (tu można dodać powiadomienia e-mail/Slack/Teams),
- `always` – usunięcie lokalnego obrazu (żeby nie zapełniać dysku agenta) i wyczyszczenie workspace (`cleanWs()`, wtyczka *Workspace Cleanup*).

## Najlepsze praktyki przy tworzeniu pipeline'ów Jenkins

1. **Pipeline as Code** – `Jenkinsfile` w repozytorium razem z kodem: wersjonowanie, code review, historia zmian.
2. **Składnia deklaratywna** zamiast skryptowej – czytelniejsza, walidowana przed uruchomieniem; `script { }` tylko tam, gdzie to konieczne.
3. **Sekrety tylko w Jenkins Credentials** – nigdy w `Jenkinsfile`; korzystanie z `withCredentials` / `withRegistry`, które maskują wartości w logach.
4. **`npm ci` zamiast `npm install`** w CI – instaluje dokładnie wersje z `package-lock.json`, jest szybsze i powtarzalne (w zadaniu użyto `npm install` zgodnie z poleceniem).
5. **Unikalne, niezmienne tagi obrazów** (numer builda, hash commita) – `latest` tylko jako dodatkowy tag; umożliwia to rollback do konkretnej wersji.
6. **Fail fast** – najszybsze etapy (lint, testy jednostkowe) na początku; nie budować obrazu, jeśli testy nie przeszły.
7. **Warunki `when`** – publikacja i wdrożenia tylko z gałęzi głównej lub tagów; dla Pull Requestów tylko build i testy.
8. **Timeouty i retencja buildów** – zawieszone buildy i stare artefakty nie zużywają zasobów.
9. **Izolowane, powtarzalne środowisko** – agenci w kontenerach (`agent { docker { image 'node:20' } }`) zamiast narzędzi instalowanych ręcznie na serwerze.
10. **Równoległość** – niezależne etapy (np. testy jednostkowe i lint) w bloku `parallel`, aby skrócić czas builda.
11. **Raporty i powiadomienia** – publikowanie wyników testów i pokrycia kodu, powiadomienia o nieudanych buildach.
12. **Shared Libraries** – wspólne fragmenty pipeline'ów dla wielu projektów w jednej bibliotece zamiast kopiowania kodu.
