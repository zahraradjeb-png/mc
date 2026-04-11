@echo off
REM Cree une jonction public\Frontend -> ..\Frontend (une seule fois, ou apres un clone Git)
set "TARGET=%~dp0..\Frontend"
set "LINK=%~dp0public\Frontend"
if exist "%LINK%" (
  echo OK: %LINK% existe deja.
  exit /b 0
)
mklink /J "%LINK%" "%TARGET%"
if errorlevel 1 (
  echo Echec mklink. Essayez d'executer ce fichier en administrateur.
  exit /b 1
)
echo Jonction creee. Ouvrez http://127.0.0.1:8000/ avec php artisan serve
