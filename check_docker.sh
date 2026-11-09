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
