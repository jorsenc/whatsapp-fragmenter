@ECHO OFF
REM ============================================
REM  WhatsApp Chat Fragmenter - START DEBUG
REM  Launcher con logs detallados
REM ============================================

SETLOCAL ENABLEDELAYEDEXPANSION

TITLE WhatsApp Chat Fragmenter (DEBUG MODE)

ECHO.
ECHO ============================================
ECHO  WhatsApp Chat Fragmenter - DEBUG MODE
ECHO ============================================
ECHO.

REM Verificar Node.js
ECHO [DEBUG] Verificando Node.js...
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Node.js no instalado
    PAUSE
    EXIT /B 1
)

FOR /F "tokens=*" %%I IN ('node -v') DO SET NODE_VERSION=%%I
ECHO [DEBUG] Node.js: !NODE_VERSION!

REM Verificar npm
FOR /F "tokens=*" %%I IN ('npm -v') DO SET NPM_VERSION=%%I
ECHO [DEBUG] npm: !NPM_VERSION!

REM Mostrar directorio actual
ECHO [DEBUG] Directorio: %CD%
ECHO [DEBUG] Archivos presentes:
DIR /B

REM Verificar si existen directorios
IF EXIST "src" (
    ECHO [DEBUG] src/ encontrado
    DIR /B src
) ELSE (
    ECHO [WARNING] src/ no encontrado - crear con: mkdir src
)

IF EXIST "public" (
    ECHO [DEBUG] public/ encontrado
) ELSE (
    ECHO [WARNING] public/ no encontrado
)

IF EXIST "node_modules" (
    ECHO [DEBUG] node_modules/ encontrado
) ELSE (
    ECHO [WARNING] node_modules/ no encontrado - ejecutar: npm install
)

REM Menu debug
ECHO.
ECHO Opciones Debug:
ECHO   1. Instalar dependencias (npm install)
ECHO   2. Listar archivos del proyecto
ECHO   3. Verificar package.json
ECHO   4. Ejecutar CLI con archivo test
ECHO   5. Ejecutar Web Server en DEBUG
ECHO   6. Limpiar node_modules
ECHO   7. Ver variables de entorno
ECHO   8. Salir
ECHO.

SET /P OPCION="Selecciona opcion (1-8): "

IF "%OPCION%"=="1" GOTO INSTALL_DEPS
IF "%OPCION%"=="2" GOTO LIST_FILES
IF "%OPCION%"=="3" GOTO CHECK_PKG
IF "%OPCION%"=="4" GOTO RUN_CLI
IF "%OPCION%"=="5" GOTO RUN_WEB
IF "%OPCION%"=="6" GOTO CLEAN_DEPS
IF "%OPCION%"=="7" GOTO ENV_VARS
IF "%OPCION%"=="8" EXIT /B 0

ECHO [ERROR] Opcion invalida
GOTO :EOF

REM ============================================
REM Instalar dependencias
REM ============================================
:INSTALL_DEPS
ECHO.
ECHO [DEBUG] Instalando dependencias...
npm install
ECHO [DEBUG] Exit code: %ERRORLEVEL%
PAUSE
GOTO :EOF

REM ============================================
REM Listar archivos
REM ============================================
:LIST_FILES
ECHO.
ECHO [DEBUG] Estructura del proyecto:
TREE /L /F
PAUSE
GOTO :EOF

REM ============================================
REM Verificar package.json
REM ============================================
:CHECK_PKG
ECHO.
ECHO [DEBUG] Contenido de package.json:
TYPE package.json
ECHO.
PAUSE
GOTO :EOF

REM ============================================
REM Ejecutar CLI
REM ============================================
:RUN_CLI
ECHO.
ECHO [DEBUG] Ejecutando CLI en DEBUG mode...
ECHO [DEBUG] Comando: node --inspect-brk src/cli/index.js
ECHO.
SET /P ARCHIVO="Archivo a procesar: "
IF "%ARCHIVO%"=="" (
    ECHO [ERROR] Archivo requerido
    PAUSE
    GOTO :EOF
)

node --inspect-brk src/cli/index.js "%ARCHIVO%" -v
ECHO [DEBUG] Exit code: %ERRORLEVEL%
PAUSE
GOTO :EOF

REM ============================================
REM Ejecutar Web Server DEBUG
REM ============================================
:RUN_WEB
ECHO.
ECHO [DEBUG] Ejecutando Web Server en DEBUG mode...
ECHO [DEBUG] Inspector disponible en: chrome://inspect
ECHO.

SET NODE_ENV=debug
node --inspect src/web/server.js

ECHO [DEBUG] Exit code: %ERRORLEVEL%
PAUSE
GOTO :EOF

REM ============================================
REM Limpiar node_modules
REM ============================================
:CLEAN_DEPS
ECHO.
ECHO [WARNING] Eliminando node_modules...
RMDIR /S /Q node_modules
IF %ERRORLEVEL% EQU 0 (
    ECHO [DEBUG] node_modules eliminado
    DEL package-lock.json
    ECHO [DEBUG] package-lock.json eliminado
) ELSE (
    ECHO [ERROR] Fallo al eliminar
)
PAUSE
GOTO :EOF

REM ============================================
REM Variables de entorno
REM ============================================
:ENV_VARS
ECHO.
ECHO [DEBUG] Variables de entorno:
ECHO   NODE_VERSION: %NODE_VERSION%
ECHO   NPM_VERSION: %NPM_VERSION%
ECHO   CD: %CD%
ECHO   USERPROFILE: %USERPROFILE%
ECHO   COMPUTERNAME: %COMPUTERNAME%
ECHO   OS: %OS%
ECHO.
SET | FINDSTR /C:"NODE" /C:"NPM" /C:"DEBUG"
ECHO.
PAUSE
GOTO :EOF

ENDLOCAL
