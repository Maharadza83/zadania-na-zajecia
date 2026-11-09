# Zadanie 3: Podstawowe formatowanie promptu

## Prompt 1 – niestrukturyzowany

> dockerfile node

**Odpowiedź:**

Oto przykładowy Dockerfile dla aplikacji Node.js:

```dockerfile
FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8080
CMD ["node", "index.js"]
```

Możesz go zbudować poleceniem `docker build -t my-node-app .` i uruchomić `docker run -p 8080:8080 my-node-app`.

## Prompt 2 – strukturyzowany

> Napisz prosty Dockerfile dla aplikacji Node.js, który:
> - używa Node 18 jako obrazu bazowego
> - kopiuje pliki package.json i package-lock.json
> - instaluje zależności
> - kopiuje resztę plików aplikacji
> - wystawia port 3000
> - uruchamia aplikację poleceniem "npm start"

**Odpowiedź:**

```dockerfile
# Obraz bazowy: Node.js 18
FROM node:18

# Katalog roboczy w kontenerze
WORKDIR /usr/src/app

# Kopiowanie plików z definicją zależności
COPY package.json package-lock.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie pozostałych plików aplikacji
COPY . .

# Port, na którym działa aplikacja
EXPOSE 3000

# Uruchomienie aplikacji
CMD ["npm", "start"]
```

Kopiowanie `package*.json` przed resztą kodu pozwala Dockerowi cache'ować warstwę z `npm install` – zależności instalują się ponownie tylko wtedy, gdy zmieni się `package.json` lub `package-lock.json`.

## Porównanie i wnioski

| | Prompt niestrukturyzowany | Prompt strukturyzowany |
|---|---|---|
| Wersja Node | `latest` (niedeterministyczna) | `18` – zgodnie z wymaganiem |
| Cache warstw | brak – `COPY . .` przed `npm install` | tak – najpierw `package*.json` |
| Port | 8080 (zgadnięty) | 3000 – zgodnie z wymaganiem |
| Uruchomienie | `node index.js` (zgadnięte) | `npm start` – zgodnie z wymaganiem |
| Komentarze | brak | każda instrukcja opisana |

- Przy krótkim prompcie model musi **zgadywać** szczegóły (wersję, port, plik startowy) i wybiera wartości domyślne, które mogą nie pasować do projektu.
- Prompt w formie listy wymagań działa jak **specyfikacja** – każdy punkt przekłada się na konkretną linię Dockerfile i łatwo zweryfikować, czy wynik jest kompletny.
- Strukturyzowany prompt dał wynik lepszy także pod kątem dobrych praktyk (cache warstw), choć o to nie prosiliśmy wprost – kolejność wymagań w prompcie podpowiedziała właściwą kolejność instrukcji.
- Wniosek: im dokładniej opisane wymagania, tym mniej poprawek trzeba robić ręcznie.
