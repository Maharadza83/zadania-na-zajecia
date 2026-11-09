# Zadanie 14: Wyjaśnienie fragmentu logów

## Logi

```
May 19 10:15:32 server dockerd[1234]: time="2025-05-19T10:15:32.123456789Z" level=info msg="Container 78a2b3c4 health status changed from starting to healthy"
May 19 10:16:45 server dockerd[1234]: time="2025-05-19T10:16:45.987654321Z" level=info msg="Container 78a2b3c4 failed to connect to 172.17.0.3:5432: connection refused"
May 19 10:16:47 server dockerd[1234]: time="2025-05-19T10:16:47.246813579Z" level=warning msg="Container 78a2b3c4 health status changed from healthy to unhealthy"
```

## Prompt

> Co się dzieje w tych logach? Jakie problemy można zidentyfikować?

## Analiza

**Co się dzieje – oś czasu:**

| Czas | Zdarzenie | Znaczenie |
|---|---|---|
| 10:15:32 | `starting → healthy` | Kontener `78a2b3c4` uruchomił się i przeszedł healthcheck – aplikacja działa poprawnie. |
| 10:16:45 | `failed to connect to 172.17.0.3:5432: connection refused` | Po ok. 73 s kontener nie może połączyć się z usługą pod adresem `172.17.0.3` na porcie **5432** – to domyślny port **PostgreSQL**. `connection refused` oznacza, że host odpowiada, ale nic nie nasłuchuje na tym porcie. |
| 10:16:47 | `healthy → unhealthy` | 2 sekundy później healthcheck kontenera kończy się niepowodzeniem – aplikacja bez bazy przestaje działać poprawnie. |

**Zidentyfikowany problem:** aplikacja straciła połączenie z bazą danych PostgreSQL, przez co jej healthcheck zaczął zgłaszać stan `unhealthy`. Problem leży najprawdopodobniej **po stronie bazy**, a nie aplikacji.

**Możliwe przyczyny:**
1. **Kontener z bazą się zatrzymał lub zrestartował** (np. awaria, OOM kill, ręczne zatrzymanie) – w czasie restartu port 5432 nie przyjmuje połączeń.
2. **Zmiana adresu IP** – `172.17.0.x` to domyślna sieć `bridge`. Po restarcie kontener bazy mógł dostać inny adres, a aplikacja ma wpisany stały IP zamiast nazwy usługi.
3. PostgreSQL nasłuchuje tylko na `localhost` wewnątrz kontenera (`listen_addresses`) albo osiągnął limit połączeń.
4. Problem z siecią Dockera (np. kontenery w różnych sieciach).

**Kroki diagnostyczne:**

```bash
docker ps -a                                # czy kontener bazy działa? ile ma restartów?
docker logs <kontener_bazy> --since 10:15   # błędy PostgreSQL (np. "database system is shut down")
docker inspect <kontener_bazy> --format '{{.State.OOMKilled}} {{.RestartCount}}'
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <kontener_bazy>
docker inspect --format '{{json .State.Health}}' 78a2b3c4   # szczegóły healthchecku
```

**Rekomendacje:**
- używać **własnej sieci** Docker Compose i łączyć się po **nazwie usługi** (`postgres://db:5432`), a nie po adresie IP,
- `restart: unless-stopped` dla bazy i `depends_on` z `condition: service_healthy`,
- dodać healthcheck dla bazy (`pg_isready`),
- w aplikacji – mechanizm ponawiania połączenia (retry z backoffem), żeby krótka niedostępność bazy nie kończyła się awarią,
- monitoring/alerty na zmianę stanu `unhealthy`.
