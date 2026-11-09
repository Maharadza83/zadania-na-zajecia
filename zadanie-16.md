# Zadanie 16: Konwersja Bash do PowerShell

## Prompt

> Przekonwertuj ten skrypt bash na równoważny skrypt PowerShell dla Windows.

## Pliki

- [`backup-db.sh`](backup-db.sh) – oryginalny skrypt Bash,
- [`backup-db.ps1`](backup-db.ps1) – wygenerowany skrypt PowerShell.

Uruchomienie na Windows: `powershell -ExecutionPolicy Bypass -File .\backup-db.ps1` (wymaga `mysqldump` w zmiennej `PATH`).

## Główne różnice zaobserwowane w tym przykładzie

| Element | Bash | PowerShell |
|---|---|---|
| Zmienne | `DB_NAME="..."`, odwołanie `$DB_NAME` | `$DbName = "..."` – `$` zawsze, także przy przypisaniu |
| Data | `$(date +%Y%m%d_%H%M%S)` – zewnętrzne polecenie | `Get-Date -Format "yyyyMMdd_HHmmss"` – cmdlet, inny format wzorca |
| Ścieżki | `/var/backups/db`, łączenie przez `/` | `C:\Backups\db`, łączenie przez `Join-Path` |
| Test katalogu | `[ ! -d "$DIR" ]` | `-not (Test-Path -Path $Dir -PathType Container)` |
| Tworzenie katalogu | `mkdir -p` | `New-Item -ItemType Directory -Force` |
| Wypisywanie | `echo` | `Write-Host` (z opcją koloru) |
| Kompresja | `\| gzip` – zewnętrzne narzędzie | brak `gzip` w Windows – użyto klasy .NET `GZipStream` |
| Potoki | przesyłają **strumień bajtów/tekstu** | przesyłają **obiekty .NET**; przy danych binarnych potok może zmienić kodowanie, dlatego `mysqldump` zapisuje wprost do pliku (`--result-file`) |
| Kod wyjścia | `$?` (kod ostatniego polecenia – w potoku to kod `gzip`, nie `mysqldump`!) | `$LASTEXITCODE` dla programów zewnętrznych, `$?` dla cmdletów |
| Obsługa błędów | `if [ $? -eq 0 ]` | `try / catch / finally` i `throw` |
| Porównania | `-eq`, `-ne` w `[ ]` | `-eq`, `-ne` jako operatory języka |
| Interpolacja | `"${BACKUP_DIR}/${DB_NAME}_${DATE}"` | `"${DbName}_${Date}"` – podobnie, `${}` gdy po nazwie stoi znak `_` |
| Wywołanie programu | bezpośrednio `mysqldump ...` | operator wywołania `& mysqldump ...` |

**Ciekawa obserwacja:** konwersja ujawniła błąd w oryginalnym skrypcie – w Bashu `$?` po `mysqldump ... | gzip` zwraca kod wyjścia **`gzip`**, więc nieudany `mysqldump` (np. złe hasło) i tak wypisze „Backup zakończony sukcesem”. W Bashu poprawką jest `set -o pipefail`. Wersja PowerShell sprawdza kod `mysqldump` osobno.

**Podsumowanie:** Bash opiera się na tekście i małych zewnętrznych narzędziach (`date`, `mkdir`, `gzip`) łączonych potokami, PowerShell – na obiektach i bogatej bibliotece .NET oraz cmdletach w konwencji `Czasownik-Rzeczownik`. Skrypt PowerShell jest dłuższy, ale ma bardziej jawną obsługę błędów.
