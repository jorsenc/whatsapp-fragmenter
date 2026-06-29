@echo off
echo Iniciando Workspace Explorer...
echo.

REM Matar procesos en el puerto 8080
echo Verificando puerto 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo Matando proceso: %%a
    taskkill /PID %%a /F 2>nul
)

REM Espera un momento
timeout /t 1 /nobreak

REM Inicia el servidor Node.js desde la carpeta .workspace_app
start cmd /k "cd /d "%~dp0.workspace_app" && node server.js"

REM Espera a que el servidor inicie
timeout /t 2 /nobreak

REM Abre el navegador
start http://localhost:8080

echo.
echo Workspace Explorer abierto en http://localhost:8080
echo Presiona Ctrl+C en la ventana del servidor para detener
