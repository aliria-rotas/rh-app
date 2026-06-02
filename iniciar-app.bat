@echo off
REM Iniciar o app Aliria RH automaticamente
echo.
echo ====================================
echo   Iniciando Aliria RH
echo ====================================
echo.

cd /d "C:\Klissia - RH\rh-app"

echo Instalando dependências (se necessário)...
call npm install --silent

echo.
echo Iniciando servidor...
call npm run dev

pause
