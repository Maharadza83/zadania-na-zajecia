# Zadanie 29: Generowanie szablonu konfiguracji Jenkins

## Prompt 1

> Wygeneruj szablon Jenkins Configuration as Code (JCasC) w formacie YAML, który konfiguruje:
> - podstawowe ustawienia Jenkins (liczba wykonawców, timeout)
> - globalny katalog narzędzi (Maven, Node.js, Docker)
> - podstawowe wtyczki
> - przykładowe zadanie typu pipeline

Wygenerowany plik: [`jenkins-casc.yaml`](jenkins-casc.yaml)

Zawartość szablonu:

| Sekcja | Co konfiguruje |
|---|---|
| `jenkins` | komunikat systemowy, **2 wykonawców** (`numExecutors`), quiet period, ponawianie checkoutu, lokalny użytkownik-administrator, autoryzacja, ochrona CSRF, globalne zmienne środowiskowe |
| `unclassified.location` | publiczny adres Jenkinsa i e-mail administratora |
| `credentials` | poświadczenia do Docker Hub (wartości ze zmiennych środowiskowych) |
| `tool` | automatyczna instalacja **Git, Maven 3.9, Node.js 20, Docker** |
| `jobs` | przykładowe zadanie `przykladowy-pipeline` (Job DSL) z pipeline'em deklaratywnym i **timeoutem 30 min** |

> **Wtyczki** nie są instalowane przez sam JCasC – JCasC konfiguruje już zainstalowane wtyczki. Listę wtyczek podaje się w pliku `plugins.txt` (poniżej).

## Prompt 2

> Wyjaśnij, jak używać tego pliku konfiguracyjnego z Jenkinsem. Podaj kroki instalacji i uruchomienia Jenkinsa z tym szablonem.

## Czym jest JCasC?

**Jenkins Configuration as Code** to wtyczka, która konfiguruje Jenkinsa na podstawie pliku YAML zamiast ręcznego „klikania” w interfejsie. Korzyści: konfiguracja jest w repozytorium (wersjonowanie, code review), nowy, identyczny serwer Jenkins można odtworzyć w kilka minut, łatwo utrzymać spójność środowisk.

## Kroki – uruchomienie w Dockerze (zalecane)

### 1. Struktura katalogu

```
jenkins/
├── Dockerfile
├── plugins.txt
├── jenkins-casc.yaml
└── docker-compose.yml
```

### 2. `plugins.txt` – lista wtyczek

```
configuration-as-code
job-dsl
workflow-aggregator
git
nodejs
docker-workflow
docker-commons
pipeline-maven
credentials-binding
timestamper
ws-cleanup
```

### 3. `Dockerfile` – obraz Jenkinsa z wtyczkami i konfiguracją

```dockerfile
FROM jenkins/jenkins:lts-jdk17

# Wyłączenie kreatora pierwszego uruchomienia – konfiguracja pochodzi z JCasC
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
ENV CASC_JENKINS_CONFIG=/var/jenkins_home/casc_configs/jenkins-casc.yaml

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY jenkins-casc.yaml /var/jenkins_home/casc_configs/jenkins-casc.yaml
```

### 4. `docker-compose.yml`

```yaml
services:
  jenkins:
    build: .
    ports:
      - "8080:8080"
      - "50000:50000"
    environment:
      JENKINS_ADMIN_ID: admin
      JENKINS_ADMIN_PASSWORD: ${JENKINS_ADMIN_PASSWORD}
      JENKINS_URL: http://localhost:8080/
      DOCKERHUB_USER: ${DOCKERHUB_USER}
      DOCKERHUB_TOKEN: ${DOCKERHUB_TOKEN}
    volumes:
      - jenkins_home:/var/jenkins_home
volumes:
  jenkins_home:
```

Sekrety umieść w pliku `.env` obok `docker-compose.yml` (i dodaj go do `.gitignore`):

```env
JENKINS_ADMIN_PASSWORD=silne-haslo
DOCKERHUB_USER=moj-login
DOCKERHUB_TOKEN=moj-token
```

### 5. Uruchomienie

```bash
docker compose up -d --build
docker compose logs -f jenkins     # w logach: "Configuration as Code ... applied"
```

### 6. Weryfikacja

1. Otwórz `http://localhost:8080` i zaloguj się jako `admin` (bez kreatora instalacji).
2. **Manage Jenkins → Configuration as Code** – widać ścieżkę do pliku; przycisk *View Configuration* pokazuje aktualną konfigurację w YAML.
3. **Manage Jenkins → Tools** – zdefiniowane Maven-3.9, NodeJS-20, Docker.
4. **Manage Jenkins → Credentials** – `dockerhub-credentials`.
5. Na stronie głównej – zadanie `przykladowy-pipeline`; uruchom je przez *Build Now*.

## Alternatywa – istniejąca instalacja Jenkinsa (bez Dockera)

1. Zainstaluj wtyczkę **Configuration as Code** (oraz pozostałe z `plugins.txt`) w *Manage Jenkins → Plugins*.
2. Skopiuj `jenkins-casc.yaml` na serwer, np. do `/var/lib/jenkins/casc_configs/`.
3. Ustaw zmienną środowiskową `CASC_JENKINS_CONFIG` na ścieżkę do pliku (np. w `systemctl edit jenkins` → `Environment="CASC_JENKINS_CONFIG=/var/lib/jenkins/casc_configs/jenkins-casc.yaml"`) oraz zmienne `JENKINS_ADMIN_ID`, `JENKINS_ADMIN_PASSWORD` itd.
4. Zrestartuj Jenkinsa lub w *Manage Jenkins → Configuration as Code* kliknij *Reload existing configuration*.

## Wskazówki

- Po zmianie pliku YAML konfigurację można przeładować bez restartu (*Reload existing configuration*).
- Najprostszy sposób na poprawny YAML: skonfiguruj coś ręcznie w interfejsie, a następnie wyeksportuj (*View Configuration*) i skopiuj odpowiedni fragment.
- Nigdy nie zapisuj haseł wprost w pliku – używaj zmiennych `${...}`, Docker secrets lub Vault.
- Zmiany wprowadzone ręcznie w interfejsie zostaną nadpisane przy kolejnym przeładowaniu JCasC – plik YAML jest jedynym źródłem prawdy.
