@ECHO OFF
REM ============================================
REM  WhatsApp Chat Fragmenter - START
REM  Launcher para CLI y Web App
REM ============================================

SETLOCAL ENABLEDELAYEDEXPANSION

REM Colores para la consola
FOR /F %%A IN ('ECHO PROMPT $H ^| CMD') DO SET "BS=%%A"

TITLE WhatsApp Chat Fragmenter

REM Verificar Node.js
ECHO.
ECHO [*] Verificando Node.js...
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Node.js no instalado. Descargalo de: https://nodejs.org
    PAUSE
    EXIT /B 1
)

FOR /F "tokens=*" %%I IN ('node -v') DO SET NODE_VERSION=%%I
ECHO [OK] Node.js encontrado: !NODE_VERSION!

REM Verificar node_modules
IF NOT EXIST "node_modules" (
    ECHO.
    ECHO [*] Instalando dependencias...
    CALL npm install
    IF %ERRORLEVEL% NEQ 0 (
        ECHO [ERROR] Fallo al instalar dependencias
        PAUSE
        EXIT /B 1
    )
    ECHO [OK] Dependencias instaladas
)

REM Menu principal
:MENU
ECHO.
ECHO ============================================
ECHO  WhatsApp Chat Fragmenter v1.0.0
ECHO ============================================
ECHO.
ECHO Opciones:
ECHO   1. CLI Mode - Procesar archivo desde terminal
ECHO   2. Web Mode - Abrir interfaz web
ECHO   3. Ver Ayuda
ECHO   4. Salir
ECHO.

SET /P OPCION="Selecciona opcion (1-4): "

IF "%OPCION%"=="1" GOTO CLI_MODE
IF "%OPCION%"=="2" GOTO WEB_MODE
IF "%OPCION%"=="3" GOTO HELP
IF "%OPCION%"=="4" EXIT /B 0

ECHO [ERROR] Opcion invalida
GOTO MENU

REM ============================================
REM CLI MODE
REM ============================================
:CLI_MODE
ECHO.
ECHO [*] Modo CLI
ECHO.
ECHO Ejemplos de uso:
ECHO   node src/cli/index.js chat.txt
ECHO   node src/cli/index.js chat.txt -o ./output -v
ECHO   node src/cli/index.js chat.txt --help
ECHO.
SET /P ARCHIVO="Ingresa ruta del archivo (o vacio para salir): "

IF "%ARCHIVO%"=="" GOTO MENU

IF NOT EXIST "%ARCHIVO%" (
    ECHO [ERROR] Archivo no encontrado: %ARCHIVO%
    PAUSE
    GOTO CLI_MODE
)

ECHO.
ECHO [*] Procesando: %ARCHIVO%
ECHO.

node src/cli/index.js "%ARCHIVO%" -v

IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO [ERROR] Fallo durante el procesamiento
) ELSE (
    ECHO.
    ECHO [OK] Procesamiento completado
    ECHO     Revisar carpeta: output\
)

ECHO.
PAUSE
GOTO MENU

REM ============================================
REM WEB MODE
REM ============================================
:WEB_MODE
ECHO.
ECHO [*] Iniciando servidor web...
ECHO.

REM Detectar puerto disponible (default 3000)
SET PORT=3000
ECHO [*] Usando puerto: %PORT%
ECHO [*] Abriendo navegador: http://localhost:%PORT%
ECHO.

REM Intentar abrir navegador
start http://localhost:%PORT%

REM Arrancar servidor
node src/web/server.js

IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO [ERROR] Fallo al iniciar servidor
    PAUSE
)

GOTO MENU

REM ============================================
REM HELP
REM ============================================
:HELP
ECHO.
ECHO ============================================
ECHO  WhatsApp Chat Fragmenter - Ayuda
ECHO ============================================
ECHO.
ECHO PROPOSITO:
ECHO   Fragmentar archivos grandes de WhatsApp en
ECHO   trozos mensuales para usar en NotebookLM
ECHO.
ECHO REQUISITOS:
ECHO   - Node.js 18+
ECHO   - Archivo exportado de WhatsApp (.txt)
ECHO.
ECHO MODOS DE USO:
ECHO.
ECHO 1. CLI (Terminal)
ECHO    node src/cli/index.js &lt;archivo&gt; [opciones]
ECHO.
ECHO    Opciones:
ECHO      -o, --output &lt;dir&gt;    Carpeta salida (default: ./output)
ECHO      -s, --skip-system     Ignorar mensajes sistema (default: true)
ECHO      -i, --skip-media      Ignorar multimedia (default: true)
ECHO      -f, --force           Sobrescribir archivos
ECHO      -v, --verbose         Ver progreso detallado
ECHO      --help                Mostrar ayuda
ECHO.
ECHO 2. WEB (Interfaz Gráfica)
ECHO    - Arrastra archivo
ECHO    - Configura opciones
ECHO    - Descarga ZIP con fragmentos
ECHO.
ECHO SALIDA:
ECHO   - Archivos Markdown: chat_YYYY-MM.md
ECHO   - Índice: INDICE_FRAGMENTOS.md
ECHO   - Ubicación: ./output/ por defecto
ECHO.
ECHO EJEMPLOS:
ECHO.
ECHO   # Básico
ECHO   node src/cli/index.js miChat.txt
ECHO.
ECHO   # Con opciones
ECHO   node src/cli/index.js miChat.txt -o ./chats -v
ECHO.
ECHO   # Sin filtrar nada
ECHO   node src/cli/index.js miChat.txt -f
ECHO.
ECHO TROUBLESHOOTING:
ECHO.
ECHO   P: "Node.js not found"
ECHO   R: Instala Node.js desde https://nodejs.org
ECHO.
ECHO   P: "File not found"
ECHO   R: Verifica ruta del archivo (use rutas absolutas)
ECHO.
ECHO   P: "Port already in use"
ECHO   R: Cierra otra instancia o cambia puerto
ECHO.
ECHO ============================================
ECHO.
PAUSE
GOTO MENU

REM ============================================
REM FIN
REM ============================================
:END
ENDLOCAL
EXIT /B 0
