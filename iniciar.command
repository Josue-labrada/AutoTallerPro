#!/bin/bash
# AutoTaller Pro - arranque para macOS. Haz doble clic en este archivo.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "No se encontró Node.js."
  if command -v brew >/dev/null 2>&1; then
    echo "Instalando Node.js con Homebrew..."
    brew install node || { echo "No se pudo instalar Node.js. Instálalo desde https://nodejs.org"; read -r -p "Presiona Enter para cerrar..."; exit 1; }
  else
    echo "Instálalo desde https://nodejs.org (versión LTS) y vuelve a abrir este archivo."
    read -r -p "Presiona Enter para cerrar..."
    exit 1
  fi
fi

node scripts/start.mjs
status=$?
read -r -p "Presiona Enter para cerrar..."
exit $status
