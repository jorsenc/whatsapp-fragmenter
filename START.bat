@echo off
echo Iniciando Workspace Explorer...
echo.

REM Inicia el servidor Node.js desde la carpeta .workspace_app
start cmd /k "cd /d "%~dp0.workspace_app" && node server.js"

REM Espera un segundo para que el servidor inicie
timeout /t 2 /nobreak

REM Abre el navegador
start http://localhost:8080

echo.
echo Workspace Explorer abierto en http://localhost:8080
echo Presiona Ctrl+C en la ventana del servidor para detener
