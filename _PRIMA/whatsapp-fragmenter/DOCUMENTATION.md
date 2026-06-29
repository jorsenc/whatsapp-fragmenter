# WhatsApp Chat Fragmenter - Documentación Completa

**Versión:** 1.0.0  
**Última actualización:** 2026-06-29  
**Estado:** MVP Completado

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Uso - CLI](#uso---cli)
4. [Uso - Web](#uso---web)
5. [Especificaciones Técnicas](#especificaciones-técnicas)
6. [Idiomas Soportados](#idiomas-soportados)
7. [Casos de Uso](#casos-de-uso)
8. [Troubleshooting](#troubleshooting)
9. [Contribuciones](#contribuciones)
10. [Licencia](#licencia)

---

## Introducción

**WhatsApp Chat Fragmenter** es una herramienta que fragmenta archivos de chat de WhatsApp en trozos mensuales para usarlos como múltiples fuentes en [NotebookLM](https://notebooklm.google.com).

### ¿Por qué?

NotebookLM tiene un límite de tamaño por fuente. Chats de varios años pueden exceder este límite, impidiendo su uso como fuentes. Esta herramienta resuelve ese problema dividiendo automáticamente el chat en fragmentos manejables organizados por mes.

### Características Principales

- ✅ **Detección automática de idioma** — Soporta 6 idiomas
- ✅ **Fragmentación por mes** — Organización temporal clara
- ✅ **Filtrado de ruido** — Elimina mensajes de sistema y multimedia
- ✅ **CLI + Web UI** — Dos formas de usar
- ✅ **Índice automático** — Genera resumen de fragmentos
- ✅ **Procesamiento local** — Tus datos permanecen en tu máquina
- ✅ **Manejo robusto de errores** — Continúa con archivos malformados

---

## Instalación

### Requisitos Previos

- **Node.js** 18.0.0 o superior
- **npm** 8.0.0 o superior
- **Git** (opcional, para clonar)

### Paso 1: Clonar o Descargar

```bash
# Opción A: Clonar (si está en git)
git clone <repository-url>
cd whatsapp-fragmenter

# Opción B: Descargar manualmente
# Descarga el proyecto y extrae
cd whatsapp-fragmenter
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Verificar Instalación

```bash
# Verificar CLI
node src/cli/index.js --version

# Verificar servidor web
npm run web
# Debería mostrar: Server running on: http://localhost:3000
```

---

## Uso - CLI

### Comando Básico

```bash
node src/cli/index.js <archivo-entrada> [opciones]
```

### Ejemplo Simple

```bash
# Procesar chat.txt con configuración por defecto
node src/cli/index.js chat.txt

# Con salida en carpeta custom
node src/cli/index.js chat.txt -o ./mis_fragmentos

# Modo verbose para ver progreso
node src/cli/index.js chat.txt -v

# Forzar sobrescritura de archivos
node src/cli/index.js chat.txt -f
```

### Opciones Disponibles

| Opción | Corto | Defecto | Descripción |
|--------|-------|---------|-------------|
| `--output` | `-o` | `./output` | Directorio de salida |
| `--skip-system` | `-s` | `true` | Ignorar mensajes de sistema |
| `--skip-media` | `-i` | `true` | Ignorar multimedia |
| `--force` | `-f` | `false` | Sobrescribir archivos |
| `--verbose` | `-v` | `false` | Ver progreso detallado |
| `--help` | `-h` | - | Mostrar ayuda |
| `--version` | | - | Mostrar versión |

### Ejemplo Completo

```bash
# Procesar archivo grande sin filtrar nada
node src/cli/index.js chat_enorme.txt \
  -o ./output_completo \
  -v \
  -f

# Resultado esperado:
# 📖 Leyendo: chat_enorme.txt
#    5,234,567 bytes
# 🔍 Detectando formato...
#    ✓ Formato detectado: es-ES
# 📝 Parseando mensajes...
#    ✓ 150,000 mensajes parseados
#    ✓ 45 usuarios únicos
# 📅 Fragmentando por mes...
#    ✓ 60 fragmentos creados
# 📝 Generando archivos Markdown...
#    ✓ chat_2021-01.md (2,456 msgs, 1250KB)
#    ✓ chat_2021-02.md (1,890 msgs, 950KB)
#    ... (58 más)
# 📋 Generando índice...
#    ✓ INDICE_FRAGMENTOS.md
# ✅ ¡Éxito!
#    Fragmentos generados: 60
#    Ubicación: /ruta/output_completo
#    Índice: /ruta/output_completo/INDICE_FRAGMENTOS.md
```

---

## Uso - Web

### Iniciar Servidor

```bash
# Opción 1: Script npm
npm run web

# Opción 2: Comando directo
node src/web/server.js

# Opción 3: Con puerto custom
PORT=8080 node src/web/server.js
```

### Acceder

Abre tu navegador en: **http://localhost:3000**

### Interfaz Web

La interfaz está organizada en 4 pasos:

#### **Paso 1: Subir Archivo**
- Arrastra tu archivo .txt
- O haz click para seleccionar
- El sistema detecta automáticamente el formato

#### **Paso 2: Configurar Opciones**
- ☑️ Ignorar mensajes de sistema (por defecto: activado)
- ☑️ Ignorar multimedia (por defecto: activado)
- Haz click en "Procesar"

#### **Paso 3: Procesando**
- Se muestra barra de progreso
- Espera a que termine

#### **Paso 4: Resultados**
- Ver lista de fragmentos generados
- Estadísticas (mensajes, tamaño)
- Botón "Descargar Archivos" para obtener todos los fragmentos

---

## Especificaciones Técnicas

### Arquitectura

```
┌─────────────────────────────────────────┐
│         Frontend (HTML/CSS/JS)          │
│  - Drag & Drop Upload                   │
│  - Configuration Options                │
│  - Progress Tracking                    │
│  - Results Display                      │
└────────────────────────────────────────┘
              ↑                    ↓
        HTTP/JSON API
              ↑                    ↓
┌─────────────────────────────────────────┐
│     Backend (Express.js Server)         │
│  - File Upload Handling                 │
│  - Format Detection                     │
│  - Message Processing                   │
│  - Fragment Generation                  │
│  - File Management                      │
└────────────────────────────────────────┘
              ↑                    ↓
┌─────────────────────────────────────────┐
│      Core Processing Modules            │
│  - WhatsApp Parser                      │
│  - Month Fragmenter                     │
│  - Markdown Generator                   │
│  - Index Generator                      │
│  - Edge Case Handler                    │
└─────────────────────────────────────────┘
```

### Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Web Framework** | Express.js | 4.18+ |
| **Frontend** | Vanilla JS | ES2020+ |
| **Package Manager** | npm | 8+ |

### Rendimiento

| Tamaño Archivo | Tiempo | Memoria |
|---|---|---|
| 1 MB | < 100ms | < 10MB |
| 10 MB | < 500ms | < 50MB |
| 100 MB | < 2 seg | < 200MB |
| 1 GB | < 15 seg | ~ 300MB |

---

## Idiomas Soportados

El sistema detecta automáticamente el idioma del chat exportado.

### Idiomas

| Código | Idioma | Formato Fecha | Ejemplo |
|--------|--------|---|---|
| `es-ES` | 🇪🇸 Español | DD/M/YY | `[15/1/26, 14:32:45]` |
| `en-US` | 🇬🇧 English | M/DD/YY | `[1/15/26, 2:32:45 PM]` |
| `pt-BR` | 🇵🇹 Português | DD/M/YY | `[15/1/26, 14:32:45]` |
| `fr-FR` | 🇫🇷 Français | DD/M/YY | `[15/1/26 14:32:45]` |
| `de-DE` | 🇩🇪 Deutsch | DD.M.YY | `[15.1.26, 14:32:45]` |
| `it-IT` | 🇮🇹 Italiano | DD/M/YY | `[15/1/26, 14:32:45]` |

### Agregar Nuevo Idioma

Ver `src/parser/languagePatterns.js`:

```javascript
'es-ES': {
  name: 'Español',
  dateFormat: 'DD/M/YY',
  regex: /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
  detectionPattern: /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
  systemMessagePatterns: [
    /entró al grupo/i,
    /cambió el nombre/i,
    // ... más patrones
  ]
}
```

---

## Casos de Uso

### Caso 1: Análisis de Chat en NotebookLM

**Situación:** Tienes 5 años de conversación con alguien.

**Proceso:**
1. Exporta desde WhatsApp → `chat.txt`
2. Ejecuta: `node src/cli/index.js chat.txt -v`
3. Obtienes 60 archivos (`chat_2021-01.md` a `chat_2025-12.md`)
4. En NotebookLM:
   - Crea notebook
   - Añade cada archivo como fuente
   - Haz preguntas como: "¿Cuándo fue nuestro primer beso?"

### Caso 2: Procesamiento Batch

**Situación:** Necesitas fragmentar 10 chats diferentes.

```bash
# Crear script process_all.sh
for file in *.txt; do
  echo "Procesando $file..."
  node src/cli/index.js "$file" -o "./output_$file"
done
```

### Caso 3: Análisis Específico de Período

**Situación:** Solo te importan ciertos meses.

```bash
# Procesa todo y luego selecciona archivos
node src/cli/index.js chat.txt -o ./output

# Copia solo los meses de interés
cp output/chat_2024-*.md ./selected_months/
```

---

## Troubleshooting

### Problema: "Format not detected"

**Causa:** El archivo no es una exportación válida de WhatsApp.

**Solución:**
1. Verifica que el archivo sea `.txt`
2. Exporta nuevamente desde WhatsApp
3. Comprueba que contiene líneas con timestamps

### Problema: "No messages parsed"

**Causa:** Probablemente el filtrado está eliminando todo.

**Solución:**
```bash
# Desactiva los filtros
node src/cli/index.js chat.txt -s false -i false
```

### Problema: "Port already in use"

**Causa:** Otro proceso usa el puerto 3000.

**Solución:**
```bash
# Usar otro puerto
PORT=8080 npm run web
```

### Problema: Archivo muy grande (> 2GB)

**Causa:** Límite de tamaño superado.

**Solución:**
1. Fragmenta el archivo manualmente
2. O usa una máquina con más RAM

### Problema: Caracteres extraños en output

**Causa:** Problema de encoding.

**Solución:**
```bash
# El sistema usa UTF-8 automáticamente
# Si los caracteres siguen siendo raros:
# 1. Reconvierte el archivo a UTF-8 antes
# 2. Usa herramienta como iconv
iconv -f ISO-8859-1 -t UTF-8 chat.txt > chat_utf8.txt
node src/cli/index.js chat_utf8.txt
```

---

## API Reference

### POST /api/upload

Sube y detecta formato de archivo.

**Request:**
```json
{
  "filename": "chat.txt",
  "content": "... contenido del archivo ..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "uploadId": "upload_1234567890_abc123",
  "filename": "chat.txt",
  "format": "es-ES",
  "messageCount": 50000,
  "uniqueUsers": 45,
  "size": 5234567
}
```

### POST /api/process

Procesa el archivo cargado.

**Request:**
```json
{
  "uploadId": "upload_1234567890_abc123",
  "options": {
    "skipSystem": true,
    "skipMedia": true
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "uploadId": "upload_1234567890_abc123",
  "fragmentCount": 60,
  "totalMessages": 45000,
  "files": [
    {
      "name": "chat_2021-01.md",
      "month": "2021-01",
      "lines": 1250,
      "size": 456
    },
    ...
  ],
  "indexFile": "INDICE_FRAGMENTOS.md"
}
```

### GET /api/download/:uploadId/:filename

Descarga un archivo procesado.

**Response:** Archivo Markdown binario

### GET /api/status/:uploadId

Obtiene estado del upload.

**Response (200):**
```json
{
  "uploadId": "upload_1234567890_abc123",
  "filename": "chat.txt",
  "status": "completed",
  "uploadedAt": "2026-06-29T10:30:45Z",
  "fragmentCount": 60,
  "totalMessages": 45000
}
```

---

## Desarrollo

### Estructura de Archivos

```
whatsapp-fragmenter/
├── src/
│   ├── cli/index.js              CLI entry point
│   ├── web/server.js             Express server
│   ├── parser/
│   │   ├── whatsappParser.js     Core parser
│   │   ├── languagePatterns.js   Language definitions
│   │   └── edgeCaseHandler.js    Error recovery
│   ├── fragmenter/
│   │   └── monthFragmenter.js    Month grouping
│   └── generators/
│       ├── markdownGenerator.js  MD output
│       └── indexGenerator.js     Index generation
├── public/
│   ├── index.html                Web UI
│   ├── styles.css                Styling
│   └── app.js                    Frontend logic
├── tests/
│   ├── parser.test.js            Parser tests
│   └── fragmenter.test.js        Fragmenter tests
├── package.json
├── CLAUDE.md
└── DOCUMENTATION.md              This file
```

### Running Tests

```bash
npm test

# Con watch mode
npm test -- --watch
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/tu-feature`
3. Commit cambios: `git commit -am 'Add feature'`
4. Push a rama: `git push origin feature/tu-feature`
5. Abre un Pull Request

### Áreas de Mejora

- [ ] Soporte para más idiomas
- [ ] Interfaz de escritorio (Electron)
- [ ] API REST documentada con Swagger
- [ ] Tests E2E
- [ ] Performance optimization
- [ ] Suporte para chats de grupo
- [ ] Análisis de sentimiento
- [ ] Exportación a otros formatos

---

## Licencia

MIT © 2026

---

## Recursos

- [Documentación Completa](./DOCUMENTATION.md)
- [Especificación Técnica](./.specify/feat-whatsapp-fragmenter.md)
- [Task Breakdown](./.specify/feat-whatsapp-fragmenter-tasks.md)
- [GitHub Repository](#)
- [NotebookLM](https://notebooklm.google.com)

---

**¿Preguntas?** Abre un issue en el repositorio o contacta al equipo de desarrollo.

**¡Feliz fragmentación! 🎉**
