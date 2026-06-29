# Task Breakdown: WhatsApp Chat Fragmenter

**Generated:** 2026-06-29  
**Source:** `.specify/feat-whatsapp-fragmenter.md`  
**Total Tasks:** 18  
**Phases:** 3 (MVP → Web UI → Robustness)

---

## Overview

Automatizar la fragmentación de archivos de chat de WhatsApp en trozos mensuales que puedan ser usados como fuentes individuales en NotebookLM. Herramienta con CLI y Web UI, soporte multiidioma, filtrado de ruido, y generación de índices.

---

## 🏗️ Phase 1: MVP Core (7 tasks)

Fundación de la herramienta: parser, fragmentación, CLI básico, tests.

### Task 1.1: Project Setup & Package Configuration

**Description:** Configurar estructura base del proyecto, package.json, dependencias y archivos de configuración  
**Size:** Small  
**Priority:** High  
**Dependencies:** None  
**Can run parallel with:** Task 1.2, 1.3

**Technical Requirements:**
- Node.js 18+ runtime
- Express.js 4.18+ para servidor web y CLI
- ESLint + Prettier para linting y formatting
- npm como package manager
- Estructura modular: src/, public/, tests/, examples/, output/

**Files to create:**
```
whatsapp-fragmenter/
├── package.json
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
├── src/
│   ├── parser/
│   ├── fragmenter/
│   ├── generators/
│   ├── cli/
│   └── web/
├── public/
├── tests/
├── examples/
└── output/
```

**package.json content:**
```json
{
  "name": "whatsapp-fragmenter",
  "version": "1.0.0",
  "description": "Fragment large WhatsApp chats into monthly Markdown files for NotebookLM",
  "main": "src/cli/index.js",
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "start": "node src/cli/index.js",
    "web": "node src/web/server.js",
    "test": "node --test tests/**/*.test.js",
    "lint": "eslint src/ tests/",
    "format": "prettier --write src/ tests/ public/"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

**Acceptance Criteria:**
- [ ] Proyecto creado en C:\WORKSPACE\_PRIMA\whatsapp-fragmenter\
- [ ] package.json instalado correctamente
- [ ] npm install ejecuta sin errores
- [ ] Estructura de directorios creada
- [ ] .env.example existe y documenta variables
- [ ] .gitignore incluye node_modules/, output/, .env

---

### Task 1.2: WhatsApp Parser - Format Detection

**Description:** Implementar detector automático de formato WhatsApp que identifique idioma y estructura de timestamp  
**Size:** Medium  
**Priority:** High  
**Dependencies:** Task 1.1  
**Can run parallel with:** Task 1.3

**Technical Requirements:**

Debe detectar automáticamente:
- Formato de fecha (DD/M/YY vs M/DD/YY vs D/M/YY)
- Hora (HH:MM:SS vs H:MM:SS AM/PM)
- Estructura de mensaje ([timestamp] Usuario: Contenido)
- Idioma de exportación

Patrones soportados inicialmente:
- **Español:** `[15/1/26, 14:32:45] Usuario: Mensaje`
- **Inglés:** `[1/15/26, 2:32:45 PM] Name: Message`
- **Portugués:** `[15/1/26, 14:32:45] Usuário: Mensagem`

**Implementation file:** `src/parser/whatsappParser.js`

```javascript
class WhatsappParser {
  constructor(content) {
    this.lines = content.split('\n');
    this.messages = [];
    this.detectedFormat = null;
    this.skipSystemMessages = true;
    this.skipMediaMessages = true;
  }

  detectFormat() {
    // Probar múltiples patrones regex contra primeras 100 líneas
    const sampleLines = this.lines.slice(0, 100).join('\n');
    
    const patterns = {
      'es-DD/M/YY': /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
      'en-M/DD/YY': /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\s(?:AM|PM)\]/,
      'pt-DD/M/YY': /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
      'fr-DD/M/YY': /\[\d{1,2}\/\d{1,2}\/\d{2}\s\d{1,2}:\d{2}:\d{2}\]/
    };
    
    for (const [format, regex] of Object.entries(patterns)) {
      if (regex.test(sampleLines)) {
        this.detectedFormat = format;
        return format;
      }
    }
    
    throw new Error('Could not detect WhatsApp format. Ensure file is valid export.');
  }

  getRegex() {
    // Retornar regex compilado basado en detected format
    const regexMap = {
      'es-DD/M/YY': /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
      'en-M/DD/YY': /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2}\s(?:AM|PM))\]\s([^:]+):\s(.+)$/,
      'pt-DD/M/YY': /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
      'fr-DD/M/YY': /^\[(\d{1,2}\/\d{1,2}\/\d{2})\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/
    };
    
    return regexMap[this.detectedFormat];
  }

  isSystemMessage(line) {
    // Detecta mensajes de sistema tipo:
    // "Usuario entró al grupo"
    // "Usuario cambió el nombre"
    // "Llamada perdida"
    const systemPatterns = [
      /entró al grupo/i,
      /salió del grupo/i,
      /cambió el nombre/i,
      /cambió la foto/i,
      /cambió la descripción/i,
      /cambió la configuración/i,
      /llamada perdida/i,
      /creó el grupo/i,
      /agregó a/i,
      /eliminó a/i
    ];
    
    return systemPatterns.some(pattern => pattern.test(line));
  }

  isMediaMessage(content) {
    // Detecta mensajes de multimedia:
    // [Imagen], [Video], [Audio], [Documento], <Media omitted>
    const mediaPatterns = [
      /^\[Imagen\]$/i,
      /^\[Video\]$/i,
      /^\[Audio\]$/i,
      /^\[Documento\]$/i,
      /^\[Archivo\]$/i,
      /^<Media omitted>$/i,
      /^\[GIF\]$/i,
      /^\[Sticker\]$/i
    ];
    
    return mediaPatterns.some(pattern => pattern.test(content.trim()));
  }

  parseMessages() {
    const regex = this.getRegex();
    let currentMessage = null;
    
    for (const line of this.lines) {
      if (!line.trim()) continue;
      
      const match = line.match(regex);
      
      if (match) {
        // Nueva línea de mensaje
        const [, date, time, user, content] = match;
        
        // Convertir a ISO 8601 timestamp
        const timestamp = this.normalizeTimestamp(date, time);
        
        // Saltar si es mensaje de sistema o multimedia
        if (this.skipSystemMessages && this.isSystemMessage(line)) continue;
        if (this.skipMediaMessages && this.isMediaMessage(content)) continue;
        
        currentMessage = { timestamp, user, content };
        this.messages.push(currentMessage);
      } else if (currentMessage) {
        // Continuación de mensaje multiline
        currentMessage.content += '\n' + line;
      }
    }
    
    return this.messages;
  }

  normalizeTimestamp(dateStr, timeStr) {
    // Convertir fecha a ISO 8601 YYYY-MM-DD HH:MM:SS
    // Ejemplo: "15/1/26, 14:32:45" -> "2026-01-15T14:32:45"
    
    const dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{2})/;
    const timeRegex = /(\d{1,2}):(\d{2}):(\d{2})/;
    
    const dateMatch = dateStr.match(dateRegex);
    const timeMatch = timeStr.match(timeRegex);
    
    if (!dateMatch || !timeMatch) {
      throw new Error(`Invalid timestamp format: ${dateStr}, ${timeStr}`);
    }
    
    const [, day, month, year] = dateMatch;
    const [, hour, minute, second] = timeMatch;
    
    const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
    
    return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${minute}:${second}`;
  }

  getMessages() {
    if (!this.detectedFormat) {
      this.detectFormat();
    }
    if (this.messages.length === 0) {
      this.parseMessages();
    }
    return this.messages;
  }
}

export default WhatsappParser;
```

**Acceptance Criteria:**
- [ ] Detecta automáticamente formato español [DD/M/YY, HH:MM:SS]
- [ ] Detecta automáticamente formato inglés [M/DD/YY, H:MM:SS AM/PM]
- [ ] Extrae correctamente: timestamp, usuario, contenido
- [ ] Identifica mensajes de sistema (entró al grupo, cambió nombre, etc)
- [ ] Identifica mensajes de multimedia ([Imagen], [Video], etc)
- [ ] Maneja correctamente mensajes multiline
- [ ] Convierte timestamps a ISO 8601 normalizados
- [ ] Maneja años 2-dígito correctamente (26 -> 2026)
- [ ] No falsa en archivos con formato inconsistente (flexible)

---

### Task 1.3: Month Fragmenter Implementation

**Description:** Agrupar mensajes parseados por mes/año manteniendo orden cronológico  
**Size:** Small  
**Priority:** High  
**Dependencies:** Task 1.2 (depende de mensajes parseados)  
**Can run parallel with:** Task 1.4

**Technical Requirements:**

Debe:
- Recibir array de mensajes parseados
- Agrupar por YYYY-MM
- Preservar orden cronológico dentro de cada mes
- Manejar meses vacíos (sin mensajes)
- Convertir timestamp ISO a formato de fecha legible

**Implementation file:** `src/fragmenter/monthFragmenter.js`

```javascript
class MonthFragmenter {
  constructor(messages) {
    // messages debe ser array de {timestamp, user, content}
    this.messages = messages || [];
    this.fragments = {}; // { "2026-01": [...], "2026-02": [...] }
  }

  fragment() {
    // Agrupar mensajes por mes
    this.messages.forEach(msg => {
      const key = msg.timestamp.substring(0, 7); // YYYY-MM
      
      if (!this.fragments[key]) {
        this.fragments[key] = [];
      }
      
      this.fragments[key].push(msg);
    });
    
    // Asegurar orden cronológico
    Object.values(this.fragments).forEach(monthMessages => {
      monthMessages.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    });
    
    return this.fragments;
  }

  getFragments() {
    // Retornar como array ordenado [["2026-01", [msgs]], ["2026-02", [msgs]], ...]
    return Object.entries(this.fragments).sort();
  }

  getFragmentStats() {
    // Retornar estadísticas de fragmentos
    return Object.entries(this.fragments).map(([month, messages]) => ({
      month,
      messageCount: messages.length,
      lineCount: messages.reduce((sum, msg) => 
        sum + (msg.content.split('\n').length), 0
      ),
      startDate: messages[0]?.timestamp,
      endDate: messages[messages.length - 1]?.timestamp
    }));
  }

  getFormattedDate(timestamp) {
    // Convertir ISO timestamp a formato legible
    // "2026-01-15T14:32:45" -> "15/1/26"
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }
}

export default MonthFragmenter;
```

**Acceptance Criteria:**
- [ ] Agrupa correctamente mensajes por YYYY-MM
- [ ] Preserva orden cronológico dentro de cada mes
- [ ] Retorna fragmentos ordenados por mes (ascending)
- [ ] getFragmentStats() retorna conteos correctos
- [ ] Maneja correctamente meses con 1-10000+ mensajes
- [ ] Convierte timestamps ISO a fecha legible correctamente
- [ ] No pierde mensajes en el proceso

---

### Task 1.4: Markdown Generator

**Description:** Convertir fragmentos mensuales a formato Markdown limpio  
**Size:** Medium  
**Priority:** High  
**Dependencies:** Task 1.3  
**Can run parallel with:** Task 1.5

**Technical Requirements:**

Formato de salida esperado:
```markdown
## 15/1/26

[14:32:45] Usuario: Hola qué tal
[14:33:12] Usuario2: Bien, ¿y tú?

## 16/1/26

[09:15:22] Usuario: Buenos días
```

Características:
- Encabezados por día (## DD/M/YY)
- Mensajes con formato [HH:MM:SS] Usuario: Contenido
- Separación en blanco entre días
- No incluir metadatos extras
- UTF-8 encoding

**Implementation file:** `src/generators/markdownGenerator.js`

```javascript
class MarkdownGenerator {
  constructor(fragment) {
    // fragment es array de {timestamp, user, content}
    this.fragment = fragment || [];
  }

  generate() {
    if (this.fragment.length === 0) {
      return '# Sin mensajes\n\nEste fragmento no contiene mensajes.';
    }

    let markdown = '';
    let currentDate = null;

    // Agrupar por día
    const byDay = {};
    this.fragment.forEach(msg => {
      const date = msg.timestamp.split('T')[0]; // YYYY-MM-DD
      if (!byDay[date]) {
        byDay[date] = [];
      }
      byDay[date].push(msg);
    });

    // Iterar por días ordenados
    Object.keys(byDay).sort().forEach(date => {
      const formattedDate = this.formatDate(date);
      markdown += `## ${formattedDate}\n\n`;

      byDay[date].forEach(msg => {
        const time = msg.timestamp.split('T')[1].substring(0, 8); // HH:MM:SS
        const user = msg.user;
        const content = msg.content.replace(/\n/g, '\n  '); // Indent multiline
        
        markdown += `[${time}] ${user}: ${content}\n`;
      });

      markdown += '\n';
    });

    return markdown;
  }

  formatDate(isoDate) {
    // "2026-01-15" -> "15/1/26"
    const [year, month, day] = isoDate.split('-');
    const shortYear = year.substring(2);
    return `${parseInt(day)}/${parseInt(month)}/${shortYear}`;
  }
}

export default MarkdownGenerator;
```

**Acceptance Criteria:**
- [ ] Genera Markdown con estructura correcta
- [ ] Agrupa mensajes por día (encabezados ##)
- [ ] Formatea fechas como DD/M/YY
- [ ] Incluye timestamps HH:MM:SS
- [ ] Maneja correctamente mensajes multiline (indent)
- [ ] Genera UTF-8 válido
- [ ] No incluye artefactos de parsing
- [ ] Archivos son legibles en NotebookLM

---

### Task 1.5: CLI Entry Point & Argument Parsing

**Description:** Implementar interfaz CLI básica con parsing de argumentos y orquestación  
**Size:** Medium  
**Priority:** High  
**Dependencies:** Task 1.1, 1.2, 1.3, 1.4  
**Can run parallel with:** None (depende de todo lo anterior)

**Technical Requirements:**

Comando base:
```bash
node src/cli/index.js <archivo-entrada> [opciones]
```

Opciones:
- `-o, --output <carpeta>` — Output dir (default: ./output)
- `-s, --skip-system` — Ignorar mensajes de sistema (default: true)
- `-i, --skip-media` — Ignorar multimedia (default: true)
- `-f, --force` — Sobrescribir archivos existentes (default: false)
- `-v, --verbose` — Modo verbose (default: false)
- `--help` — Mostrar ayuda
- `--version` — Mostrar versión

**Implementation file:** `src/cli/index.js`

```javascript
import fs from 'fs/promises';
import path from 'path';
import WhatsappParser from '../parser/whatsappParser.js';
import MonthFragmenter from '../fragmenter/monthFragmenter.js';
import MarkdownGenerator from '../generators/markdownGenerator.js';
import IndexGenerator from '../generators/indexGenerator.js';

const VERSION = '1.0.0';

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    input: null,
    output: './output',
    skipSystem: true,
    skipMedia: true,
    force: false,
    verbose: false
  };

  // Simple arg parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
    
    if (arg === '--version' || arg === '-v') {
      console.log(`WhatsApp Fragmenter v${VERSION}`);
      process.exit(0);
    }
    
    if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    }
    
    if (arg === '-f' || arg === '--force') {
      options.force = true;
    }
    
    if (arg === '-s' || arg === '--skip-system') {
      options.skipSystem = true;
    }
    
    if (arg === '-i' || arg === '--skip-media') {
      options.skipMedia = true;
    }
    
    if (arg === '-v' || arg === '--verbose') {
      options.verbose = true;
    }
    
    if (!arg.startsWith('-')) {
      options.input = arg;
    }
  }

  // Validar archivo de entrada
  if (!options.input) {
    console.error('Error: No input file specified');
    showHelp();
    process.exit(1);
  }

  try {
    // Leer archivo
    if (options.verbose) console.log(`📖 Reading: ${options.input}`);
    const content = await fs.readFile(options.input, 'utf-8');

    // Parse WhatsApp
    if (options.verbose) console.log('🔍 Detecting format...');
    const parser = new WhatsappParser(content);
    parser.skipSystemMessages = options.skipSystem;
    parser.skipMediaMessages = options.skipMedia;
    
    const format = parser.detectFormat();
    if (options.verbose) console.log(`✓ Format detected: ${format}`);

    const messages = parser.getMessages();
    if (options.verbose) console.log(`✓ Parsed ${messages.length} messages`);

    // Fragment by month
    if (options.verbose) console.log('📅 Fragmenting by month...');
    const fragmenter = new MonthFragmenter(messages);
    fragmenter.fragment();
    const fragments = fragmenter.getFragments();
    if (options.verbose) console.log(`✓ Created ${fragments.length} fragments`);

    // Create output directory
    await fs.mkdir(options.output, { recursive: true });

    // Generate Markdown files
    if (options.verbose) console.log('📝 Generating Markdown files...');
    const fragmentFiles = [];
    
    for (const [month, monthMessages] of fragments) {
      const generator = new MarkdownGenerator(monthMessages);
      const markdown = generator.generate();
      
      const filename = `chat_${month}.md`;
      const filepath = path.join(options.output, filename);
      
      // Check if file exists
      if (!options.force && await fs.stat(filepath).catch(() => null)) {
        console.warn(`⚠️  File exists (skipping): ${filename}`);
        continue;
      }
      
      await fs.writeFile(filepath, markdown, 'utf-8');
      
      if (options.verbose) console.log(`  ✓ ${filename} (${monthMessages.length} msgs)`);
      
      fragmentFiles.push({
        name: filename,
        month,
        lines: monthMessages.length,
        size: Math.round(markdown.length / 1024)
      });
    }

    // Generate index
    if (options.verbose) console.log('📋 Generating index...');
    const indexGen = new IndexGenerator(fragmentFiles);
    const indexMarkdown = indexGen.generate();
    const indexPath = path.join(options.output, 'INDICE_FRAGMENTOS.md');
    await fs.writeFile(indexPath, indexMarkdown, 'utf-8');
    if (options.verbose) console.log(`  ✓ INDICE_FRAGMENTOS.md`);

    // Summary
    console.log('\n✅ Success!');
    console.log(`   Total fragments: ${fragmentFiles.length}`);
    console.log(`   Total messages: ${messages.length}`);
    console.log(`   Output: ${options.output}`);
    console.log(`   Index: ${indexPath}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (options.verbose) console.error(error.stack);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
WhatsApp Chat Fragmenter v${VERSION}

Usage:
  node src/cli/index.js <input-file> [options]

Options:
  -o, --output <dir>    Output directory (default: ./output)
  -s, --skip-system     Skip system messages (default: true)
  -i, --skip-media      Skip media messages (default: true)
  -f, --force           Overwrite existing files
  -v, --verbose         Verbose output
  --help                Show this help
  --version             Show version

Examples:
  node src/cli/index.js chat.txt
  node src/cli/index.js chat.txt -o ./chats -v
  node src/cli/index.js chat.txt -f --skip-system
  `);
}

main().catch(console.error);
```

**Acceptance Criteria:**
- [ ] CLI ejecuta sin errores: `node src/cli/index.js chat.txt`
- [ ] Acepta todas las opciones especificadas
- [ ] Lee archivo correctamente
- [ ] Genera archivos en carpeta output/
- [ ] Crea índice INDICE_FRAGMENTOS.md
- [ ] Verbose mode muestra progreso
- [ ] --help muestra instrucciones
- [ ] --version muestra versión
- [ ] Maneja errores gracefully (archivo no existe, etc)

---

### Task 1.6: Index Generator

**Description:** Generar índice Markdown de todos los fragmentos generados  
**Size:** Small  
**Priority:** Medium  
**Dependencies:** Task 1.4

**Technical Requirements:**

Formato de salida:
```markdown
# Índice de Fragmentos

**Total:** 12 fragmentos

- [chat_2026-01.md](chat_2026-01.md) - 1234 líneas, 45KB
- [chat_2026-02.md](chat_2026-02.md) - 2345 líneas, 78KB
```

**Implementation file:** `src/generators/indexGenerator.js`

```javascript
class IndexGenerator {
  constructor(fragments) {
    // fragments: [{name, month, lines, size}, ...]
    this.fragments = fragments || [];
  }

  generate() {
    let md = '# Índice de Fragmentos\n\n';
    md += `**Total:** ${this.fragments.length} fragmentos\n`;
    md += `**Período:** ${this.getPeriod()}\n\n`;

    md += 'Lista de fragmentos:\n\n';

    this.fragments.forEach(f => {
      md += `- [${f.name}](./${f.name}) - ${f.lines} mensajes, ${f.size}KB\n`;
    });

    md += '\n---\n\n';
    md += '## Cómo usar\n\n';
    md += '1. Importa cada archivo Markdown como fuente en NotebookLM\n';
    md += '2. Los archivos están organizados por mes (YYYY-MM)\n';
    md += '3. Cada archivo contiene solo texto (sin multimedia)\n';
    md += '4. Los mensajes de sistema han sido filtrados\n';

    return md;
  }

  getPeriod() {
    if (this.fragments.length === 0) return 'N/A';
    const months = this.fragments.map(f => f.month).sort();
    return `${months[0]} a ${months[months.length - 1]}`;
  }
}

export default IndexGenerator;
```

**Acceptance Criteria:**
- [ ] Genera Markdown válido
- [ ] Lista todos los fragmentos con links
- [ ] Incluye estadísticas (total, período)
- [ ] Incluye instrucciones de uso
- [ ] Links funcionales a archivos

---

### Task 1.7: Unit Tests for Parser & Fragmenter

**Description:** Escribir tests exhaustivos para parser y fragmenter  
**Size:** Medium  
**Priority:** High  
**Dependencies:** Task 1.2, 1.3

**Technical Requirements:**

Tests deben usar Node.js built-in `test` module (disponible en Node 18+)

**Implementation file:** `tests/parser.test.js`

```javascript
import test from 'node:test';
import assert from 'node:assert';
import WhatsappParser from '../src/parser/whatsappParser.js';

test('WhatsappParser - Spanish format detection', () => {
  const content = '[15/1/26, 14:32:45] Juan: Hola';
  const parser = new WhatsappParser(content);
  const format = parser.detectFormat();
  assert.strictEqual(format, 'es-DD/M/YY');
});

test('WhatsappParser - English format detection', () => {
  const content = '[1/15/26, 2:32:45 PM] John: Hello';
  const parser = new WhatsappParser(content);
  const format = parser.detectFormat();
  assert.strictEqual(format, 'en-M/DD/YY');
});

test('WhatsappParser - Parse valid message', () => {
  const content = '[15/1/26, 14:32:45] Juan: Hola qué tal';
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();
  
  assert.strictEqual(messages.length, 1);
  assert.strictEqual(messages[0].user, 'Juan');
  assert.strictEqual(messages[0].content, 'Hola qué tal');
  assert.strictEqual(messages[0].timestamp, '2026-01-15T14:32:45');
});

test('WhatsappParser - Filter system messages', () => {
  const content = `[15/1/26, 14:32:45] Juan entró al grupo
[15/1/26, 14:33:12] María: Hola`;
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = true;
  const messages = parser.getMessages();
  
  assert.strictEqual(messages.length, 1);
  assert.strictEqual(messages[0].user, 'María');
});

test('WhatsappParser - Filter media messages', () => {
  const content = `[15/1/26, 14:32:45] Juan: [Imagen]
[15/1/26, 14:33:12] María: Texto`;
  const parser = new WhatsappParser(content);
  parser.skipMediaMessages = true;
  const messages = parser.getMessages();
  
  assert.strictEqual(messages.length, 1);
  assert.strictEqual(messages[0].content, 'Texto');
});

test('WhatsappParser - Handle multiline messages', () => {
  const content = `[15/1/26, 14:32:45] Juan: Hola
continuación
de mensaje`;
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();
  
  assert.strictEqual(messages.length, 1);
  assert(messages[0].content.includes('continuación'));
});

test('WhatsappParser - Detect system messages correctly', () => {
  const messages = [
    'Juan entró al grupo',
    'María cambió el nombre del grupo',
    'Pedro cambió la foto',
    'Llamada perdida',
    'Este es un mensaje normal'
  ];
  
  const parser = new WhatsappParser('');
  messages.slice(0, 4).forEach(msg => {
    assert(parser.isSystemMessage(`[15/1/26, 14:32:45] ${msg}`));
  });
  
  assert(!parser.isSystemMessage(`[15/1/26, 14:32:45] ${messages[4]}`));
});

test('WhatsappParser - Detect media messages correctly', () => {
  const contents = ['[Imagen]', '[Video]', '[Audio]', 'Texto normal'];
  const parser = new WhatsappParser('');
  
  assert(parser.isMediaMessage(contents[0]));
  assert(parser.isMediaMessage(contents[1]));
  assert(parser.isMediaMessage(contents[2]));
  assert(!parser.isMediaMessage(contents[3]));
});

test('WhatsappParser - Normalize timestamps correctly', () => {
  const parser = new WhatsappParser('[15/1/26, 14:32:45] Usuario: Test');
  const ts = parser.normalizeTimestamp('15/1/26', '14:32:45');
  assert.strictEqual(ts, '2026-01-15T14:32:45');
});
```

**Implementation file:** `tests/fragmenter.test.js`

```javascript
import test from 'node:test';
import assert from 'node:assert';
import MonthFragmenter from '../src/fragmenter/monthFragmenter.js';

test('MonthFragmenter - Group messages by month', () => {
  const messages = [
    { timestamp: '2026-01-15T14:32:45', user: 'Juan', content: 'Msg 1' },
    { timestamp: '2026-02-05T10:15:22', user: 'María', content: 'Msg 2' }
  ];
  
  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const fragments = fragmenter.getFragments();
  
  assert.strictEqual(fragments.length, 2);
  assert.strictEqual(fragments[0][0], '2026-01');
  assert.strictEqual(fragments[1][0], '2026-02');
});

test('MonthFragmenter - Preserve chronological order', () => {
  const messages = [
    { timestamp: '2026-02-15T14:32:45', user: 'A', content: 'msg1' },
    { timestamp: '2026-01-10T10:15:22', user: 'B', content: 'msg2' },
    { timestamp: '2026-01-20T09:00:00', user: 'C', content: 'msg3' }
  ];
  
  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const fragments = fragmenter.getFragments();
  
  // Check month order
  assert.strictEqual(fragments[0][0], '2026-01');
  assert.strictEqual(fragments[1][0], '2026-02');
  
  // Check message order within January
  const janMessages = fragments[0][1];
  assert.strictEqual(janMessages[0].timestamp, '2026-01-10T10:15:22');
  assert.strictEqual(janMessages[1].timestamp, '2026-01-20T09:00:00');
});

test('MonthFragmenter - Get fragment statistics', () => {
  const messages = [
    { timestamp: '2026-01-15T14:32:45', user: 'Juan', content: 'Line1\nLine2' },
    { timestamp: '2026-01-20T10:15:22', user: 'María', content: 'Single line' }
  ];
  
  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const stats = fragmenter.getFragmentStats();
  
  assert.strictEqual(stats.length, 1);
  assert.strictEqual(stats[0].month, '2026-01');
  assert.strictEqual(stats[0].messageCount, 2);
  assert.strictEqual(stats[0].lineCount, 3); // 2 lines + 1 line
});

test('MonthFragmenter - Format dates correctly', () => {
  const fragmenter = new MonthFragmenter([]);
  
  assert.strictEqual(
    fragmenter.getFormattedDate('2026-01-15T14:32:45'),
    '15/1/26'
  );
  
  assert.strictEqual(
    fragmenter.getFormattedDate('2026-12-05T09:00:00'),
    '5/12/26'
  );
});
```

**Acceptance Criteria:**
- [ ] Todos los tests pasan
- [ ] Cobertura de parser > 80%
- [ ] Cobertura de fragmenter > 80%
- [ ] Tests detectan formato correctamente (ES, EN, PT)
- [ ] Tests verifican filtrado de mensajes de sistema
- [ ] Tests verifican filtrado de multimedia
- [ ] Tests verifican multiline messages
- [ ] Tests verifican orden cronológico
- [ ] Tests verifican formateo de fecha
- [ ] Ejecutar: `npm test` sin errores

---

## 🎨 Phase 2: Web UI & Polish (5 tasks)

### Task 2.1: Express Server Setup

**Description:** Configurar servidor Express con rutas base y manejo de archivos  
**Size:** Medium  
**Priority:** High  
**Dependencies:** Task 1.1, 1.5

### Task 2.2: Web Interface HTML/CSS

**Description:** Crear interfaz web con drag & drop, opciones, progress bar  
**Size:** Medium  
**Priority:** High  
**Dependencies:** Task 2.1

### Task 2.3: Frontend JavaScript & API Integration

**Description:** Implementar lógica frontend: upload, preview, procesamiento, descarga  
**Size:** Medium  
**Priority:** High  
**Dependencies:** Task 2.2

### Task 2.4: API Endpoints Implementation

**Description:** Endpoints POST /upload, GET /download/:file, POST /process  
**Size:** Medium  
**Priority:** High  
**Dependencies:** Task 2.1

### Task 2.5: Integration Tests for Web

**Description:** Tests end-to-end para web app  
**Size:** Medium  
**Priority:** Medium  
**Dependencies:** Task 2.4

---

## 🛡️ Phase 3: Robustness & Languages (3 tasks)

### Task 3.1: Multi-Language Support

**Description:** Agregar soporte para 5+ idiomas (PT, FR, DE, IT)  
**Size:** Large  
**Priority:** Medium  
**Dependencies:** Task 1.2

### Task 3.2: Edge Case Handling

**Description:** Manejar archivos malformados, inconsistentes, truncados  
**Size:** Large  
**Priority:** Medium  
**Dependencies:** Task 1.2, 1.3

### Task 3.3: Complete Documentation

**Description:** README, API docs, user guide, developer guide  
**Size:** Large  
**Priority:** Medium  
**Dependencies:** All previous tasks

---

## 📊 Dependency Graph

```
Task 1.1 (Setup)
├── Task 1.2 (Parser)
│   ├── Task 1.3 (Fragmenter)
│   │   ├── Task 1.4 (Generator)
│   │   │   ├── Task 1.5 (CLI)
│   │   │   └── Task 1.6 (Index)
│   │   └── Task 1.7 (Tests)
│   └── Task 2.1 (Web Server)
│       ├── Task 2.2 (UI HTML)
│       ├── Task 2.3 (Frontend JS)
│       ├── Task 2.4 (API Endpoints)
│       └── Task 2.5 (Web Tests)
└── Task 3.1 (Languages)
    └── Task 3.2 (Edge Cases)
        └── Task 3.3 (Documentation)
```

---

## 🎯 Execution Strategy

**Critical Path:** 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.7

**Parallel Opportunities:**
- Tasks 1.2, 1.3, 1.4, 1.5 can start after 1.1
- Phase 2 (2.1-2.5) can start after Phase 1 is complete
- Phase 3 can run in parallel with Phase 2 (independent features)

**Recommended Schedule:**
- **Week 1:** Phase 1 (MVP foundation)
- **Week 2:** Phase 2 (Web UI)
- **Week 3:** Phase 3 (Robustness & docs)

---

**Task Breakdown Generated:** 2026-06-29
