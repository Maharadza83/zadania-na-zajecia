# Zadanie 27: Generowanie diagramu Mermaid dla potoku Jenkins

## Prompt

> Stwórz diagram Mermaid przedstawiający typowy pipeline CI/CD w Jenkinsie dla aplikacji webowej. Uwzględnij etapy: checkout kodu, budowanie, testowanie, analiza statyczna kodu, bezpieczeństwo, budowanie obrazu Docker, testy integracyjne, wdrożenie na środowisko staging i produkcja.

Kod diagramu: [`jenkins-pipeline.md`](jenkins-pipeline.md) – sprawdzony w Mermaid Live Editor (https://mermaid.live). GitHub renderuje go bezpośrednio w podglądzie pliku.

## Zależności między etapami pipeline'u

Diagram jest podzielony na dwie części: **CI** (czy kod jest poprawny?) i **CD** (czy można go bezpiecznie dostarczyć?). Każdy etap jest „bramką” – następny uruchamia się tylko wtedy, gdy poprzedni się powiódł.

1. **Checkout → Budowanie** – zależność twarda: nie da się zbudować aplikacji bez kodu. Checkout pobiera dokładnie ten commit, który wyzwolił pipeline, więc wszystkie kolejne etapy pracują na tej samej wersji.

2. **Budowanie → Testy / Analiza statyczna / Bezpieczeństwo** – te trzy etapy potrzebują zainstalowanych zależności i zbudowanego kodu, ale **nie zależą od siebie nawzajem**, dlatego wykonują się **równolegle** (`parallel` w Jenkinsfile) – skraca to czas pipeline'u.
   - *testy jednostkowe* sprawdzają poprawność logiki i generują raport pokrycia,
   - *analiza statyczna* (SonarQube, ESLint) wykrywa błędy, „code smells” i używa raportu pokrycia z testów,
   - *bezpieczeństwo* (npm audit, Snyk, skanowanie sekretów) sprawdza podatności w zależnościach.

3. **Quality Gate** – punkt synchronizacji: czeka na wyniki wszystkich trzech gałęzi. Jeśli którakolwiek nie spełnia progów (np. nieudany test, pokrycie < 80%, podatność krytyczna), pipeline się zatrzymuje. Zasada *fail fast* – nie marnujemy czasu na budowanie obrazu z wadliwego kodu.

4. **Quality Gate → Obraz Docker → Push** – obraz budujemy dopiero z kodu, który przeszedł kontrole. Obraz jest **niezmiennym artefaktem**: ten sam obraz (z tym samym tagiem) przechodzi przez wszystkie dalsze środowiska. Skan obrazu (Trivy) wykrywa podatności w systemie bazowym, których nie widać w skanie zależności npm.

5. **Push → Testy integracyjne** – testy integracyjne uruchamiają zbudowany obraz razem z zależnościami (baza danych, cache) w `docker compose`. Zależą od obrazu, bo testują to, co faktycznie zostanie wdrożone, a nie kod źródłowy.

6. **Testy integracyjne → Staging → Smoke/E2E** – staging jest kopią produkcji; wdrożenie tam ma sens dopiero po przejściu testów integracyjnych. Testy smoke/E2E na stagingu sprawdzają aplikację w realistycznym środowisku (konfiguracja, sieć, prawdziwe usługi).

7. **Staging → Akceptacja ręczna → Produkcja** – wdrożenie produkcyjne zależy od pomyślnego stagingu **i** decyzji człowieka (`input` w Jenkinsfile). To bramka biznesowa (Continuous Delivery). Usunięcie tego kroku zamienia proces w Continuous Deployment.

8. **Produkcja → Health check → Rollback** – po wdrożeniu sprawdzamy stan aplikacji. Jeśli health check nie przejdzie, automatyczny rollback przywraca poprzednią wersję obrazu – jest to możliwe właśnie dzięki unikalnym tagom obrazów z kroku 4.

**Ścieżki błędów:** każdy nieudany etap prowadzi do węzła *Build nieudany* i powiadomienia zespołu. Im wcześniej pipeline się zatrzyma, tym taniej – błąd znaleziony w testach jednostkowych kosztuje minuty, a na produkcji – realne straty.
