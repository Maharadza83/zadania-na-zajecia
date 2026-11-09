#!/usr/bin/env python3
"""
jenkins-manager.py - proste narzędzie CLI do zarządzania zadaniami Jenkins przez REST API.

Funkcje:
  list                 - lista wszystkich zadań (jobs), także w folderach
  status [JOB]         - status ostatniego buildu wszystkich zadań lub wybranego zadania
  build JOB [-p K=V]   - uruchomienie zadania (opcjonalnie z parametrami)

Autoryzacja: nazwa użytkownika + API token (Jenkins -> użytkownik -> Configure -> API Token).
Dane można podać w argumentach lub w zmiennych środowiskowych:
  JENKINS_URL, JENKINS_USER, JENKINS_TOKEN

Wymagania: pip install requests
"""

import argparse
import os
import sys
import time
from urllib.parse import quote

try:
    import requests
except ImportError:
    sys.exit("Brak biblioteki 'requests'. Zainstaluj: pip install requests")


class JenkinsError(Exception):
    """Błąd komunikacji z Jenkins API."""


class JenkinsClient:
    def __init__(self, url, user, token, timeout=15, verify_ssl=True):
        self.base_url = url.rstrip("/")
        self.session = requests.Session()
        self.session.auth = (user, token)
        self.session.verify = verify_ssl
        self.timeout = timeout

    # ---------- niskopoziomowe ----------

    def _request(self, method, path, **kwargs):
        url = f"{self.base_url}{path}"
        try:
            response = self.session.request(method, url, timeout=self.timeout, **kwargs)
        except requests.exceptions.ConnectionError:
            raise JenkinsError(f"Nie można połączyć się z {self.base_url}")
        except requests.exceptions.Timeout:
            raise JenkinsError(f"Przekroczono czas oczekiwania ({self.timeout}s) na {url}")
        except requests.exceptions.RequestException as exc:
            raise JenkinsError(f"Błąd żądania: {exc}")

        if response.status_code == 401:
            raise JenkinsError("Błąd autoryzacji (401) - sprawdź użytkownika i API token")
        if response.status_code == 403:
            raise JenkinsError("Brak uprawnień (403) do tej operacji")
        if response.status_code == 404:
            raise JenkinsError(f"Nie znaleziono zasobu (404): {path}")
        if not response.ok:
            raise JenkinsError(f"HTTP {response.status_code}: {response.text[:200]}")
        return response

    @staticmethod
    def _job_path(job_name):
        # "folder/podfolder/job" -> "/job/folder/job/podfolder/job/job"
        return "".join(f"/job/{quote(part, safe='')}" for part in job_name.strip("/").split("/"))

    def _crumb_headers(self):
        """Pobiera token CSRF (crumb), jeśli Jenkins ma włączoną ochronę CSRF."""
        try:
            data = self._request("GET", "/crumbIssuer/api/json").json()
            return {data["crumbRequestField"]: data["crumb"]}
        except JenkinsError:
            # Przy uwierzytelnianiu API tokenem crumb zwykle nie jest wymagany
            return {}

    # ---------- operacje ----------

    def list_jobs(self):
        """Zwraca listę wszystkich zadań, rekurencyjnie przeszukując foldery."""
        tree = "jobs[name,url,color,_class,jobs[name,url,color,_class,jobs[name,url,color,_class]]]"
        data = self._request("GET", "/api/json", params={"tree": tree}).json()

        result = []

        def walk(jobs, prefix=""):
            for job in jobs or []:
                full_name = f"{prefix}{job['name']}"
                if "jobs" in job:  # folder / multibranch
                    walk(job["jobs"], prefix=f"{full_name}/")
                else:
                    result.append({"name": full_name, "color": job.get("color", "")})

        walk(data.get("jobs"))
        return result

    def last_build(self, job_name):
        """Zwraca informacje o ostatnim buildzie zadania lub None, jeśli nie było buildów."""
        tree = "lastBuild[number,result,building,timestamp,duration,url]"
        data = self._request("GET", f"{self._job_path(job_name)}/api/json", params={"tree": tree}).json()
        return data.get("lastBuild")

    def trigger_build(self, job_name, params=None):
        """Uruchamia zadanie. Zwraca URL elementu w kolejce."""
        endpoint = "buildWithParameters" if params else "build"
        response = self._request(
            "POST",
            f"{self._job_path(job_name)}/{endpoint}",
            params=params or None,
            headers=self._crumb_headers(),
        )
        return response.headers.get("Location")

    def wait_for_queue(self, queue_url, poll=2, max_wait=60):
        """Czeka, aż zadanie opuści kolejkę, i zwraca numer buildu."""
        path = queue_url.replace(self.base_url, "").rstrip("/") + "/api/json"
        deadline = time.time() + max_wait
        while time.time() < deadline:
            item = self._request("GET", path).json()
            if item.get("cancelled"):
                raise JenkinsError("Zadanie zostało anulowane w kolejce")
            executable = item.get("executable")
            if executable:
                return executable.get("number")
            time.sleep(poll)
        return None


# ---------- formatowanie ----------

COLOR_STATUS = {
    "blue": "SUCCESS", "green": "SUCCESS", "red": "FAILURE", "yellow": "UNSTABLE",
    "aborted": "ABORTED", "notbuilt": "NOT BUILT", "disabled": "DISABLED",
}


def describe_color(color):
    running = color.endswith("_anime")
    status = COLOR_STATUS.get(color.replace("_anime", ""), color or "-")
    return f"{status} (w trakcie)" if running else status


def format_build(build):
    if not build:
        return "brak buildów"
    result = "W TRAKCIE" if build.get("building") else (build.get("result") or "?")
    started = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(build["timestamp"] / 1000))
    duration = f"{build.get('duration', 0) / 1000:.0f}s"
    return f"#{build['number']:<5} {result:<10} start: {started}  czas: {duration}"


# ---------- CLI ----------

def parse_args():
    parser = argparse.ArgumentParser(description="Zarządzanie zadaniami Jenkins przez REST API")
    parser.add_argument("--url", default=os.getenv("JENKINS_URL"), help="adres Jenkinsa (JENKINS_URL)")
    parser.add_argument("--user", default=os.getenv("JENKINS_USER"), help="użytkownik (JENKINS_USER)")
    parser.add_argument("--token", default=os.getenv("JENKINS_TOKEN"), help="API token (JENKINS_TOKEN)")
    parser.add_argument("--insecure", action="store_true", help="nie weryfikuj certyfikatu SSL")

    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("list", help="lista wszystkich zadań")

    p_status = sub.add_parser("status", help="status ostatnich buildów")
    p_status.add_argument("job", nargs="?", help="nazwa zadania (np. folder/moj-job); domyślnie wszystkie")

    p_build = sub.add_parser("build", help="uruchom zadanie")
    p_build.add_argument("job", help="nazwa zadania")
    p_build.add_argument("-p", "--param", action="append", default=[], metavar="KLUCZ=WARTOŚĆ",
                         help="parametr buildu (można podać wiele razy)")
    p_build.add_argument("--wait", action="store_true", help="poczekaj na przydzielenie numeru buildu")

    args = parser.parse_args()
    missing = [name for name in ("url", "user", "token") if not getattr(args, name)]
    if missing:
        parser.error("brak wymaganych danych: " + ", ".join(missing) +
                     " (podaj argumenty lub ustaw JENKINS_URL / JENKINS_USER / JENKINS_TOKEN)")
    return args


def main():
    args = parse_args()
    client = JenkinsClient(args.url, args.user, args.token, verify_ssl=not args.insecure)

    try:
        if args.command == "list":
            jobs = client.list_jobs()
            if not jobs:
                print("Brak zadań.")
            for job in jobs:
                print(f"{job['name']:<50} {describe_color(job['color'])}")

        elif args.command == "status":
            names = [args.job] if args.job else [j["name"] for j in client.list_jobs()]
            for name in names:
                print(f"{name:<50} {format_build(client.last_build(name))}")

        elif args.command == "build":
            params = {}
            for item in args.param:
                if "=" not in item:
                    raise JenkinsError(f"Niepoprawny parametr '{item}' - oczekiwano KLUCZ=WARTOŚĆ")
                key, value = item.split("=", 1)
                params[key] = value

            queue_url = client.trigger_build(args.job, params)
            print(f"Zadanie '{args.job}' dodane do kolejki: {queue_url}")
            if args.wait and queue_url:
                number = client.wait_for_queue(queue_url)
                print(f"Uruchomiono build #{number}" if number else "Zadanie nadal czeka w kolejce.")

    except JenkinsError as exc:
        print(f"BŁĄD: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nPrzerwano.", file=sys.stderr)
        return 130
    return 0


if __name__ == "__main__":
    sys.exit(main())
