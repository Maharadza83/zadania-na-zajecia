# Zadanie 18: Analiza wymagań bezpieczeństwa

## Prompt 1

> Jakie są 5 kluczowych praktyk bezpieczeństwa dla aplikacji Dockerowych w środowisku produkcyjnym?

**Odpowiedź:**

1. **Uruchamianie kontenerów jako użytkownik bez uprawnień root** – domyślnie proces w kontenerze działa jako `root`. W razie przejęcia aplikacji lub podatności typu *container escape* atakujący ma wtedy znacznie większe możliwości. Należy tworzyć dedykowanego użytkownika (`USER`), odbierać zbędne uprawnienia (`cap_drop: ALL`) i blokować ich eskalację (`no-new-privileges`).
2. **Minimalne, zaufane i aktualne obrazy** – używanie oficjalnych obrazów z przypiętą wersją (`node:20-alpine`, a nie `latest`), obrazów `slim`/`alpine`/`distroless` oraz multi-stage build. Mniej pakietów = mniejsza powierzchnia ataku.
3. **Skanowanie obrazów pod kątem podatności** – narzędzia takie jak Trivy, Grype, Docker Scout lub Snyk w pipeline CI/CD; blokowanie wdrożenia przy podatnościach krytycznych, regularne przebudowywanie obrazów.
4. **Bezpieczne zarządzanie sekretami** – żadnych haseł w `Dockerfile`, w obrazie ani w zmiennych `ENV` zapisanych w repozytorium. Zamiast tego Docker/Kubernetes secrets, HashiCorp Vault lub menedżer sekretów chmury; `.env` w `.gitignore` i `.dockerignore`.
5. **Ograniczanie zasobów i izolacja sieci** – limity CPU/pamięci (ochrona przed DoS), system plików tylko do odczytu (`read_only: true`), wystawianie na zewnątrz tylko niezbędnych portów, osobne sieci dla frontendu i backendu (baza danych niedostępna z internetu), nigdy nie montować `/var/run/docker.sock`.

## Prompt 2 (uzupełniający)

> Jak mogę zaimplementować pierwszą z tych praktyk w moim Dockerfile i docker-compose.yml?

**Odpowiedź – uruchamianie jako użytkownik bez uprawnień root:**

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Zależności instalujemy jako root (potrzebny zapis do /app),
# ale pliki przypisujemy użytkownikowi "node"
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node . .

# Obraz node:alpine ma już użytkownika "node" (UID 1000).
# Dla innych obrazów bazowych można go utworzyć:
#   RUN addgroup -S app && adduser -S app -G app
USER node

# Port > 1024 – zwykły użytkownik nie może nasłuchiwać na portach < 1024
EXPOSE 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
services:
  app:
    build: .
    user: "1000:1000"            # wymuszenie UID:GID także przy nadpisaniu obrazu
    read_only: true              # system plików tylko do odczytu
    tmpfs:
      - /tmp                     # zapisywalny katalog tymczasowy
    cap_drop:
      - ALL                      # odebranie wszystkich uprawnień jądra (capabilities)
    security_opt:
      - no-new-privileges:true   # blokada eskalacji uprawnień (setuid/sudo)
    ports:
      - "3000:3000"
```

### Weryfikacja

```bash
docker compose up -d
docker compose exec app whoami     # powinno zwrócić: node
docker compose exec app id         # uid=1000(node) gid=1000(node)
```

### Na co uważać

- **Uprawnienia do wolumenów** – katalog montowany z hosta musi być zapisywalny dla UID 1000 (`chown 1000:1000 ./data`).
- **Porty < 1024** – zwykły użytkownik nie może ich otworzyć; aplikacja nasłuchuje na 3000, a mapowanie `80:3000` wykonuje Docker.
- **Kolejność w Dockerfile** – instrukcje po `USER` wykonują się jako ten użytkownik, więc instalację pakietów systemowych (`apk add`) wykonuje się przed `USER`.
- Dodatkowa warstwa ochrony: **rootless Docker** lub *user namespaces* (`userns-remap`), dzięki którym nawet root w kontenerze jest zwykłym użytkownikiem na hoście.
