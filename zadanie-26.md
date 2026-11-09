# Zadanie 26: Analiza i poprawa istniejącego Jenkinsfile

## Prompt

> Ten Jenkinsfile zawiera kilka błędów. Znajdź je i zaproponuj poprawioną wersję. Wyjaśnij, jakie były problemy i jak je naprawiłeś.

## Pliki

- [`Jenkinsfile-with-errors`](Jenkinsfile-with-errors) – oryginał z błędami,
- [`Jenkinsfile-fixed`](Jenkinsfile-fixed) – wersja poprawiona.

## Znalezione błędy

### 1. Literówka `stesp` zamiast `steps` (etap *Build*) – błąd składni
```groovy
stage('Build') {
    stesp {          // ❌
```
Jenkins podczas walidacji składni deklaratywnej zgłosi błąd (*Unknown stage section "stesp"* / *Expected one of "steps", "stages", or "parallel"*) i **pipeline nie uruchomi się wcale**.
**Poprawka:** `steps { ... }`.

### 2. `npm build` zamiast `npm run build` – błąd logiczny
`npm build` nie uruchamia skryptu `build` z `package.json` (w starszych wersjach npm było to wewnętrzne polecenie do budowania natywnych modułów, w npm 7+ zostało usunięte i kończy się błędem). Skrypty użytkownika uruchamia się przez `npm run <nazwa>`.
**Poprawka:** `sh 'npm run build'`.

### 3. Niezgodny tag obrazu przy `docker build` i `docker push`
```groovy
sh 'docker build -t myapp .'        // tag: myapp (= myapp:latest)
sh 'docker push myapp:latest'
```
Formalnie `myapp` to `myapp:latest`, ale nazwa **bez przestrzeni nazw rejestru** (`użytkownik/myapp` lub `rejestr.example.com/myapp`) oznacza push do `docker.io/library/myapp` – repozytorium oficjalnych obrazów, do którego nie mamy uprawnień → `denied: requested access to the resource is denied`.
**Poprawka:** pełna nazwa obrazu w zmiennej `IMAGE_NAME`, budowanie z dwoma tagami (numer builda + `latest`) i push obu.

### 4. Brak logowania do rejestru Docker
`docker push` wymaga uwierzytelnienia. W oryginale nie ma `docker login`, więc push się nie powiedzie (chyba że agent przypadkiem jest zalogowany – co samo w sobie jest złą praktyką).
**Poprawka:** `withCredentials(usernamePassword(...))` + `docker login --password-stdin` (hasło nie trafia do historii poleceń ani logów, Jenkins maskuje je w konsoli) oraz `docker logout` w sekcji `post`.

### 5. Kolejność dyrektyw `when` i `steps`
Dyrektywa `when` jest umieszczona po `steps`. Jenkins to akceptuje, ale zgodnie z konwencją i dokumentacją `when` zapisuje się **przed** `steps` – od razu widać, kiedy etap się wykona.
**Poprawka:** przeniesienie `when` na początek etapu.

### 6. Nazwa gałęzi `master` – do weryfikacji
Wiele repozytoriów (w tym domyślnie na GitHubie od 2020 r.) używa gałęzi `main`. Jeśli repozytorium ma `main`, etap *Deploy* **nigdy się nie wykona** i nie pojawi się żaden błąd. W poprawionej wersji pozostawiono `master` (zgodnie z oryginałem), ale należy to sprawdzić. Uwaga: `when { branch }` działa tylko w zadaniach typu *Multibranch Pipeline*.

### 7. Drobne usprawnienia
- `npm ci` zamiast `npm install` – powtarzalna instalacja z `package-lock.json`,
- tag obrazu z numerem builda – możliwość rollbacku,
- nazwy obrazu i poświadczeń w bloku `environment` – jedno miejsce konfiguracji.

## Podsumowanie

| # | Problem | Skutek | Typ |
|---|---|---|---|
| 1 | `stesp` | pipeline się nie uruchamia | składnia |
| 2 | `npm build` | etap Build kończy się błędem / nic nie buduje | logika |
| 3 | nazwa obrazu bez rejestru | push odrzucony (brak dostępu) | konfiguracja |
| 4 | brak `docker login` | push odrzucony (brak autoryzacji) | konfiguracja / bezpieczeństwo |
| 5 | `when` po `steps` | brak (czytelność) | konwencja |
| 6 | `master` vs `main` | deploy może się nigdy nie wykonać | do weryfikacji |
