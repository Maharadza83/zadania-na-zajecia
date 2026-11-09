# Zadanie 2: Porównanie odpowiedzi różnych modeli

Prompt (taki sam dla obu modeli):

> Wymień 5 korzyści z używania kontenerów Docker w środowisku programistycznym.

## Odpowiedź modelu A – Claude Opus (model większy)

1. **Spójność środowisk („u mnie działa”)** – obraz Dockera zawiera system bazowy, biblioteki i konfigurację, więc aplikacja zachowuje się identycznie na komputerze każdego programisty, w CI i na produkcji. Znika klasa błędów wynikających z różnic wersji Node, Pythona czy bibliotek systemowych.
2. **Szybki onboarding** – nowa osoba w zespole uruchamia cały stos (aplikacja, baza danych, Redis, kolejka) jednym poleceniem `docker compose up`, zamiast przez pół dnia instalować i konfigurować zależności według README.
3. **Izolacja projektów** – każdy projekt ma własne kontenery z własnymi wersjami narzędzi. Można równolegle pracować nad projektem na PostgreSQL 12 i innym na PostgreSQL 16 bez konfliktów portów i bibliotek w systemie hosta.
4. **Lekkość i szybkość** – kontenery współdzielą jądro systemu hosta, więc startują w sekundy i zużywają znacznie mniej zasobów niż maszyny wirtualne. Warstwowe obrazy i cache budowania przyspieszają kolejne buildy.
5. **Łatwa integracja z CI/CD i produkcją** – ten sam obraz, który przetestowano lokalnie, trafia do rejestru, jest testowany w pipeline i wdrażany na Kubernetes. Wersjonowanie obrazów (tagi) ułatwia powtarzalne wdrożenia i szybki rollback.

**Przykład:**
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: dev
```

## Odpowiedź modelu B – Claude Haiku (model mniejszy, szybszy)

1. Takie samo środowisko na każdym komputerze.
2. Łatwa instalacja zależności – wszystko jest w obrazie.
3. Izolacja aplikacji od siebie.
4. Kontenery są lżejsze i szybsze niż maszyny wirtualne.
5. Łatwe wdrażanie i skalowanie aplikacji.

## Podsumowanie różnic

| Kryterium | Model A (większy) | Model B (mniejszy) |
|---|---|---|
| Długość | ok. 250 słów | ok. 40 słów |
| Szczegółowość | każdy punkt uzasadniony i rozwinięty | same hasła |
| Przykłady | konkretne (wersje PostgreSQL, `docker compose up`, plik YAML) | brak |
| Kontekst | odnosi się do pracy zespołowej, CI/CD, rollbacku | ogólnikowy |
| Czas odpowiedzi | dłuższy | bardzo szybki |

**Wnioski:** oba modele wskazały w zasadzie te same 5 korzyści, więc merytorycznie są zgodne. Większy model daje odpowiedź, którą można od razu wykorzystać w dokumentacji lub prezentacji, mniejszy nadaje się do szybkiego przypomnienia sobie pojęć. Do prostych pytań wystarczy model mniejszy, do wyjaśnień i nauki lepszy jest większy.
