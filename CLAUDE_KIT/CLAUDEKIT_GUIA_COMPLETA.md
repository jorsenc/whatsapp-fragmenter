# Guía Completa: Claude Kit para Desarrollo Automatizado

## Tabla de Contenidos
1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Arquitectura de Claude Kit](#arquitectura-de-claude-kit)
3. [Flujos de Trabajo Principales](#flujos-de-trabajo-principales)
4. [Sistema de Memoria](#sistema-de-memoria)
5. [Comandos Slash Disponibles](#comandos-slash-disponibles)
6. [Hooks Automáticos](#hooks-automáticos)
7. [Agentes Especializados](#agentes-especializados)
8. [Mejores Prácticas](#mejores-prácticas)
9. [Ejemplos Prácticos](#ejemplos-prácticos)
10. [Troubleshooting](#troubleshooting)

---

## Conceptos Fundamentales

### ¿Qué es Claude Kit?

Claude Kit es un **sistema de automatización inteligente** para tu entorno de desarrollo que:

- **Automatiza tareas repetitivas** — Git, validación de código, tests
- **Gestiona contexto** — Organiza memoria e información del proyecto
- **Especializa agentes** — Activa subagentes según lo que estés haciendo
- **Ejecuta hooks** — Acciones automáticas en eventos (pre/post tool, fin de sesión)

### Cómo Funciona

```
Tu solicitud en Claude Code
         ↓
    [Claude Kit]
         ↓
    ├─ Analiza proyecto
    ├─ Carga contexto relevante
    ├─ Activa subagentes especializados
    ├─ Ejecuta hooks automáticos
    └─ Usa comandos slash como herramientas
         ↓
    Resultado: Desarrollo más rápido y preciso
```

### Los 3 Pilares

1. **Contexto Inteligente** — CLAUDE.md, MEMORY.md, reglas modulares
2. **Comandos Automatizados** — Slash commands que ejecutan flujos
3. **Hooks de Validación** — Verificaciones automáticas durante desarrollo

---

## Arquitectura de Claude Kit

### Estructura de Directorios

```
C:\WORKSPACE\
├── .claude/
│   ├── settings.json          ← Configuración principal
│   ├── launch.json            ← Configuración de debug
│   ├── agents/                ← Agentes especializados
│   │   ├── typescript-expert.md
│   │   ├── react-expert.md
│   │   └── ... (33+ agentes)
│   └── commands/              ← Comandos personalizados (si existen)
│
├── CLAUDE.md                  ← Raíz: contexto general del workspace
├── MEMORY.md                  ← Notas y aprendizajes persistentes
├── .claudekit/
│   └── config.json            ← Config avanzada (opcional)
│
└── [Tus proyectos]/
    ├── CLAUDE.md              ← Contexto del proyecto
    ├── MEMORY.md              ← Memoria local
    ├── .claude/rules/         ← Reglas modulares por tipo de archivo
    │   ├── frontend.md
    │   ├── backend.md
    │   └── testing.md
    └── ... (código)
```

### Archivos Clave

| Archivo | Ámbito | Propósito | Límite |
|---------|--------|-----------|--------|
| `CLAUDE.md` | Proyecto | Instrucciones críticas siempre activas | <100 líneas |
| `MEMORY.md` | Proyecto | Aprendizajes automáticos | 200 líneas / 25KB |
| `.claude/rules/*.md` | Proyecto | Reglas modulares (carga condicional) | Sin límite |
| `.claude/settings.json` | Workspace | Configuración de hooks y comportamientos | JSON |
| `.claude/agents/` | Workspace | 35+ especialistas | Automático |

---

## Flujos de Trabajo Principales

### Flujo 1: Desarrollo Diario (Git + Validación)

```
1. Comienza tu sesión en Claude Code
   └─ Claude Kit carga contexto automáticamente

2. Trabaja en tu código (edita, crea, modifica)
   └─ Los hooks automáticos detectan cambios

3. Cuando termines una tarea, usa:
   /checkpoint:create "Descripción del cambio"
   └─ Crea un punto de control Git (stash)

4. Revisa cambios:
   /git:status
   └─ Muestra archivos modificados

5. Commit de cambios:
   /git:commit
   └─ Claude redacta mensaje automático basado en cambios

6. Empuja cambios:
   /git:push
   └─ Sube a tu rama remota

7. Fin de sesión
   └─ Hook automático: /checkpoint:create
```

### Flujo 2: Implementar Nueva Característica

```
1. Crea especificación técnica:
   /spec:create "nombre-de-característica"
   └─ Genera SPEC.md con diseño completo

2. Desglosa en tareas:
   /spec:decompose
   └─ Divide en subtareas ejecutables

3. Implementa cada subtarea:
   - Edita código
   - Los hooks validan automáticamente (lint, typecheck, tests)

4. Valida la especificación:
   /spec:validate
   └─ Verifica que se cumplieron los requisitos

5. Ejecuta:
   /spec:execute
   └─ Verifica que funciona end-to-end
```

### Flujo 3: Integración con Otros Asistentes

```
1. Si usas Cursor, Windsurf u otro asistente:
   /agents-md:migration
   └─ Migra tu configuración a AGENTS.md

2. Captura herramientas CLI:
   /agents-md:cli git
   /agents-md:cli npm
   └─ Claude aprende cómo usarlas automáticamente

3. Sincronización:
   └─ CLAUDE.md ←→ AGENTS.md (symlink unificado)
   └─ Todos los asistentes leen la misma información
```

### Flujo 4: Code Review & Limpieza

```
1. Al terminar una sesión:
   /dev:cleanup
   └─ Identifica archivos temporales, console.logs, TODOs

2. Revisión de código:
   /code-review
   └─ Análisis de 6 aspectos: arquitectura, calidad, seguridad, performance, tests, docs

3. Antes de push:
   Los hooks automáticos ejecutan:
   ├─ typecheck-changed (TypeScript)
   ├─ lint-changed (ESLint)
   ├─ test-changed (Tests)
   └─ self-review (Revisión de seguridad)
```

---

## Sistema de Memoria

### Nivel 1: CLAUDE.md (Núcleo)

**Ubicación:** Raíz del proyecto
**Carga:** Automática en cada sesión
**Límite:** <100 líneas (crítico)

```markdown
# CLAUDE.md

## Project Overview
[2-3 líneas sobre qué es el proyecto]

## Quick Start
npm install
npm run dev
npm test

## Key Architecture
[Explicar componentes principales]

## Common Tasks
- Build: `npm run build`
- Test: `npm test`
- Deploy: `npm run deploy`
```

**Mejor Práctica:** Solo información **crítica y siempre relevante**.

### Nivel 2: MEMORY.md (Aprendizajes)

**Ubicación:** Raíz del proyecto
**Carga:** Automática
**Límite:** 200 líneas o 25KB
**Límpieza:** Cada 2 semanas

Claude actualiza este archivo automáticamente con:
- Errores comunes y soluciones
- Comandos que funcionaron
- Preferencias descubiertas
- Decisiones de diseño

```markdown
## Observed Patterns
- Backend errors often come from missing env vars
- Tests need JEST_TIMEOUT=10000 on Windows

## Preferences
- User prefers single PR over many small ones
- Always verify with integration tests, not mocks

## Architecture Notes
- State management uses Redux, not Context API
```

**⚠️ Importante:** Este archivo se trunca silenciosamente si excede el límite. Auditalo regularmente con `claudekit list` o revisando manualmente.

### Nivel 3: Reglas Modulares (.claude/rules/)

**Ubicación:** `.claude/rules/`.
**Carga:** Condicional (solo cuando archivos relevantes)
**Límite:** Sin límite

Cada archivo YAML + Markdown para reglas específicas:

```markdown
---
name: frontend-rules
description: Rules for React components
files:
  - "**/*.tsx"
  - "**/*.jsx"
---

# Frontend Development Rules

## Component Structure
- Use React Hooks, not class components
- Props must be typed (TypeScript)
- Components in src/components/

## Testing
- Jest + React Testing Library
- Every component needs a .test.tsx file
```

**Ventaja:** Se cargan automáticamente SOLO cuando editas archivos `.tsx`/`.jsx`. Ahorra tokens en tareas backend.

### Nivel 4: SKILL.md (Habilidades Ejecutables)

**Ubicación:** `~/.claude/skills/` (global)
**Carga:** Bajo demanda (explicit `/skill-name`)
**Especial:** Puede incluir **scripts ejecutables**

```markdown
---
name: deploy-skill
description: Deploy to production
trigger: "/deploy"
---

# Deploy Checklist

## Pre-Deploy
- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors: `npm run lint`
```

---

## Comandos Slash Disponibles

### Grupos de Comandos

#### 1. **Git Workflow** (`/git:`)

```bash
/git:status           # Ver archivos modificados
/git:commit           # Commit inteligente (redacta mensaje)
/git:push             # Push a rama remota
/git:checkout         # Cambiar de rama
/git:ignore-init      # Iniciar .gitignore
```

**Ejemplo:**
```
Usuario: Terminé la autenticación
Claude: /git:status

[muestra cambios en auth.ts, login.tsx, etc.]

Claude: /git:commit

[genera mensaje automático basado en cambios]
commit: "feat: Add JWT authentication with refresh tokens"
```

#### 2. **Checkpoint & Branches** (`/checkpoint:`)

```bash
/checkpoint:create    # Crear punto de control (git stash)
/checkpoint:list      # Ver todos los checkpoints
/checkpoint:restore   # Restaurar un checkpoint
```

**Caso de Uso:** Antes de intentar algo riesgoso:
```
/checkpoint:create "Before refactoring auth module"
[ahora puedes refactorear sin miedo]
/checkpoint:restore  # Si algo sale mal
```

#### 3. **Especificaciones Técnicas** (`/spec:`)

```bash
/spec:create <nombre>      # Crear especificación técnica
/spec:decompose            # Dividir en subtareas
/spec:validate             # Verificar cumplimiento
/spec:execute              # Prueba end-to-end
```

**Workflow completo:**
```
/spec:create "user-authentication"

[genera SPEC.md con:
- Descripción de la característica
- Requisitos funcionales
- Requisitos técnicos
- Arquitectura propuesta
- Plan de tests]

/spec:decompose

[divide en:
- Subtarea 1: Endpoint de login
- Subtarea 2: Validación de tokens
- Subtarea 3: Refresh de sesión
- Subtarea 4: Tests]

[trabajo en cada subtarea...]

/spec:validate
[verifica que todos los requisitos se cumplieron]
```

#### 4. **Agentes & Configuración** (`/agents-md:`)

```bash
/agents-md:cli <tool>        # Captura ayuda de herramienta CLI
/agents-md:migration         # Migrar de otro asistente
/agents-md:init              # Inicializar AGENTS.md
```

**Ejemplo - Capturar comando npm:**
```
/agents-md:cli npm

[Claude ejecuta: npm --help]
[captura salida y la añade a AGENTS.md]

Luego: "¿Cómo instalo paquetes?"
Claude ahora sabe exactamente qué flags y opciones tiene npm
```

#### 5. **Desarrollo & Limpieza** (`/dev:`)

```bash
/dev:cleanup    # Elimina archivos temp, console.logs, TODOs
```

**Qué detecta:**
- `console.log()`, `debugger`, `console.error()`
- Archivos `.tmp`, `.backup`, `node_modules` no ignorados
- Comentarios `// TODO`, `// FIXME`
- Variables no usadas
- Imports no usados

#### 6. **Code Review** (Global)

```bash
/code-review        # Análisis completo de cambios

Cubre 6 aspectos:
✓ Arquitectura & Diseño
✓ Calidad de Código
✓ Seguridad & Dependencias
✓ Performance & Escalabilidad
✓ Tests & Coverage
✓ Documentación & API
```

#### 7. **Investigación & Utilidades**

```bash
/research <tema>    # Investigación por web
/validate-and-fix   # Valida código + auto-fix
/top10              # Ranking de políticos por trading
```

---

## Hooks Automáticos

Los hooks se ejecutan automáticamente en ciertos eventos sin necesidad de comandos.

### Tipos de Eventos

```
┌─ SessionStart        (al abrir Claude Code)
├─ UserPromptSubmit    (después de que escribes)
├─ PreToolUse          (antes de ejecutar herramienta)
├─ PostToolUse         (después de ejecutar herramienta)
├─ Stop                (al terminar sesión)
└─ SubagentStop        (cuando termina un subagente)
```

### Hooks Configurados Actualmente

| Hook | Evento | Qué Hace |
|------|--------|----------|
| `create-checkpoint` | Stop, SubagentStop | Crea git stash automático |
| `lint-changed` | PostToolUse | Valida archivos modificados |
| `typecheck-changed` | PostToolUse | Verifica tipos TypeScript |
| `test-changed` | PostToolUse | Ejecuta tests afectados |
| `file-guard` | PreToolUse | Valida que no edites .env, etc. |
| `self-review` | Stop | Revisión de seguridad antes de terminar |

### Personalizar Hooks

Edita `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "claudekit-hooks run create-checkpoint"
          },
          {
            "type": "command",
            "command": "claudekit-hooks run test-project"
          }
        ]
      }
    ]
  }
}
```

---

## Agentes Especializados

Claude Kit incluye **35+ agentes** que se activan automáticamente según el contexto.

### Categorías Principales

#### Backend & Runtime
```
- nodejs-expert         Async, eventos, streams
- typescript-expert     Tipos avanzados, compilación
- loopback-expert       Framework LoopBack 4
- nestjs-expert         Nest.js + DI + testing
- kafka-expert          Streaming distribuido
```

#### Frontend & UI
```
- react-expert          Hooks, rendimiento, patterns
- react-performance-expert  DevTools, memoización, Web Vitals
- nextjs-expert         App Router, SSR
- css-styling-expert    Layouts, responsive, design systems
- accessibility-expert  WCAG, ARIA, a11y
```

#### Database & Data
```
- postgres-expert       Queries, indexing, JSON
- mongodb-expert        Document modeling, aggregation
- database-expert       Schema design, performance
```

#### DevOps & Infrastructure
```
- docker-expert         Multi-stage, optimization
- devops-expert         CI/CD, monitoring
- github-actions-expert Workflows, custom actions
```

#### Testing & Quality
```
- testing-expert        Jest, Vitest, Playwright
- jest-testing-expert   Mocking, async, snapshots
- code-review-expert    6-aspect comprehensive review
```

#### Other
```
- git-expert            Merges, conflicts, recovery
- documentation-expert  Structure, coherence, navigation
- typescript-build-expert  tsconfig, resolution, optimization
```

### Cómo Activarlos

**Opción 1: Implícito (Automático)**
```
Usuario: Ayúdame con este componente React
                    ↓
[Claude Kit detecta .tsx files]
                    ↓
[Activa automáticamente: react-expert]
```

**Opción 2: Explícito (Manual)**
```
Usuario: /subagent react-expert
"Refactoriza este componente para performance"
```

**Opción 3: En settings.json**
```json
{
  "autoActivateAgents": [
    "typescript-expert",
    "react-expert",
    "testing-expert"
  ]
}
```

---

## Mejores Prácticas

### 1. **Mantén CLAUDE.md Conciso**

❌ **Malo (120+ líneas):**
```markdown
# Proyecto
Muy detallado, lista de cada componente, historia completa...
```

✅ **Bueno (<100 líneas):**
```markdown
# Project: E-commerce Platform

## Quick Start
npm install
npm run dev

## Tech Stack
- Next.js 14 (App Router)
- TypeScript, Tailwind, PostgreSQL
- Jest + React Testing Library

## Key Patterns
- Server Components for data fetching
- client directives for interactivity
- Zod for validation

## Common Commands
- Build: `npm run build`
- Test: `npm test`
- Deploy: `vercel deploy`
```

### 2. **Audita MEMORY.md Regularmente**

Cada 2 semanas:
```bash
cd tu-proyecto
wc -l MEMORY.md  # Si >200 líneas, ¡necesita limpieza!
```

El contenido después de línea 200 se **trunca silenciosamente**.

### 3. **Usa Reglas Modulares para Proyectos Grandes**

En lugar de meter TODO en CLAUDE.md:

```
.claude/rules/
├── react.md       # Carga solo para *.tsx
├── api.md         # Carga solo para routes/**
├── database.md    # Carga solo para *.prisma
├── testing.md     # Carga solo para *.test.ts
```

Claude carga la regla relevante automáticamente. ¡Ahorra tokens!

### 4. **Especificaciones Antes de Codificar**

Nuevo feature = Nueva especificación:

```
/spec:create "feature-name"
[detalla qué, por qué, cómo, tests]

/spec:decompose
[divide en subtareas)

[código]

/spec:validate
[verifica que todo está implementado]
```

### 5. **Checkpoints Estratégicos**

```
/checkpoint:create "Funcionalidad base terminada"
[experimenta, refactoriza]

Si falla:
/checkpoint:restore
[vuelve a estado conocido bueno]
```

### 6. **Aprovecha Code Review**

Antes de push:
```
/code-review

Analiza:
- Seguridad (inyecciones, auth)
- Performance (n+1 queries, renders innecesarios)
- Testing (cobertura, edge cases)
- Documentación (APIs explicadas)
```

### 7. **Captura Herramientas CLI**

Primera vez con una herramienta:
```
/agents-md:cli docker
/agents-md:cli kubectl
/agents-md:cli aws

Claude aprende los flags, opciones, y patrones
```

### 8. **Organiza Tipos de Reglas**

**.claude/rules/STRUCTURE.md:**
```markdown
---
name: structure-rules
files: ["*"]
---

# Project-Wide Rules

- No cambiar CLAUDE.md sin revisar
- MEMORY.md máximo 200 líneas
- Tests siempre junto a código
```

---

## Ejemplos Prácticos

### Ejemplo 1: Nuevo Feature End-to-End

```
PASO 1: Especificar
┌─────────────────────────────────────────┐
│ /spec:create "user-notifications"       │
│                                         │
│ [Claude genera SPEC.md con:]            │
│ - Descripción funcional                 │
│ - Requisitos técnicos                   │
│ - Archivos a crear/modificar            │
│ - Plan de tests                         │
└─────────────────────────────────────────┘

PASO 2: Descomponer
┌─────────────────────────────────────────┐
│ /spec:decompose                         │
│                                         │
│ Subtareas:                              │
│ 1. Models: Notification schema          │
│ 2. API: POST /notifications             │
│ 3. Frontend: NotificationCenter widget  │
│ 4. Tests: Unit + Integration            │
└─────────────────────────────────────────┘

PASO 3: Implementar (con validación automática)
┌─────────────────────────────────────────┐
│ Claude: "Voy a crear models/Notification"│
│                                         │
│ [edita archivo]                         │
│   ↓ Hook: typecheck-changed             │
│   ↓ Hook: lint-changed                  │
│ ✓ TypeScript compilation OK             │
│ ✓ Linting passed                        │
│                                         │
│ [sigue con siguiente componente]        │
└─────────────────────────────────────────┘

PASO 4: Validar
┌─────────────────────────────────────────┐
│ /spec:validate                          │
│                                         │
│ Verifica:                               │
│ ✓ Todos los requisitos implementados    │
│ ✓ Tests pasan                           │
│ ✓ Documentación actualizada             │
│ ✓ No hay console.logs, debugger         │
└─────────────────────────────────────────┘

PASO 5: Git Workflow
┌─────────────────────────────────────────┐
│ /git:status    # Ver qué cambió         │
│ /git:commit    # Commit automático      │
│ /git:push      # Push                   │
│                                         │
│ Mensaje generado automáticamente:       │
│ "feat: Add user notification system"    │
│ "- WebSocket support"                   │
│ "- Email + push notifications"          │
│ "- 95% test coverage"                   │
└─────────────────────────────────────────┘
```

### Ejemplo 2: Refactoring Seguro

```
ANTES:
┌─────────────────────────────────────────┐
│ /checkpoint:create "Before refactoring" │
│ [guarda estado actual como stash git]   │
└─────────────────────────────────────────┘

DURANTE:
┌─────────────────────────────────────────┐
│ Claude: "Voy a refactorizar UserService"│
│                                         │
│ [cambios masivos]                       │
│   ↓ Hook: typecheck-changed             │
│   ↓ Hook: test-changed                  │
│ ⚠ Tests fallan: "UserService not found"│
│                                         │
│ Claude: "Veo el problema, lo arreglo"   │
│ [fix imports]                           │
│   ↓ Hook: test-changed                  │
│ ✓ Tests OK                              │
└─────────────────────────────────────────┘

DESPUÉS (Si algo sale mal):
┌─────────────────────────────────────────┐
│ /checkpoint:restore                     │
│ [vuelve al estado antes del refactoring]│
│ [nada de cambios perdidos]              │
└─────────────────────────────────────────┘
```

### Ejemplo 3: Code Review Pre-Deploy

```
┌─────────────────────────────────────────┐
│ /code-review                            │
│                                         │
│ ARQUITECTURA:                           │
│ ✓ Separación de responsabilidades OK   │
│ ⚠ DataLayer no exporta tipos públicos  │
│                                         │
│ SEGURIDAD:                              │
│ ✓ No hay SQL injection (Prisma ORM)    │
│ ✓ Validación de entrada con Zod       │
│ ⚠ Contraseñas logeadas en .env.example│
│                                         │
│ PERFORMANCE:                            │
│ ✓ No hay n+1 queries                   │
│ ⚠ UserCard renderiza sin useMemo      │
│                                         │
│ TESTS:                                  │
│ ✓ 87% cobertura                        │
│ ⚠ No hay tests de integración E2E     │
│                                         │
│ [Claude sugiere fixes automáticos]     │
└─────────────────────────────────────────┘

LUEGO:
┌─────────────────────────────────────────┐
│ /git:commit                             │
│ /git:push                               │
│ [safe to deploy!]                       │
└─────────────────────────────────────────┘
```

### Ejemplo 4: Migración a Otro Asistente

```
Tienes Cursor, quieres agregar Windsurf:

PASO 1:
┌─────────────────────────────────────────┐
│ /agents-md:migration                    │
│                                         │
│ [migra configuración de CLAUDE.md a    │
│  AGENTS.md (estándar multi-asistente)] │
└─────────────────────────────────────────┘

PASO 2:
┌─────────────────────────────────────────┐
│ ln -s CLAUDE.md AGENTS.md               │
│ [symlink unificado]                     │
└─────────────────────────────────────────┘

RESULTADO:
┌─────────────────────────────────────────┐
│ Cursor:   lee CLAUDE.md                 │
│ Windsurf: lee AGENTS.md (→ CLAUDE.md)  │
│ Claude:   lee CLAUDE.md                 │
│                                         │
│ ¡Todos leen exactamente lo mismo!      │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

### Problema: MEMORY.md se trunca silenciosamente

**Síntoma:** Claude repite errores del pasado

**Causa:** Archivo >200 líneas o >25KB

**Solución:**
```bash
wc -l MEMORY.md
# Si > 200: ¡necesita limpieza!

# Opción 1: Manualmente
# - Elimina notas antiguas
# - Mantén solo aprendizajes recientes

# Opción 2: /compact
# - Resume historia de sesión
# - Preserva reglas de CLAUDE.md
```

### Problema: Hooks no se ejecutan

**Síntoma:** Los comandos automáticos no corren

**Verificar:**
```bash
claudekit doctor
# Busca: "Found X hook(s)"

# Si son 0:
claudekit list   # Ver qué hooks están disponibles

# Revisar settings.json:
cat .claude/settings.json | grep -A5 "hooks"
```

**Habilitar hooks:**
```bash
# En .claude/settings.json, asegúrate que tengas:
{
  "hooks": {
    "Stop": [
      {"type": "command", "command": "claudekit-hooks run create-checkpoint"}
    ]
  }
}
```

### Problema: Agente incorrecto activado

**Síntoma:** React expert activo cuando trabajas en backend

**Solución:**
```bash
# Especifica explícitamente:
/subagent nodejs-expert
"Ayuda con esta función async"

# O configura en settings.json:
{
  "autoActivateAgents": ["nodejs-expert", "postgres-expert"]
}
```

### Problema: CLAUDE.md muy largo y Claude lo ignora

**Síntoma:** Claude no sigue instrucciones del CLAUDE.md

**Causa:** Archivo > 100-120 líneas

**Solución:**
1. **Extrae secciones:** Mueve a `.claude/rules/`
2. **Simplifica:** Solo info crítica
3. **Referencia:** Menciona dónde está el resto

Ejemplo:
```markdown
# CLAUDE.md

[Solo lo crítico: 80 líneas]

## For detailed rules, see:
- .claude/rules/react.md      (React patterns)
- .claude/rules/api.md        (API design)
- .claude/rules/testing.md    (Testing)
```

### Problema: Especificación no valida

**Síntoma:** `/spec:validate` encuentra requisitos incumplidos

**Solución:**
```bash
/spec:validate

[Muestra:
- Requisito 1: ✓ Cumplido
- Requisito 2: ✗ Falta UI
- Requisito 3: ⚠ Incomplete tests]

# Arregla pendientes
[código]

# Revalida:
/spec:validate
```

### Problema: Git conflicts durante push

**Síntoma:** Rama remota tiene cambios

**Solución:**
```bash
/git:status
# Muestra conflictos

# Opción 1: Rebase
/git:checkout main
/git:pull
/git:checkout mi-rama
# [resolver conflictos manualmente]
/git:commit
/git:push

# Opción 2: Checkpoint seguro
/checkpoint:create "before merge conflict resolution"
# [resolver]
/checkpoint:create "conflicts resolved"
```

---

## Resumen: Flujo Diario Completo

```
08:00 - MAÑANA
┌─────────────────────────────────────────┐
│ Abres Claude Code                       │
│ [carga automáticamente: CLAUDE.md,      │
│  MEMORY.md, reglas modulares, agentes]  │
└─────────────────────────────────────────┘

09:00 - TAREA NUEVA
┌─────────────────────────────────────────┐
│ /spec:create "payment-integration"      │
│ /spec:decompose                         │
│ [divide en subtareas]                   │
└─────────────────────────────────────────┘

10:00 - DESARROLLO
┌─────────────────────────────────────────┐
│ Trabajas en código                      │
│ [hooks validan automáticamente]         │
│   → typecheck                           │
│   → lint                                │
│   → tests                               │
│ ✓ Todo pasa                             │
└─────────────────────────────────────────┘

12:00 - CHECKPOINT
┌─────────────────────────────────────────┐
│ /checkpoint:create "API endpoints done" │
│ [guarda progreso]                       │
└─────────────────────────────────────────┘

15:00 - LIMPIEZA
┌─────────────────────────────────────────┐
│ /dev:cleanup                            │
│ [elimina console.logs, TODOs, etc]      │
└─────────────────────────────────────────┘

17:00 - REVISIÓN FINAL
┌─────────────────────────────────────────┐
│ /code-review                            │
│ [6 aspectos: arch, quality, security...]│
│ /spec:validate                          │
│ [verifica completitud]                  │
└─────────────────────────────────────────┘

18:00 - PUSH
┌─────────────────────────────────────────┐
│ /git:status                             │
│ /git:commit                             │
│ /git:push                               │
│ [mensaje generado automáticamente]      │
└─────────────────────────────────────────┘

19:00 - FIN DE SESIÓN
┌─────────────────────────────────────────┐
│ [Hook automático: create-checkpoint]    │
│ [sesión guardada]                       │
│ Mañana continúas desde mismo punto      │
└─────────────────────────────────────────┘
```

---

## Recursos Adicionales

### Comandos Rápidos
```bash
claudekit doctor              # Verificar instalación
claudekit list                # Ver todos los componentes
claudekit upgrade             # Actualizar a última versión
```

### Documentación
- CLAUDE.md (este proyecto)
- MEMORY.md (aprendizajes acumulados)
- .claude/settings.json (configuración)

### Próximos Pasos
1. ✅ Claude Kit instalado
2. ⏭️ Crea CLAUDE.md en tu proyecto
3. ⏭️ Usa `/spec:create` en tu próximo feature
4. ⏭️ Experimenta con `/checkpoint:create`
5. ⏭️ Ejecuta `/code-review` ante cambios grandes

---

**Última actualización:** 29 de junio de 2026
**Versión de Claude Kit:** 0.9.5
