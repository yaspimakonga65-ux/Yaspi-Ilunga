@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Installez Node.js LTS depuis https://nodejs.org puis relancez ce fichier.
 pause
 exit /b 1
)
start "" "http://localhost:4173/connexion.html"
node server.cjs
pause
