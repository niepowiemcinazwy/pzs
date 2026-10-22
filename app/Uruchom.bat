@echo off
rem Uruchamia Team Environment (przy pierwszym uruchomieniu instaluje zaleznosci).
cd /d "%~dp0"
if not exist node_modules (
  echo Instaluje zaleznosci, to potrwa chwile...
  call npm install
)
call npm start
