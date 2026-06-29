# WhatsApp Chat Fragmenter

Herramienta para fragmentar archivos grandes de WhatsApp en trozos mensuales para NotebookLM.

## Quick Start

### Windows
```bash
START.BAT
```

### CLI
```bash
npm install
node src/cli/index.js chat.txt -v
```

### Web
```bash
node src/web/server.js
# Abre: http://localhost:3000
```

## Stack

- **Backend:** Node.js 18+, Express.js 4.18+
- **Frontend:** Vanilla HTML5/CSS3, Fetch API
- **Testing:** Node.js built-in test module
- **Code Quality:** ESLint, Prettier

## Estructura

```
whatsapp-fragmenter/
├── .specify/                  # Especificación técnica
├── .claude/                   # Configuración Claude Code
├── src/
│   ├── parser/               # WhatsApp parser
│   ├── fragmenter/           # Month fragmenter
│   ├── generators/           # Markdown + Index generators
│   ├── cli/                  # CLI entry point
│   └── web/                  # Express server
├── public/                    # Frontend assets
├── tests/                     # Test suites
├── examples/                  # Sample data
├── output/                    # Generated files
├── START.BAT                  # Windows launcher
├── START-DEBUG.BAT            # Debug mode
├── README.md                  # User documentation
└── CLAUDE.md                  # This file
```

## Comandos Principales

```bash
# Instalar dependencias
npm install

# CLI Mode
node src/cli/index.js <archivo> [opciones]

# Web Mode
node src/web/server.js

# Tests
npm test

# Lint & Format
npm run lint
npm run format
```

## Fases de Implementación

### Phase 1: MVP Core (7 tasks)
- Project Setup
- Parser (multiidioma)
- Fragmenter (por mes)
- Generators (Markdown, Índice)
- CLI Interface
- Tests

### Phase 2: Web UI (5 tasks)
- Express Server
- HTML/CSS UI
- Frontend JS
- API Endpoints
- Web Tests

### Phase 3: Robustness (3 tasks)
- Multi-language support
- Edge case handling
- Complete documentation

## Documentación

- **Especificación completa:** `.specify/feat-whatsapp-fragmenter.md`
- **Task Breakdown:** `.specify/feat-whatsapp-fragmenter-tasks.md`
- **README.md:** Guía de usuario

## Development

Para debug y desarrollo:
```bash
START-DEBUG.BAT
```

O directamente:
```bash
node --inspect-brk src/cli/index.js chat.txt
```
