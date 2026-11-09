# Zadanie 9: Weryfikacja prostego YAML

## Prompt

> Czy ten plik YAML jest poprawny? Jeśli nie, popraw błędy.

## Oryginalny plik

```yaml
services:
  web:
    image: nginx
    ports:
      - "80:80"
  app:
    build: .
    ports
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD=password
```

## Znalezione błędy

1. **Brak dwukropka po `ports` w usłudze `app`** (linia 8)
   `ports` bez `:` nie jest kluczem – parser YAML traktuje to jako zwykły tekst, a następna linia z listą (`- "3000:3000"`) powoduje błąd składni (*could not find expected ':'*).

2. **Niepoprawny format `environment` w usłudze `db`** (linia 15)
   Pod kluczem `environment` zapisano `POSTGRES_PASSWORD=password` bez myślnika. To nie jest ani mapa (`KLUCZ: wartość`), ani lista (`- KLUCZ=wartość`) – YAML zinterpretuje to jako pojedynczy ciąg znaków, a Docker Compose zgłosi błąd, że `environment` musi być mapą lub listą.

3. (uwaga, nie błąd składni) **Brak przypiętych wersji obrazów** – `nginx` i `postgres` bez tagu oznaczają `latest`, co może zmienić działanie środowiska po aktualizacji obrazu. Hasło w pliku też najlepiej przenieść do pliku `.env`.

## Poprawiona wersja

```yaml
services:
  web:
    image: nginx:1.27
    ports:
      - "80:80"
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
```

Alternatywny poprawny zapis `environment` w formie listy:

```yaml
    environment:
      - POSTGRES_PASSWORD=password
```

Poprawność można sprawdzić poleceniem `docker compose config`, które parsuje plik i wyświetla wynikową konfigurację lub błąd.
