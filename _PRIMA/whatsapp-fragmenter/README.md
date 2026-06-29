# WhatsApp Chat Fragmenter

Herramienta para fragmentar archivos grandes de chat de WhatsApp en trozos mensuales que pueden ser usados como fuentes individuales en NotebookLM.

## 🚀 Inicio Rápido

### Windows
```bash
START.BAT
```

Esto abre un menú interactivo con opciones para:
- **Modo CLI** — Procesar archivos desde terminal
- **Modo Web** — Interfaz gráfica en navegador
- **Ayuda** — Documentación y ejemplos

### macOS / Linux
```bash
node src/cli/index.js chat.txt -v
```

## 📋 Requisitos

- Node.js 18+
- npm 8+
- Archivo exportado de WhatsApp (.txt)

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Verificar setup (opcional)
node src/cli/index.js --help
```

## 🎯 Uso

### CLI Mode (Terminal)

```bash
# Básico
node src/cli/index.js chat.txt

# Con salida custom
node src/cli/index.js chat.txt -o ./mis_chats

# Verbose (ver progreso)
node src/cli/index.js chat.txt -v

# Forzar sobrescritura
node src/cli/index.js chat.txt -f

# Ver todas las opciones
node src/cli/index.js --help
```

**Opciones:**
- `-o, --output <dir>` — Carpeta de salida (default: ./output)
- `-s, --skip-system` — Ignorar mensajes de sistema (default: true)
- `-i, --skip-media` — Ignorar multimedia (default: true)
- `-f, --force` — Sobrescribir archivos existentes
- `-v, --verbose` — Ver progreso detallado
- `--help` — Mostrar ayuda
- `--version` — Mostrar versión

### Web Mode (Interfaz Gráfica)

```bash
node src/web/server.js
```

Luego abre: http://localhost:3000

**Funcionalidades:**
- Arrastra y suelta archivos
- Vista previa de formato detectado
- Opciones de filtrado
- Descarga de fragmentos como ZIP
- Visualización de índice

## 📊 Ejemplo de Salida

**Entrada:** `chat_esther.txt` (4.6MB, 5 años)

**Salida:**
```
output/
├── chat_2021-01.md (45 KB)
├── chat_2021-02.md (52 KB)
├── chat_2021-03.md (48 KB)
├── ...
├── chat_2025-06.md (67 KB)
└── INDICE_FRAGMENTOS.md
```

Cada archivo contiene:
```markdown
## 15/1/26

[14:32:45] Juan: Hola qué tal
[14:33:12] María: Bien, ¿y tú?

## 16/1/26

[09:15:22] Juan: Buenos días
```

## 🌍 Idiomas Soportados

- 🇪🇸 Español: `[DD/M/YY, HH:MM:SS]`
- 🇬🇧 Inglés: `[M/DD/YY, H:MM:SS AM/PM]`
- 🇵🇹 Portugués: `[DD/M/YY, HH:MM:SS]`
- 🇫🇷 Francés: `[DD/M/YY HH:MM:SS]`

Detecta automáticamente el formato.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Test con coverage
npm test -- --coverage

# Test en watch mode
npm test -- --watch
```

## 🐛 Debug

Para desarrollo y debugging:

```bash
START-DEBUG.BAT
```

Opciones:
- Instalar dependencias
- Listar estructura del proyecto
- Verificar package.json
- Ejecutar CLI con inspector
- Ejecutar Web server con debug
- Limpiar node_modules
- Ver variables de entorno

## 📚 Documentación

- **Especificación completa:** `../. specify/feat-whatsapp-fragmenter.md`
- **Task Breakdown:** `../.specify/feat-whatsapp-fragmenter-tasks.md`
- **API Docs:** (Próximamente)
- **Developer Guide:** (Próximamente)

## 🔧 Estructura del Proyecto

```
whatsapp-fragmenter/
├── src/
│   ├── parser/
│   │   └── whatsappParser.js       # Parser multiidioma
│   ├── fragmenter/
│   │   └── monthFragmenter.js      # Fragmentación por mes
│   ├── generators/
│   │   ├── markdownGenerator.js    # Generador Markdown
│   │   └── indexGenerator.js       # Generador índice
│   ├── cli/
│   │   └── index.js                # CLI entry point
│   └── web/
│       ├── server.js               # Express server
│       ├── routes.js               # API routes
│       └── middleware.js            # Middleware
├── public/
│   ├── index.html                  # UI
│   ├── styles.css                  # Estilos
│   └── app.js                      # Frontend JS
├── tests/
│   ├── parser.test.js
│   ├── fragmenter.test.js
│   └── integration.test.js
├── examples/
│   └── sample_chat_es.txt          # Chat de ejemplo
├── output/                          # Archivos generados
├── package.json
├── .env.example
├── START.BAT                        # Launcher (Windows)
├── START-DEBUG.BAT                  # Debug launcher (Windows)
└── README.md                        # Este archivo
```

## 📝 Configuración (.env)

```env
# Puerto para servidor web
PORT=3000

# Directorio de salida por defecto
OUTPUT_DIR=./output

# Modo verbose (true/false)
VERBOSE=false

# Máximo tamaño de archivo (bytes)
MAX_FILE_SIZE=2147483648
```

Copiar `.env.example` a `.env` y editar según necesidades.

## 🤝 Integración NotebookLM

1. Ejecuta el fragmenter sobre tu chat:
   ```bash
   node src/cli/index.js chat.txt -v
   ```

2. Obtén carpeta con `chat_YYYY-MM.md` y `INDICE_FRAGMENTOS.md`

3. En NotebookLM:
   - Crea nuevo notebook
   - Para cada archivo `.md`:
     - Click en "Add Source"
     - Carga el archivo Markdown
     - Notebook ahora tiene acceso a ese fragmento

4. Puedes hacer preguntas que abarquen múltiples meses

## ⚠️ Troubleshooting

### P: "Node.js not found"
**R:** Instala Node.js desde https://nodejs.org (18+ recomendado)

### P: "File not found"
**R:** Verifica que la ruta del archivo sea correcta. Usa rutas absolutas.

### P: "npm ERR! Could not install dependencies"
**R:** Ejecuta `npm install` manualmente o usa START-DEBUG.BAT > opción 1

### P: "Port 3000 already in use"
**R:** Cambia el puerto en `.env` o cierra la otra aplicación

### P: "Format not detected"
**R:** Verifica que el archivo sea una exportación válida de WhatsApp

### P: "No messages parsed"
**R:** Verifica opciones `-s` y `-i` (podrían filtrar todo)

## 📊 Performance

| Tamaño | Tiempo Esperado | Memoria |
|--------|-----------------|---------|
| 1 MB | < 100 ms | < 10 MB |
| 10 MB | < 500 ms | < 50 MB |
| 100 MB | < 2 seg | < 200 MB |
| 1 GB | < 15 seg | ~ 300 MB |

## 🔐 Privacidad

- ✅ **Procesamiento local** — Nada se envía a internet
- ✅ **Datos privados** — Solo tú tienes acceso
- ✅ **Sin tracking** — No hay telemetría
- ✅ **Open source** — Código visible para auditar

## 📜 Licencia

MIT

## 🙋 Preguntas?

Revisa la documentación en:
- `.specify/feat-whatsapp-fragmenter.md` (especificación técnica)
- `.specify/feat-whatsapp-fragmenter-tasks.md` (tareas implementación)

---

**Última actualización:** 2026-06-29  
**Versión:** 1.0.0 (MVP)
