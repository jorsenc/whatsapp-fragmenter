# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this workspace.

## Workspace Overview

`C:\WORKSPACE` is a multi-project workspace containing several independent projects at various stages of development. Each project is self-contained with its own configuration, dependencies, and documentation.

## Project Directory Structure

### Active Development Projects

#### 1. **BirthdayManager** (`./BirthdayManager/`)
**Type:** Node.js web application  
**Language:** Spanish (UI and prompts)  
**Purpose:** Web app that parses birthday information from natural language text using Ollama (local AI models)

**Key Details:**
- Framework: Express.js (backend) + Vanilla HTML/CSS/JS (frontend)
- AI Provider: Ollama with `nemotron-3-ultra:cloud` model (local, no API costs)
- Port: 3000 (configurable)
- Entry point: `server.js`
- **Commands:**
  - `npm install` — Install dependencies
  - `npm start` — Start server (available at http://localhost:3000)
  - `npm test` — Run 18 unit + integration tests
  - `start.bat` / `start-debug.bat` (Windows)

**Setup:**
- Requires Ollama running on `localhost:11434` (configurable via `.env`)
- Copy `.env.example` to `.env`
- No external API keys needed

**Architecture:** Backend acts as proxy to Ollama API. Frontend stores birthdays in browser localStorage. Validation logic in `utils/validation.js`.

See [BirthdayManager/CLAUDE.md](./BirthdayManager/CLAUDE.md) for full details.

---

#### 2. **GITHUB_WEB** (`./GITHUB_WEB/`)
**Type:** Static site (Astro blog)  
**Language:** Spanish + HTML/Astro  
**Purpose:** Personal portfolio/blog built with Astro

**Key Details:**
- Framework: Astro 4.x
- Features: Markdown-based blog, category filtering, tags, responsive design
- Deploy: Automatic to GitHub Pages on `git push main`
- Port: 3000 (dev server)
- **Commands:**
  - `npm install` — Install dependencies
  - `npm run dev` — Start dev server (http://localhost:3000)
  - `npm run build` — Build for production
  - Posts are in `src/content/blog/` (Markdown files)

**Post Format:**
```markdown
---
title: "Título"
pubDate: 2026-06-28
excerpt: "Short description"
category: "Category"
tags: ["tag1", "tag2"]
---
# Content here
```

**File naming:** Use kebab-case (e.g., `mi-primer-post.md`) → becomes URL `/posts/mi-primer-post/`

See [GITHUB_WEB/SETUP.md](./GITHUB_WEB/SETUP.md) for details.

---

#### 3. **gdrive-mcp-server** (`./gdrive-mcp-server/`)
**Type:** MCP (Model Context Protocol) server  
**Language:** TypeScript/Node.js  
**Purpose:** Provides Claude Code / LLMs access to Google Drive (search, list, read files)

**Key Details:**
- Framework: Node.js with TypeScript
- Tools: `gdrive_search`, `gdrive_read_file`
- Supports: Google Docs → Markdown, Sheets → CSV, Presentations → text, auto-conversion
- Requires: OAuth 2.0 setup with Google Cloud credentials
- **Commands:**
  - `npm install` — Install dependencies
  - `npm run build` — Compile TypeScript to `dist/`
  - `node dist/index.js auth` — Authenticate with Google Drive
  - `node dist/index.js` — Start MCP server

**OAuth Setup:** See [gdrive-mcp-server/README.md](./gdrive-mcp-server/README.md) for Google Cloud project configuration

See [gdrive-mcp-server/README.md](./gdrive-mcp-server/README.md) for full setup and usage.

---

#### 4. **AMAZON-KDP** (`./AMAZON-KDP/`)
**Type:** Documentation / Reference guide  
**Language:** Spanish  
**Purpose:** Comprehensive guide for optimizing book listings on Amazon KDP (Kindle Direct Publishing)

**Key Details:**
- Format: Markdown with embedded diagrams (base64 PNG)
- Contains: 8 major sections covering metadata, formatting, keywords, categories, copywriting, images, and policy compliance
- Audience: Self-publishing novelists
- Also contains: `kdp-optimizer/` subdirectory (work-in-progress optimization tools)

See [AMAZON-KDP/CLAUDE.md](./AMAZON-KDP/CLAUDE.md) for editing guidelines and structure.

---

### Other Projects

#### **trade-control** (`./trade-control/`)
Trading control project with documentation. Contains guides, agents documentation, setup instructions for trading systems.

#### **APLICACION** (`./APLICACION/`)
Application with `amazon-scraper` subdirectory. Status: exploratory.

#### **outletnina.com** (`./outletnina.com/`)
Website project with commerce/store focus. Contains branding assets, logos, site files.

#### Exploratory/Test Projects
- `IMG-GEN-TEST`, `IMG-GEN_MCP`, `IMG_GEN_BLANK_TPL` — Image generation experiments
- `NOTEBOOK_LM-SKILL` — NotebookLM skill exploration
- `SDD` — Spec-Driven Development exploration
- `TEST` — General testing directory
- `NICOLAI` — Project-specific workspace
- `_PRIMA` — Personal project files

---

## Common Workflow

### Switching Between Projects

```bash
# Navigate to a specific project
cd BirthdayManager
cd GITHUB_WEB
cd gdrive-mcp-server

# Each project manages its own dependencies and dev server
npm install
npm start  # or npm run dev, npm run build, etc.
```

### Running Multiple Projects

Since each project runs on a separate port or as independent services:
- **BirthdayManager** → `npm start` → http://localhost:3000
- **GITHUB_WEB** → `npm run dev` → http://localhost:3000 (default, configurable)
- **gdrive-mcp-server** → `node dist/index.js` → MCP protocol (no web port)

Use different port numbers if running multiple web servers simultaneously:
```bash
# Terminal 1
cd BirthdayManager && npm start

# Terminal 2 (in different window)
cd GITHUB_WEB && npm run dev -- --port 3001
```

---

## Development Setup

### Node.js Projects (BirthdayManager, GITHUB_WEB, gdrive-mcp-server)

Each project has:
- `.git` repository (independent from workspace)
- `package.json` and `package-lock.json`
- `.env.example` (with `.env` in .gitignore)
- `node_modules/` (created after `npm install`)
- `.claude/` directory (Claude Code settings)

### Common Commands Across Projects

```bash
npm install              # Install dependencies
npm start                # Start dev server or app (varies by project)
npm run dev              # Start dev server (Astro, some Node apps)
npm run build            # Build for production
npm test                 # Run tests (where available)
npm run build-watch      # Build on file changes (TypeScript projects)
```

### Environment Setup

**BirthdayManager:**
```bash
cp .env.example .env
# Configure: PORT, OLLAMA_URL, OLLAMA_MODEL
```

**gdrive-mcp-server:**
```bash
mkdir credentials
# Place Google OAuth credentials: credentials/gcp-oauth.keys.json
node dist/index.js auth  # Complete OAuth flow
```

**GITHUB_WEB:**
```bash
# No setup needed; uses defaults
npm install && npm run build
```

---

## Repository Structure

- **Each project is independent** — has its own `.git`, `package.json`, README, CLAUDE.md
- **Workspace root** — contains this CLAUDE.md and a MEMORY.md (personal notes)
- **Shared patterns:**
  - `.claude/` directories for project-specific Claude Code settings
  - `.specify/` directories for SDD (Spec-Driven Development) artifacts (where used)
  - `.gitignore` excludes `node_modules`, `.env`, credentials, `.DS_Store`

---

## Key Files and Documentation

### Per-Project CLAUDE.md Files
- [BirthdayManager/CLAUDE.md](./BirthdayManager/CLAUDE.md) — Ollama integration, validation rules, testing
- [AMAZON-KDP/CLAUDE.md](./AMAZON-KDP/CLAUDE.md) — Document structure, maintenance notes

### Setup and Getting Started
- [GITHUB_WEB/SETUP.md](./GITHUB_WEB/SETUP.md) — Astro blog setup and deployment
- [gdrive-mcp-server/README.md](./gdrive-mcp-server/README.md) — Google Drive MCP server setup

### Workspace-Level
- `MEMORY.md` — Personal notes and project context
- `TESTED_MODELS.md` — Tested AI models and configurations

---

## Architecture Notes

### Languages in Use
- **Spanish:** BirthdayManager (UI), GITHUB_WEB (content), AMAZON-KDP (guide)
- **English:** Documentation, code comments, gdrive-mcp-server
- **TypeScript:** gdrive-mcp-server
- **JavaScript:** BirthdayManager, GITHUB_WEB

### Technology Stack Overview

| Project | Backend | Frontend | AI/ML | Database |
|---------|---------|----------|-------|----------|
| BirthdayManager | Express.js | Vanilla JS | Ollama (local) | localStorage |
| GITHUB_WEB | Astro | Static/Astro | — | — |
| gdrive-mcp-server | Node.js + TypeScript | — (MCP protocol) | — | Google Drive API |

### Data Flow

**BirthdayManager:**
```
User Input (HTML textarea)
  ↓
Express.js backend (/api/parse-birthday)
  ↓
Ollama API (localhost:11434)
  ↓
Parsed JSON response
  ↓
Frontend renders + stores in localStorage
```

**GITHUB_WEB:**
```
Markdown posts (src/content/blog/)
  ↓
Astro static site generator
  ↓
HTML output (dist/)
  ↓
GitHub Actions deploy to GitHub Pages
```

**gdrive-mcp-server:**
```
MCP client (Claude Code, etc.)
  ↓
Node.js MCP server
  ↓
Google Drive API (OAuth 2.0)
  ↓
File content (Markdown, CSV, text, etc.)
```

---

## Getting Started with a New Project in This Workspace

1. **Explore:** Check the project's README.md and CLAUDE.md (if it exists)
2. **Install:** `npm install` in the project directory
3. **Configure:** Copy `.env.example` to `.env` and set required values
4. **Run:** Follow project-specific commands (usually `npm start` or `npm run dev`)
5. **Develop:** Edit code, commit to project's own `.git`, push independently
6. **Test:** `npm test` (where available)

---

## Notes for Future Contributors

- **Workspace is multi-repo:** Not a monorepo. Each project is independent with its own git history.
- **No shared dependencies:** Projects do not share node_modules or build outputs.
- **Environment isolation:** Use project-specific `.env` files; credentials are per-project.
- **Documentation:** Each project maintains its own CLAUDE.md for project-specific guidance.
- **Spanish content:** Several projects use Spanish for UI and documentation; preserve language consistency within each project.

