# Zadanie 4: Określanie roli w promptach

## Prompt 1 – bez roli

> Jak rozwiązać problem z dużym zużyciem pamięci przez kontener Docker?

**Odpowiedź:**

1. Sprawdź zużycie pamięci poleceniem `docker stats`.
2. Ogranicz pamięć kontenera przy uruchamianiu: `docker run -m 512m moj-obraz`.
3. Zrestartuj kontener, jeśli pamięć rośnie z czasem.
4. Użyj mniejszego obrazu bazowego (np. `alpine`).
5. Sprawdź logi aplikacji (`docker logs`), czy nie ma w nich błędów.
6. Zoptymalizuj kod aplikacji, żeby zużywał mniej pamięci.

## Prompt 2 – z przypisaną rolą

> Jesteś doświadczonym DevOps Engineerem z 10-letnim doświadczeniem. Jak rozwiązać problem z dużym zużyciem pamięci przez kontener Docker?

**Odpowiedź:**

Zacząłbym od ustalenia, **czy to wyciek, czy po prostu źle dobrany limit**. Moje podejście krok po kroku:

**1. Diagnoza**
- `docker stats --no-stream` – bieżące `MEM USAGE / LIMIT`. Uwaga: wartość zawiera page cache, więc dla dokładnych danych patrzę na `memory.stat` w cgroup (`/sys/fs/cgroup/memory.stat` – pola `anon` vs `file`).
- Historia w czasie (Prometheus + cAdvisor, metryka `container_memory_working_set_bytes`) – liniowy wzrost bez spadków = wyciek; „piła” = normalne działanie GC.
- `docker inspect --format '{{.State.OOMKilled}}' <id>` i `dmesg | grep -i oom` – czy kontener był już zabijany przez OOM killera.

**2. Problemy specyficzne dla runtime'u**
- **JVM**: od Javy 10 JVM respektuje limity cgroup, ale ustawiam jawnie `-XX:MaxRAMPercentage=75`, bo heap to nie całe zużycie (metaspace, wątki, bufory direct).
- **Node.js**: `--max-old-space-size` dopasowany do limitu kontenera; heap snapshot przez `--inspect` i Chrome DevTools.
- **Python**: `tracemalloc`, `memray`; uwaga na liczbę workerów gunicorna – każdy to osobny proces z własną pamięcią.

**3. Limity i zabezpieczenia**
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1g
        reservations:
          memory: 512m
```
- Bez limitu jeden kontener może „zjeść” pamięć całego hosta i spowodować OOM w innych usługach.
- W Kubernetes: `requests` = typowe zużycie, `limits` = zapas ~20–30%; QoS `Guaranteed` dla krytycznych usług.

**4. Optymalizacja obrazu i procesu**
- Multi-stage build – w obrazie produkcyjnym tylko runtime, bez kompilatorów i narzędzi deweloperskich.
- Jeden proces na kontener, poprawny `init` (`--init` / `tini`), żeby nie gromadziły się procesy zombie.
- Pliki tymczasowe na `tmpfs` też liczą się do limitu pamięci – warto o tym pamiętać.

**5. Działania długofalowe**
- Alert przy np. 85% limitu, dashboard trendu zużycia pamięci.
- Test obciążeniowy (k6, JMeter) przed wydaniem, żeby wyłapać regresję pamięci.
- Restart jako „plaster” (np. `max-requests` w gunicornie) jest akceptowalny tymczasowo, ale wyciek trzeba znaleźć w kodzie.

## Obserwacje

- Odpowiedź **bez roli** jest poprawna, ale ogólna – lista ogólnych porad, które pasowałyby do każdego problemu.
- Odpowiedź **z rolą** ma strukturę procesu (diagnoza → przyczyna → naprawa → zapobieganie) i zawiera wiedzę ekspercką: rozróżnienie cache i pamięci anonimowej, flagi specyficzne dla JVM/Node/Pythona, OOMKilled, requests/limits w Kubernetes, monitoring.
- Rola zmienia też **ton** – model pisze w pierwszej osobie, jak praktyk, i zwraca uwagę na pułapki („heap to nie całe zużycie”).
- Wniosek: przypisanie roli to tani sposób na uzyskanie bardziej specjalistycznej odpowiedzi. Warto jednak zweryfikować konkretne flagi i komendy, bo im bardziej szczegółowa odpowiedź, tym więcej miejsc na ewentualny błąd.
