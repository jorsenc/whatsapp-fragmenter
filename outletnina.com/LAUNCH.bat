@echo off
SETLOCAL EnableDelayedExpansion

echo ======================================================
echo   LAUNCHER - OUTLET NINA FILE EXPLORER
echo ======================================================

:: 1. Cerrar procesos de Node.js activos para liberar el puerto 8080
echo [1/3] Cerrando servidores activos...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% == 0 (
    echo    - Procesos de Node.js terminados correctamente.
) else (
    echo    - No se encontraron procesos de Node.js activos.
)

:: 2. Asegurar que el puerto 8080 esté libre
echo [2/3] Limpiando puerto 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 3. Arrancar la aplicación en una nueva ventana de consola
echo [3/3] Iniciando servidor de vigilancia...
start "Outlet Nina Server" cmd /c "npm install ws chokidar && node server.js"

:: Esperar unos segundos a que el servidor arranque antes de abrir el navegador
echo Abrindo navegador en 3 segundos...
timeout /t 3 >nul

:: Abrir el navegador predeterminado en la dirección del servidor
start http://localhost:8080

echo.
echo ======================================================
echo   SISTEMA INICIADO Y NAVEGADOR ABIERTO
echo ======================================================
echo.
pause
