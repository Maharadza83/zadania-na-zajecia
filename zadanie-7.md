# Zadanie 7: Wygenerowanie prostego skryptu Bash

## Prompt 1

> Napisz prosty skrypt bash, który sprawdza, czy usługa Docker działa, a jeśli nie - próbuje ją uruchomić.

Wygenerowany skrypt zapisano w pliku [`check_docker.sh`](check_docker.sh).

```bash
#!/bin/bash
# Skrypt sprawdza, czy usługa Docker działa, a jeśli nie - próbuje ją uruchomić.

if systemctl is-active --quiet docker; then
    echo "Docker działa."
    exit 0
fi

echo "Docker nie działa. Próbuję uruchomić..."
sudo systemctl start docker

sleep 3

if systemctl is-active --quiet docker; then
    echo "Docker został uruchomiony."
    exit 0
else
    echo "Nie udało się uruchomić Dockera. Sprawdź: sudo journalctl -u docker"
    exit 1
fi
```

## Prompt 2

> Wyjaśnij działanie tego skryptu linia po linii, tak jakbyś tłumaczył osobie początkującej.

**Wyjaśnienie:**

| Linia | Co robi |
|---|---|
| `#!/bin/bash` | Tzw. *shebang*. Mówi systemowi, że plik ma zostać wykonany przez interpreter Bash. |
| `# Skrypt sprawdza...` | Komentarz – wszystko po `#` jest ignorowane; służy tylko ludziom czytającym kod. |
| `if systemctl is-active --quiet docker; then` | `systemctl` zarządza usługami w Linuksie. `is-active docker` sprawdza, czy usługa `docker` działa. `--quiet` sprawia, że polecenie nic nie wypisuje – zwraca tylko kod wyjścia: `0` = działa, inna wartość = nie działa. `if` wykonuje blok po `then`, gdy kod wynosi `0`. |
| `echo "Docker działa."` | Wypisuje komunikat na ekran. |
| `exit 0` | Kończy skrypt z kodem `0`, czyli „sukces”. Dalsze linie nie zostaną wykonane. |
| `fi` | Zamyka blok `if` (to `if` napisane od tyłu). |
| `echo "Docker nie działa..."` | Do tej linii dochodzimy tylko wtedy, gdy Docker nie działał – informujemy o tym użytkownika. |
| `sudo systemctl start docker` | Próba uruchomienia usługi. `sudo` daje uprawnienia administratora (może poprosić o hasło), bo zwykły użytkownik nie może uruchamiać usług systemowych. |
| `sleep 3` | Czeka 3 sekundy, żeby Docker zdążył się uruchomić. |
| `if systemctl is-active --quiet docker; then` | Ponowne sprawdzenie – czy uruchomienie się powiodło. |
| `echo "Docker został uruchomiony."` / `exit 0` | Sukces – komunikat i kod `0`. |
| `else` | Blok wykonywany, gdy warunek `if` nie jest spełniony. |
| `echo "Nie udało się..."` | Informuje o porażce i podpowiada, gdzie szukać przyczyny (`journalctl` pokazuje logi usługi). |
| `exit 1` | Kończy skrypt z kodem `1` = błąd. Dzięki temu inne skrypty lub narzędzia (np. cron, CI) wiedzą, że coś poszło nie tak. |

**Jak uruchomić:**

```bash
chmod +x check_docker.sh   # nadanie prawa do wykonywania
./check_docker.sh          # uruchomienie
```

**Uwaga:** skrypt działa na dystrybucjach Linuksa z `systemd` (Ubuntu, Debian, Fedora). Na Windows/macOS z Docker Desktop usługa jest zarządzana inaczej.
