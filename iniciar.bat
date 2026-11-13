@echo off
chcp 65001 >nul
REM AutoTaller Pro - arranque para Windows. Haz doble clic en este archivo.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js. Intentando instalarlo con winget...
  winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
  echo.
  echo Cierra esta ventana y vuelve a abrir este archivo para que Windows reconozca Node.js.
  echo Si no funciona, instalalo desde https://nodejs.org
  pause
  exit /b 1
)

node scripts\start.mjs
pause
