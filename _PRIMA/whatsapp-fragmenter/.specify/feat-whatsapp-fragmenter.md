# WhatsApp Chat Fragmenter

**Status:** Draft  
**Authors:** Claude Code  
**Date:** 2026-06-29  

---

## 1. Overview

**WhatsApp Chat Fragmenter** es una herramienta que automatiza la fragmentación de archivos de chat de WhatsApp en trozos más pequeños organizados por mes. El objetivo es generar múltiples archivos Markdown que pueden ser utilizados como fuentes individuales en NotebookLM, evitando limitaciones de tamaño de archivo.

**Purpose:**
- Procesar archivos de chat grandes (varios años) de manera eficiente
- Generar fragmentos Markdown organizados por mes
- Proporcionar tanto interfaz CLI como web para máxima flexibilidad
- Ser agnóstico al idioma (soportar cualquier exportación de WhatsApp)

---

## 2. Background / Problem Statement

### El Problema
NotebookLM tiene limitaciones en cuanto al tamaño máximo de una fuente individual. Un archivo de chat de WhatsApp de varios años (especialmente si contiene multimedia) puede exceder este límite, impidiendo que el usuario lo use como fuente.

### Precedente en el Workspace
El usuario ya ha fragmentado manualmente `chat_ESTHER.txt` (4.6MB, 70k líneas, 5 años de conversación) en 23 archivos Markdown mensuales ubicados en `chat_ESTHER_fragmentos/`. Este proceso fue tedioso y manual.

### La Solución
Una herramienta automatizada que:
1. Detecte automáticamente el formato de WhatsApp (multiidioma)
2. Parsee timestamps y contenido
3. Agrupen mensajes por mes
4. Genere archivos Markdown limpios
5. Ignore ruido (mensajes de sistema, multimedia)
6. Proporcione CLI y Web UI

---

## 3. Goals

- ✅ **Automatizar fragmentación**: Procesar archivos de cualquier tamaño
- ✅ **Multiidioma**: Soportar WhatsApp en español, inglés, portugués, francés, etc.
- ✅ **Flexible**: Procesar incluso archivos con formato inconsistente
- ✅ **CLI y Web**: Dos interfaces para diferentes casos de uso
- ✅ **Limpieza**: Filtrar mensajes de sistema, multimedia, eliminados
- ✅ **Markdown limpio**: Formato simple, aceptable por NotebookLM
- ✅ **Almacenamiento**: Organizar en carpeta `output/` por defecto
- ✅ **Índice**: Generar índice de fragmentos generados

---

## 4. Non-Goals

- ❌ No generar estadísticas o análisis del chat (ej: participantes más activos)
- ❌ No aplicar encriptación o protección de privacidad
- ❌ No soportar fragmentación por criterio distinto a mes
- ❌ No generar formatos distintos a Markdown
- ❌ No validar identidades o autenticación (solo procesamiento local)
- ❌ No integración automática con NotebookLM API (el usuario lo hace manual)

---

## 5. Technical Dependencies

### Backend
- **Node.js** 18+ (runtime)
- **Express.js** 4.18+ (CLI + Web API)
- **Regex** (parsing built-in)
- **File System APIs** (fs/promises)

### Frontend
- **Vanilla HTML5/CSS3** (sin framework)
- **Fetch API** (comunicación con backend)
- **Drag & Drop API** (carga de archivos)

### External Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Version Requirements
- Node.js: 18.0.0 o superior
- npm: 8.0.0 o superior
- Windows/Mac/Linux compatible

---

## 6. Detailed Design

### 6.1 Architecture

```
whatsapp-fragmenter/
├── src/
│   ├── parser/
│   │   └── whatsappParser.js       # Core: Detectar idioma, parsear timestamps
│   ├── fragmenter/
│   │   └── monthFragmenter.js      # Core: Agrupar por mes
│   ├── generators/
│   │   ├── markdownGenerator.js    # Generar Markdown
│   │   └── indexGenerator.js       # Generar índice
│   ├── cli/
│   │   └── index.js                # CLI entry point
│   └── web/
│       ├── server.js               # Express server
│       ├── routes.js               # API endpoints
│       └── middleware.js            # Validación, manejo de archivos
├── public/
│   ├── index.html                  # UI
│   ├── styles.css                  # Estilos
│   └── app.js                      # Frontend JS
├── tests/
│   ├── parser.test.js
│   ├── fragmenter.test.js
│   └── integration.test.js
├── examples/
│   └── sample_chat_es.txt          # Chat de ejemplo en español
├── output/                          # Output por defecto (gitignored)
├── package.json
├── .env.example
└── README.md
```

### 6.2 Core Components

#### **WhatsApp Parser** (`src/parser/whatsappParser.js`)

**Responsabilidades:**
1. Detectar idioma/formato automáticamente
2. Validar estructura de línea de WhatsApp
3. Extraer: timestamp, usuario, contenido
4. Filtrar ruido

**Formato de WhatsApp:**
```
[DD/M/YY, HH:MM:SS] Usuario: Mensaje
```

Variantes por idioma:
- **Español**: `[15/1/26, 14:32:45]`
- **Inglés**: `[1/15/26, 2:32:45 PM]`
- **Portugués**: `[15/1/26, 14:32:45]`

**Pseudocódigo:**
```javascript
class WhatsappParser {
  constructor(content) {
    this.lines = content.split('\n');
    this.messages = [];
    this.detectedFormat = null;
  }

  detectFormat() {
    // Probar patrones regex hasta encontrar coincidencia
    // Determinar: idioma, formato de fecha, ubicación de usuario
  }

  parseMessages() {
    // Para cada línea:
    // 1. Verificar si es mensaje o continuación
    // 2. Extraer timestamp, usuario, contenido
    // 3. Filtrar si es ruido (mensaje de sistema, multimedia)
    // 4. Agregar a this.messages[]
  }

  isSystemMessage(line) {
    // "Usuario entró al grupo"
    // "Usuario cambió el nombre"
    // Retorna: boolean
  }

  isMediaMessage(content) {
    // "[Imagen]", "[Video]", "[Audio]", "<Media omitted>"
    // Retorna: boolean
  }

  getMessages() {
    return this.messages;
  }
}
```

#### **Month Fragmenter** (`src/fragmenter/monthFragmenter.js`)

**Responsabilidades:**
1. Agrupar mensajes por mes
2. Preservar orden cronológico
3. Manejar mensajes sin timestamp válido

**Pseudocódigo:**
```javascript
class MonthFragmenter {
  constructor(messages) {
    this.messages = messages;
    this.fragments = {}; // { "2026-01": [...], "2026-02": [...] }
  }

  fragment() {
    messages.forEach(msg => {
      const key = msg.timestamp.substring(0, 7); // YYYY-MM
      if (!this.fragments[key]) {
        this.fragments[key] = [];
      }
      this.fragments[key].push(msg);
    });
    return this.fragments;
  }

  getFragments() {
    return Object.entries(this.fragments).sort();
  }
}
```

#### **Markdown Generator** (`src/generators/markdownGenerator.js`)

**Responsabilidades:**
1. Convertir fragmento a Markdown
2. Mantener formato simple
3. Agrupar por día (opcional)

**Formato de salida:**

```markdown
## 15/1/26

[14:32:45] Usuario: Hola qué tal
[14:33:12] Usuario2: Bien, ¿y tú?

## 16/1/26

[09:15:22] Usuario: Buenos días
```

#### **Index Generator** (`src/generators/indexGenerator.js`)

**Pseudocódigo:**
```javascript
class IndexGenerator {
  constructor(fragments) {
    this.fragments = fragments; // [{name, lines, size}, ...]
  }

  generate() {
    let md = `# Índice de Fragmentos\n\n`;
    md += `**Total:** ${this.fragments.length} fragmentos\n\n`;
    
    this.fragments.forEach(f => {
      md += `- [${f.name}](${f.filename}) - ${f.lines} líneas, ${f.size}KB\n`;
    });
    
    return md;
  }
}
```

### 6.3 CLI Interface

**Comando base:**
```bash
node src/cli/index.js <archivo-entrada> [opciones]
```

**Opciones:**
```bash
-o, --output <carpeta>     # Output dir (default: ./output)
-m, --month                # Agrupar por mes (default: true)
-s, --skip-system          # Ignorar mensajes de sistema (default: true)
-i, --skip-media           # Ignorar multimedia (default: true)
-f, --force                # Sobrescribir archivos existentes
-v, --verbose              # Modo verbose
--help                      # Mostrar ayuda
```

**Ejemplos:**
```bash
# Básico
node src/cli/index.js chat.txt

# Con output custom
node src/cli/index.js chat.txt -o ./chats_fragmentados

# Verbose
node src/cli/index.js chat.txt -v

# Forzar sobrescritura
node src/cli/index.js chat.txt -f
```

### 6.4 Web Interface

**Endpoints API:**

```
POST /api/upload
  - Body: FormData con archivo
  - Response: { status, fragmentCount, totalLines, files: [...] }

GET /api/download/:filename
  - Response: File download

POST /api/process
  - Body: { fileId, options: { skipSystem, skipMedia } }
  - Response: { status, progress }

GET /api/status/:processId
  - Response: { status, progress, fragmentsGenerated }
```

**UI Features:**
- Drag & drop para carga de archivo
- Preview de formato detectado
- Opciones de filtrado (checkboxes)
- Progress bar
- Descarga de fragmentos como ZIP
- Visualización de índice generado

---

## 7. User Experience

### Scenario 1: CLI User (automatización)

```bash
# Usuario 1: Procesar archivo exportado
cd ~/mi-proyecto
node ../whatsapp-fragmenter/src/cli/index.js chat_esther.txt -v

# Output esperado:
# ✓ Detectado: Español (DD/M/YY, HH:MM:SS)
# ✓ Detectados 70204 mensajes
# ✓ Ignorados 234 mensajes de sistema
# ✓ Ignorados 45 multimedia
# ✓ Fragmentado en 23 archivos mensuales
# ✓ Guardados en: ./output/
# ✓ Índice generado: output/INDICE_FRAGMENTOS.md
```

### Scenario 2: Web User (usuario no-técnico)

1. Abre interfaz web: `http://localhost:3000`
2. Arrastra archivo de WhatsApp
3. Sistema detecta: "Español, 70k líneas, formato válido"
4. Usuario revisa opciones (checkboxes)
5. Hace click en "Procesar"
6. Barra de progreso
7. Descarga ZIP con fragmentos + índice

### Scenario 3: Integration con NotebookLM

1. Usuario ejecuta fragmenter sobre su chat
2. Recibe carpeta con `chat_mes1.md`, `chat_mes2.md`, etc.
3. En NotebookLM:
   - Crea notebook
   - Añade `chat_mes1.md` como Fuente 1
   - Añade `chat_mes2.md` como Fuente 2
   - ... (repite para cada mes)
4. NotebookLM ahora tiene acceso a todo el chat en trozos manejables

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Parser Tests** (`tests/parser.test.js`):
```javascript
describe('WhatsappParser', () => {
  test('Detect Spanish format [DD/M/YY, HH:MM:SS]', () => {
    const content = `[15/1/26, 14:32:45] Juan: Hola`;
    const parser = new WhatsappParser(content);
    expect(parser.detectFormat()).toBe('es-DD/M/YY');
  });

  test('Detect English format [M/DD/YY, H:MM:SS PM]', () => {
    const content = `[1/15/26, 2:32:45 PM] John: Hello`;
    const parser = new WhatsappParser(content);
    expect(parser.detectFormat()).toBe('en-M/DD/YY');
  });

  test('Parse valid message', () => {
    const content = `[15/1/26, 14:32:45] Juan: Hola qué tal`;
    const parser = new WhatsappParser(content);
    const messages = parser.parseMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].user).toBe('Juan');
    expect(messages[0].content).toBe('Hola qué tal');
  });

  test('Filter system messages', () => {
    const content = `[15/1/26, 14:32:45] Juan entró al grupo\n[15/1/26, 14:33:12] María: Hola`;
    const parser = new WhatsappParser(content);
    parser.skipSystemMessages = true;
    const messages = parser.parseMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].user).toBe('María');
  });

  test('Filter media messages', () => {
    const content = `[15/1/26, 14:32:45] Juan: [Imagen]\n[15/1/26, 14:33:12] María: Texto`;
    const parser = new WhatsappParser(content);
    parser.skipMediaMessages = true;
    const messages = parser.parseMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe('Texto');
  });

  test('Handle multiline messages', () => {
    const content = `[15/1/26, 14:32:45] Juan: Hola\ncontinuación\nde mensaje`;
    const parser = new WhatsappParser(content);
    const messages = parser.parseMessages();
    expect(messages[0].content).toContain('continuación');
  });
});
```

**Fragmenter Tests** (`tests/fragmenter.test.js`):
```javascript
describe('MonthFragmenter', () => {
  test('Fragment messages by month', () => {
    const messages = [
      { timestamp: '2026-01-15T14:32:45', user: 'Juan', content: 'Hola' },
      { timestamp: '2026-02-05T10:15:22', user: 'María', content: 'Hola' },
    ];
    const fragmenter = new MonthFragmenter(messages);
    const fragments = fragmenter.fragment();
    expect(Object.keys(fragments)).toEqual(['2026-01', '2026-02']);
  });

  test('Preserve chronological order', () => {
    const messages = [
      { timestamp: '2026-02-15', user: 'A', content: 'msg1' },
      { timestamp: '2026-01-10', user: 'B', content: 'msg2' },
    ];
    const fragmenter = new MonthFragmenter(messages);
    const fragments = fragmenter.fragment();
    const sorted = fragmenter.getFragments();
    expect(sorted[0][0]).toBe('2026-01');
    expect(sorted[1][0]).toBe('2026-02');
  });
});
```

### 8.2 Integration Tests

**End-to-End** (`tests/integration.test.js`):
```javascript
describe('Integration', () => {
  test('Process real WhatsApp export file', async () => {
    const filePath = './examples/sample_chat_es.txt';
    const processor = new WhatsappProcessor(filePath);
    const result = await processor.process();
    
    expect(result.status).toBe('success');
    expect(result.fragmentCount).toBeGreaterThan(0);
    expect(result.files).toHaveLength(result.fragmentCount);
  });

  test('Generate valid Markdown files', async () => {
    const processor = new WhatsappProcessor('./examples/sample_chat_es.txt');
    const result = await processor.process();
    
    result.files.forEach(file => {
      expect(file.name).toMatch(/\.md$/);
      expect(file.content).toContain('##'); // Headers for dates
      expect(file.lines).toBeGreaterThan(0);
    });
  });

  test('Index file contains all fragments', async () => {
    const processor = new WhatsappProcessor('./examples/sample_chat_es.txt');
    const result = await processor.process();
    const indexContent = result.indexContent;
    
    result.files.forEach(file => {
      expect(indexContent).toContain(file.name);
    });
  });
});
```

### 8.3 Test Data

**Sample file** (`examples/sample_chat_es.txt`):
```
[15/1/26, 14:32:45] Juan: Hola qué tal
[15/1/26, 14:33:12] María: Bien, ¿y tú?
[15/1/26, 14:35:00] Juan: Aquí ando
[16/1/26, 09:15:22] María: Buenos días
[16/2/26, 10:20:33] Sistema: Juan entró al grupo
[16/2/26, 10:21:00] Juan: [Imagen]
[16/2/26, 10:22:15] María: Qué foto
```

---

## 9. Performance Considerations

### Optimizations

1. **Streaming para archivos grandes:**
   - Procesar línea por línea en lugar de cargar todo en memoria
   - Usar `fs.createReadStream()` para archivos > 50MB

2. **Caching de formato detectado:**
   - Una vez detectado el formato, no verificar línea a línea
   - Cachear regex compilado

3. **Batch writing:**
   - No escribir archivo Markdown línea a línea
   - Acumular contenido, escribir fragmento completo

4. **Paralelización:**
   - Procesar fragmentos en paralelo al escribir
   - Usar `Promise.all()` para escribir múltiples archivos

### Benchmarks

| Tamaño Archivo | Tiempo Esperado | Memoria |
|---|---|---|
| 1 MB | < 100 ms | < 10 MB |
| 10 MB | < 500 ms | < 50 MB |
| 100 MB | < 2 seg | < 200 MB |
| 1 GB | < 15 seg | ~ 300 MB |

---

## 10. Security Considerations

### Input Validation

1. **Validar tipo de archivo:**
   - Solo aceptar `.txt`
   - Verificar extensión y magic bytes

2. **Limitar tamaño:**
   - Max 2GB por archivo (protección DOS)
   - Rechazar archivos demasiado pequeños (< 100B)

3. **Sanitizar rutas:**
   - Validar que output dir no escape del proyecto
   - Usar `path.resolve()` y verificar que está dentro de `output/`

### Data Privacy

1. **Local processing:**
   - Todo ocurre localmente, no se envía a servidores
   - Los datos permanecen en la máquina del usuario

2. **Temporary files:**
   - Limpiar archivos temporales después de procesamiento
   - No guardar en `/tmp` compartida, usar proyecto local

3. **File permissions:**
   - Generar archivos con permisos restrictivos (0600)
   - Documentar que los archivos contienen datos sensibles

---

## 11. Documentation

### Para generar:

1. **README.md:**
   - Instalación y setup
   - Ejemplos de uso (CLI + Web)
   - Troubleshooting
   - Limitaciones conocidas

2. **API Documentation:**
   - Especificación de endpoints
   - Formatos de request/response
   - Ejemplos curl

3. **Architecture Guide:**
   - Diagrama de componentes
   - Flujo de datos
   - Decisiones de diseño

4. **User Guide:**
   - Tutorial paso a paso
   - Screenshots de UI web
   - FAQ

5. **Developer Guide:**
   - Setup para contribuidores
   - Estructura de tests
   - Cómo agregar soporte de nuevo idioma

---

## 12. Implementation Phases

### Phase 1: MVP Core (Parser + CLI)
**Deliverables:**
- WhatsappParser que detecte español e inglés
- MonthFragmenter funcional
- MarkdownGenerator básico
- CLI con opciones esenciales
- Ejemplos y documentación básica
- Tests para parser y fragmenter

**Success Criteria:**
- CLI puede procesar archivo de ejemplo correctamente
- Genera fragmentos por mes en Markdown
- Detección de idioma funciona para español/inglés
- Tests pasan

### Phase 2: Web UI + Polish
**Deliverables:**
- Express server
- Interfaz web (drag & drop)
- IndexGenerator
- Descarga de ZIP
- Progress tracking
- Manejo de errores mejorado

**Success Criteria:**
- UI es usable sin documentación
- Archivos generados son idénticos a CLI
- Performance es aceptable (< 2 seg para 100MB)

### Phase 3: Robustez + Idiomas
**Deliverables:**
- Soporte para 5+ idiomas (ES, EN, PT, FR, DE)
- Manejo de edge cases (formateo inconsistente)
- Tests exhaustivos
- Documentación completa
- Benchmarking y optimización

**Success Criteria:**
- Procesa archivos "malformados" sin fallar
- Todos los idiomas detectan correctamente
- Cobertura de tests > 85%

---

## 13. Open Questions

1. **Fragmentación alternativa:**
   - ¿El usuario podría querer fragmentar por año o por tamaño en lugar de mes?
   - Respuesta: Empezar con mes, soportar otro criterio en Phase 3

2. **Límite de tamaño:**
   - ¿Cuál es exactamente el límite de NotebookLM?
   - Respuesta: No especificado; diseñar para que sea configurable

3. **Preservación de metadata:**
   - ¿Incluir estadísticas (total mensajes, participantes) en cada fragmento?
   - Respuesta: No (non-goal); solo texto del chat

4. **Conversaciones grupales:**
   - ¿Cómo manejar si un chat es grupal vs 1-a-1?
   - Respuesta: Tratarlos igual; el username ya diferencia

---

## 14. References

### Related Code in Workspace
- `chat_ESTHER.txt` — Archivo original (4.6MB)
- `chat_ESTHER_fragmentos/` — Fragmentación manual (referencia)
- `.workspace_app/` — Web app similar (patrón)
- `AMAZON-KDP/kdp-optimizer/` — Parser de texto (patrón)

### External References
- [WhatsApp Export Format](https://faq.whatsapp.com/en/android/23756533) — Documentación oficial
- [Node.js File System](https://nodejs.org/api/fs.html) — API de files
- [Express.js](https://expressjs.com/) — Framework web
- [Markdown Spec](https://commonmark.org/) — Formato Markdown

### NotebookLM Context
- El objetivo final es integrar con NotebookLM para análisis de chats largos
- Múltiples fuentes en NotebookLM permiten análisis cross-chat

---

## 15. Success Criteria

✅ **Técnico:**
- [ ] Parser detecta automáticamente idioma/formato
- [ ] CLI procesa archivos de hasta 1GB
- [ ] Web UI es responsive y usable
- [ ] Tests pasan (> 85% cobertura)
- [ ] Performance < 2 seg para 100MB

✅ **Funcional:**
- [ ] Fragmenta por mes correctamente
- [ ] Filtra mensajes de sistema y multimedia
- [ ] Genera Markdown limpio y válido
- [ ] Índice enumera todos los fragmentos
- [ ] Manejo de errores graceful

✅ **Usuario:**
- [ ] Documentación clara y completa
- [ ] Ejemplos funcionales
- [ ] Tutorial paso a paso
- [ ] FAQ cubre casos comunes
- [ ] Usuario puede procesar chat sin asistencia

---

**Especificación completada:** 2026-06-29
