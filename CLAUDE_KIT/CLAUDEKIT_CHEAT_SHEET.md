# Claude Kit Cheat Sheet 📋

Referencia rápida para Claude Kit. Imprime o guarda como favorito.

---

## 🚀 Empezar Rápido

### Verificar Instalación
```bash
claudekit doctor
claudekit list
```

### En Tu Proyecto
```bash
cd tu-proyecto
claudekit setup -y
```

---

## 📌 Los 3 Archivos Clave

| Archivo | Ubicación | Propósito | Límite |
|---------|-----------|-----------|--------|
| **CLAUDE.md** | Raíz | Instrucciones siempre activas | <100 líneas |
| **MEMORY.md** | Raíz | Aprendizajes automáticos | 200 líneas |
| **.claude/rules/** | Proyecto | Reglas por tipo de archivo | Sin límite |

---

## 💻 Comandos Principales

### 🔄 Git Workflow
```bash
/git:status          # Ver cambios
/git:commit          # Commit automático
/git:push            # Push a remota
/git:checkout        # Cambiar rama
```

### 📋 Checkpoints (Snapshots)
```bash
/checkpoint:create "desc"   # Guardar estado
/checkpoint:list            # Ver histórico
/checkpoint:restore         # Volver atrás
```

### 🎯 Especificaciones
```bash
/spec:create "nombre"    # Nueva especificación
/spec:decompose          # Dividir en subtareas
/spec:validate           # Verificar completitud
/spec:execute            # Prueba end-to-end
```

### 🧹 Desarrollo
```bash
/dev:cleanup        # Elimina console.log, TODO, archivos temp
/code-review        # Análisis en 6 aspectos
```

### 🔗 Sincronización Multi-Asistente
```bash
/agents-md:cli <tool>       # Captura help de CLI
/agents-md:migration        # Migra de otro asistente
/agents-md:init             # Inicializa AGENTS.md
```

### 🔍 Otros
```bash
/research <tema>        # Busca web + análisis
/validate-and-fix       # Valida + auto-fix
/compact                # Compacta contexto (sesiones largas)
```

---

## 🎯 Flujo Diario Típico

```
1. MAÑANA
   └─ Abres Claude Code → Carga automática de contexto

2. NUEVA TAREA
   └─ /spec:create "nombre"
   └─ /spec:decompose

3. DESARROLLO
   └─ Editas código
   └─ Hooks validan automáticamente (lint, typecheck, tests)

4. CHECKPOINT
   └─ /checkpoint:create "Progreso en X"

5. LIMPIEZA
   └─ /dev:cleanup

6. REVISIÓN
   └─ /code-review

7. PUSH
   └─ /git:commit
   └─ /git:push

8. FIN
   └─ [Hook automático: checkpoint]
```

---

## 🎯 Flujo Por Escenario

### Nuevo Feature (Rápido)
```
/spec:create → /spec:decompose → [código] → /spec:validate → /git:commit
```

### Refactoring Seguro
```
/checkpoint:create → [código] → tests OK → /checkpoint:restore (si falla)
```

### Antes de Deployar
```
/dev:cleanup → /code-review → /spec:validate → /git:push
```

### Equipo Colaborativo
```
/agents-md:migration → /agents-md:cli tool → [compartir en git]
```

---

## 🧠 Sistema de Memoria (3 Niveles)

### Nivel 1: CLAUDE.md (Crítico)
```markdown
# Project Name

## Quick Start
npm install && npm run dev

## Key Stack
- Next.js, TypeScript, PostgreSQL

## Commands
- Build: npm run build
- Test: npm test
- Deploy: vercel deploy
```
**Regla:** <100 líneas, solo lo crítico.

### Nivel 2: MEMORY.md (Aprendizajes)
Claude actualiza automáticamente con:
- Errores comunes
- Soluciones probadas
- Preferencias

**Regla:** <200 líneas. Si crece → audita y limpia.

### Nivel 3: .claude/rules/ (Modulares)
```markdown
---
name: react-rules
files: ["**/*.tsx", "**/*.jsx"]
---

# React Guidelines
[Reglas específicas]
```
**Ventaja:** Carga solo cuando editas archivos React.

---

## 35+ Agentes Especializados

### Se Activan Automáticamente Por Contexto

**Backend:**
- `nodejs-expert` — Async, eventos, streams
- `typescript-expert` — Tipos, compilación
- `postgres-expert` — Queries, indexing
- `kafka-expert` — Streaming distribuido

**Frontend:**
- `react-expert` — Hooks, rendimiento
- `nextjs-expert` — App Router, SSR
- `css-styling-expert` — Layouts, responsive
- `accessibility-expert` — WCAG, ARIA

**Testing:**
- `testing-expert` — Jest, Vitest, Playwright
- `code-review-expert` — Análisis 6 aspectos

**DevOps:**
- `docker-expert` — Containers, optimization
- `devops-expert` — CI/CD, monitoring
- `github-actions-expert` — Workflows

**Otros:**
- `git-expert` — Merges, conflicts
- `database-expert` — Schema design
- `documentation-expert` — Estructura, coherencia

### Activar Manualmente
```bash
/subagent react-expert
"Ayuda a optimizar este componente"
```

---

## 🔧 Hooks Automáticos

Se ejecutan sin pedirle nada a Claude.

| Hook | Cuándo | Qué Hace |
|------|--------|----------|
| `create-checkpoint` | Al terminar sesión | Crea git stash |
| `lint-changed` | Post tool | Valida linting |
| `typecheck-changed` | Post tool | Verifica tipos |
| `test-changed` | Post tool | Ejecuta tests |
| `file-guard` | Pre tool | Protege .env, keys |
| `self-review` | Al terminar | Revisión seguridad |

---

## ⚙️ Configuración

### Ver Configuración Actual
```bash
cat .claude/settings.json
```

### Habilitar Todos los Hooks
```json
{
  "hooks": {
    "Stop": [
      {"type": "command", "command": "claudekit-hooks run create-checkpoint"},
      {"type": "command", "command": "claudekit-hooks run test-project"}
    ]
  }
}
```

### Agentes Auto-Activos
```json
{
  "autoActivateAgents": ["typescript-expert", "react-expert", "testing-expert"]
}
```

---

## 🐛 Troubleshooting Rápido

### MEMORY.md se trunca
```bash
wc -l MEMORY.md
# Si > 200 líneas: ¡LIMPIA!
```

### Hooks no se ejecutan
```bash
claudekit doctor
# Busca: "Found X hook(s)"
```

### Agent incorrecto
```bash
/subagent nodejs-expert
"Tu pregunta"
```

### Contexto muy grande
```bash
/compact
# Compacta historia, preserva reglas
```

---

## 📊 Cobertura de Comandos

```
Especificaciones:  /spec:*          (crear, decompose, validate, execute)
Git:               /git:*           (status, commit, push, checkout)
Checkpoints:       /checkpoint:*    (create, list, restore)
Desarrollo:        /dev:cleanup, /code-review
Agentes:           /agents-md:*     (cli, migration, init)
Otros:             /research, /validate-and-fix, /compact
```

---

## 📈 Métricas Comunes

| Métrica | Meta | Cómo Verificar |
|---------|------|-----------------|
| CLAUDE.md | <100 líneas | `wc -l CLAUDE.md` |
| MEMORY.md | <200 líneas | `wc -l MEMORY.md` |
| Test Coverage | >80% | `npm test -- --coverage` |
| TypeScript | 0 errores | `tsc --noEmit` |
| Linting | 0 warnings | `npm run lint` |

---

## 🚀 30 Segundos: Empezar Hoy

```bash
# 1. Verifica instalación (10s)
claudekit doctor

# 2. Ve a tu proyecto (5s)
cd tu-proyecto

# 3. Crea especificación (15s)
# En Claude Code: /spec:create "mi-feature"
```

Eso es todo. El resto es automático.

---

## 📚 Documentos Completos

- **CLAUDEKIT_GUIA_COMPLETA.md** — Referencia exhaustiva (15 min lectura)
- **CLAUDEKIT_RECETAS_PRACTICAS.md** — Paso a paso para tareas (10 min lectura)
- **CLAUDEKIT_CHEAT_SHEET.md** — Este archivo (2 min lectura)

---

## 🎯 Próximos Pasos

- [ ] Ejecuta `claudekit doctor`
- [ ] Crea CLAUDE.md en tu proyecto
- [ ] Usa `/spec:create` en próximo feature
- [ ] Experimenta con `/checkpoint:create`
- [ ] Lee CLAUDEKIT_GUIA_COMPLETA.md

---

**Versión:** 0.9.5  
**Última actualización:** 29 junio 2026

Bookmark esto. Lo usarás constantemente. 📌
