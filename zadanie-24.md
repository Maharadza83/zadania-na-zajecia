# Zadanie 24: Interpretacja danych wydajnościowych

## Dane wydajnościowe

```
Metryki serwera API (ostatnie 24h):
- Średni czas odpowiedzi: 230ms
- 95 percentyl czasu odpowiedzi: 450ms
- 99 percentyl czasu odpowiedzi: 1200ms
- Liczba zapytań: 15,000
- Liczba błędów 5xx: 120
- Użycie CPU: średnio 45%, max 80%
- Użycie pamięci: średnio 2.1GB, max 3.5GB (z 4GB dostępnych)
```

## Prompt

> Zinterpretuj te dane. Czy widzisz jakieś potencjalne problemy? Co sugerujesz, aby poprawić wydajność?

## Interpretacja

**Ruch:** 15 000 zapytań / 24 h ≈ **625 zapytań/h ≈ 0,17 zapytania/s**. To bardzo mały ruch – przy takim obciążeniu serwer z 4 GB RAM i średnio 45% CPU wykorzystuje zasoby **nieproporcjonalnie dużo**. Prawdopodobnie ruch nie jest równomierny (szczyty w godzinach pracy), ale nawet wtedy zużycie wydaje się wysokie.

**Czasy odpowiedzi:**
- średnio 230 ms i p95 = 450 ms – akceptowalnie, choć jak na API to raczej wolno (cel dla typowego API to < 200 ms p95),
- **p99 = 1200 ms** – ponad 2,5× więcej niż p95 i ponad 5× więcej niż średnia. Długi „ogon” rozkładu oznacza, że ok. 150 zapytań dziennie trwa powyżej 1,2 s. Typowe przyczyny: wolne zapytania do bazy (brak indeksów, N+1), pauzy garbage collectora, zimny cache, wywołania zewnętrznych usług, rywalizacja o zasoby w szczytach.

**Błędy:** 120 / 15 000 = **0,8% błędów 5xx**. To dużo – dla usług produkcyjnych typowy cel (SLO) to < 0,1%. Oznacza to błąd serwera dla mniej więcej co 125. zapytania.

**CPU:** średnio 45%, max 80% – jest jeszcze zapas, ale przy tak małym ruchu 45% sugeruje kosztowne operacje (np. serializacja dużych odpowiedzi, brak cache, synchroniczne obliczenia) lub procesy działające w tle.

**Pamięć:** średnio 2,1 GB, **max 3,5 GB z 4 GB (87,5%)** – to najpoważniejszy sygnał ostrzegawczy. Do granicy OOM zostaje tylko 0,5 GB. Duża różnica między średnią a maksimum może oznaczać:
- **wyciek pamięci** (stopniowy wzrost aż do restartu),
- jednorazowe ładowanie dużych zbiorów danych do pamięci (np. raport, eksport, zapytanie bez paginacji),
- presję na GC, która wydłuża czasy odpowiedzi.

## Zidentyfikowane problemy (od najważniejszego)

1. **Ryzyko wyczerpania pamięci** (87,5% w szczycie) – możliwe zabicie procesu przez OOM, co z kolei mogłoby tłumaczyć część błędów 5xx.
2. **Wysoki odsetek błędów 5xx (0,8%)**.
3. **Długi ogon opóźnień** (p99 = 1,2 s).
4. **Niska efektywność** – wysokie zużycie zasobów przy bardzo małym ruchu.

Hipoteza do sprawdzenia: wszystkie cztery objawy mogą mieć wspólną przyczynę – np. niektóre endpointy ładują duże ilości danych do pamięci → skok pamięci i CPU → pauzy GC (wolny p99) → przekroczenia timeoutów lub OOM (5xx).

## Rekomendacje

**Diagnoza (najpierw zmierzyć):**
- skorelować w czasie skoki pamięci, p99 i błędy 5xx (Grafana) – czy występują razem?
- rozbić metryki **per endpoint** – który endpoint odpowiada za p99 i błędy,
- przeanalizować logi błędów 5xx: timeouty, wyjątki, połączenia do bazy, restarty procesu,
- włączyć **slow query log** w bazie danych,
- zrobić heap snapshot / profilowanie pamięci w szczycie, sprawdzić trend pamięci w ciągu kilku dni (wyciek?),
- wdrożyć distributed tracing (OpenTelemetry, Jaeger), żeby zobaczyć, gdzie zapytanie spędza czas.

**Optymalizacja:**
- indeksy w bazie, eliminacja zapytań N+1, paginacja zamiast zwracania całych kolekcji,
- **cache** (Redis / cache w pamięci) dla często odczytywanych danych,
- streaming dużych odpowiedzi zamiast budowania ich w całości w pamięci,
- przeniesienie ciężkich zadań (raporty, eksporty) do kolejki i asynchronicznych workerów,
- timeouty, retry z backoffem i circuit breaker dla wywołań zewnętrznych,
- connection pooling do bazy danych.

**Infrastruktura i niezawodność:**
- tymczasowo zwiększyć RAM lub ustawić limity pamięci z zapasem, aby uniknąć OOM,
- uruchomić **co najmniej 2 instancje** za load balancerem – awaria lub restart jednej nie powoduje błędów 5xx,
- alerty: pamięć > 80%, p99 > 1 s, odsetek 5xx > 0,5%,
- określić SLO (np. p95 < 300 ms, 99,9% zapytań bez błędu) i regularnie je mierzyć,
- testy obciążeniowe (k6, JMeter), żeby sprawdzić, jak system zachowa się przy wzroście ruchu.
