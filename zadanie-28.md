# Zadanie 28: Skrypt do zarządzania zadaniami Jenkins

## Prompt 1

> Napisz skrypt w Pythonie, który używa Jenkins API do:
> - listowania wszystkich zadań (jobs)
> - sprawdzania statusu ostatnich buildów
> - uruchamiania wybranego zadania
>
> Uwzględnij obsługę autoryzacji i obsługę błędów.

Wygenerowany skrypt: [`jenkins-manager.py`](jenkins-manager.py)

## Prompt 2

> Wyjaśnij, jak działa ten skrypt i jakich bibliotek używa do komunikacji z Jenkins API. Podaj również przykładowe polecenia, jak używać tego skryptu.

## Jak działa skrypt

Jenkins udostępnia **REST API** – do niemal każdej strony w interfejsie można dopisać `/api/json`, aby otrzymać jej dane w formacie JSON. Skrypt korzysta z tego mechanizmu.

### Biblioteki

| Biblioteka | Rola |
|---|---|
| **`requests`** (zewnętrzna) | wysyłanie żądań HTTP do Jenkins API; obiekt `Session` przechowuje dane logowania i utrzymuje połączenie dla kolejnych żądań |
| `argparse` | obsługa argumentów wiersza poleceń i podkomend (`list`, `status`, `build`) |
| `os` | odczyt zmiennych środowiskowych z danymi logowania |
| `urllib.parse.quote` | kodowanie nazw zadań w URL (spacje, znaki specjalne) |
| `time`, `sys` | formatowanie dat, oczekiwanie w pętli, kody wyjścia |

Alternatywą jest gotowa biblioteka **`python-jenkins`** (`pip install python-jenkins`), która opakowuje API w metody typu `server.get_jobs()`, `server.build_job()`. Tutaj użyto czystego `requests`, żeby było widać, jak wyglądają wywołania API.

### Klasa `JenkinsClient`

- **Autoryzacja** – HTTP Basic Auth z parą *użytkownik + API token* (`session.auth`). API token jest bezpieczniejszy niż hasło: można go w każdej chwili unieważnić i nie daje dostępu do logowania w interfejsie. Dane są pobierane z argumentów lub zmiennych środowiskowych, dzięki czemu nie trzeba ich zapisywać w skrypcie.
- **`_request()`** – jedno miejsce obsługi błędów: brak połączenia, timeout, kody `401` (zła autoryzacja), `403` (brak uprawnień), `404` (brak zadania) i inne błędy HTTP są zamieniane na czytelny wyjątek `JenkinsError`.
- **`_job_path()`** – zamienia nazwę `folder/moj-job` na ścieżkę API `/job/folder/job/moj-job` (zadania w folderach).
- **`_crumb_headers()`** – pobiera token CSRF (*crumb*) z `/crumbIssuer/api/json`. Jest potrzebny dla żądań `POST`, jeśli Jenkins ma włączoną ochronę CSRF.

### Operacje

| Funkcja | Endpoint API | Opis |
|---|---|---|
| `list_jobs()` | `GET /api/json?tree=jobs[...]` | Lista zadań. Parametr `tree` ogranicza odpowiedź tylko do potrzebnych pól (szybciej, mniej danych). Foldery są przeszukiwane rekurencyjnie (do 3 poziomów). Pole `color` opisuje stan: `blue` = sukces, `red` = błąd, sufiks `_anime` = build w trakcie. |
| `last_build()` | `GET /job/<nazwa>/api/json?tree=lastBuild[...]` | Numer, wynik (`SUCCESS`/`FAILURE`/`UNSTABLE`/`ABORTED`), czas startu i trwania ostatniego buildu. |
| `trigger_build()` | `POST /job/<nazwa>/build` lub `/buildWithParameters` | Uruchamia zadanie. Jenkins odpowiada `201` i nagłówkiem `Location` z adresem elementu w **kolejce** (build nie dostaje numeru od razu). |
| `wait_for_queue()` | `GET /queue/item/<id>/api/json` | Odpytuje kolejkę, dopóki zadanie nie zostanie przydzielone do wykonawcy i nie dostanie numeru buildu. |

Funkcja `main()` zwraca kod wyjścia `0` (sukces) lub `1` (błąd), dzięki czemu skrypt może być używany w innych skryptach i pipeline'ach.

## Przykłady użycia

Instalacja zależności i konfiguracja:

```bash
pip install requests

export JENKINS_URL=http://localhost:8080
export JENKINS_USER=admin
export JENKINS_TOKEN=<twój_api_token>
```

(Windows PowerShell: `$env:JENKINS_URL = "http://localhost:8080"` itd.)

```bash
# Lista wszystkich zadań
python jenkins-manager.py list
# moja-aplikacja                                     SUCCESS
# backend/api-service                                FAILURE
# frontend/web                                       SUCCESS (w trakcie)

# Status ostatnich buildów wszystkich zadań
python jenkins-manager.py status

# Status ostatniego buildu jednego zadania
python jenkins-manager.py status backend/api-service
# backend/api-service                                #42    FAILURE    start: 2025-05-19 10:15:32  czas: 87s

# Uruchomienie zadania
python jenkins-manager.py build moja-aplikacja

# Uruchomienie z parametrami i oczekiwaniem na numer buildu
python jenkins-manager.py build moja-aplikacja -p BRANCH=develop -p DEPLOY=true --wait

# Dane logowania w argumentach zamiast zmiennych środowiskowych
python jenkins-manager.py --url https://jenkins.firma.pl --user jan --token <token> list

# Pomoc
python jenkins-manager.py --help
python jenkins-manager.py build --help
```

**Uwagi bezpieczeństwa:** tokenu nie należy zapisywać w repozytorium ani w historii poleceń powłoki (lepiej użyć zmiennych środowiskowych lub menedżera sekretów); opcja `--insecure` wyłącza weryfikację certyfikatu SSL i powinna być używana tylko w środowisku testowym.
