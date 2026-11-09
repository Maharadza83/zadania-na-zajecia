# Zadanie 8: Analiza krótkiego błędu

## Komunikat błędu

```
ERROR: for app  Cannot start service app: driver failed programming external connectivity on endpoint app (172.18.0.2): Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

## Prompt

> Co oznacza ten błąd i jak mogę go rozwiązać?

## Wyjaśnienie

Docker Compose próbował uruchomić usługę `app` i przekierować port **3000 hosta** na port kontenera (`ports: "3000:3000"`). Aby to zrobić, Docker musi „nasłuchiwać” na porcie `0.0.0.0:3000` na Twoim komputerze. Operacja `bind` się nie powiodła, bo **port 3000 jest już zajęty przez inny proces** (`address already in use`). Sam kontener działa poprawnie (dostał adres 172.18.0.2) – problemem jest wyłącznie publikacja portu na hoście.

Najczęstsze przyczyny:
- lokalnie uruchomiona aplikacja (np. `npm start` / `npm run dev`) już działa na porcie 3000,
- inny kontener (np. z poprzedniego uruchomienia lub innego projektu) publikuje port 3000,
- inna usługa systemowa (np. Grafana domyślnie używa portu 3000).

## Rozwiązania

**1. Znajdź proces, który zajmuje port**

```bash
# Linux / macOS
sudo lsof -i :3000
sudo ss -ltnp | grep :3000

# Windows (PowerShell)
netstat -ano | findstr :3000
Get-Process -Id <PID>
```

**2. Sprawdź, czy port nie jest zajęty przez inny kontener**

```bash
docker ps --filter "publish=3000"
docker stop <id_kontenera>
```

**3. Zatrzymaj proces, który zajmuje port**

```bash
kill <PID>                    # Linux / macOS
Stop-Process -Id <PID>        # Windows
```

**4. Albo zmień port na hoście w `docker-compose.yml`**

```yaml
services:
  app:
    ports:
      - "3001:3000"   # host:kontener – aplikacja dostępna pod localhost:3001
```

**5. Posprzątaj stare kontenery i uruchom ponownie**

```bash
docker compose down
docker compose up -d
```

Jeśli żaden proces nie zajmuje portu, a błąd nadal występuje, pomaga restart Dockera (`sudo systemctl restart docker` lub restart Docker Desktop) – czasem po awarii zostaje „wiszący” proces `docker-proxy`.
