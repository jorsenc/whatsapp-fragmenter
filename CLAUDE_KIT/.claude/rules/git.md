---
name: git-rules
description: Estándares Git
---

# Reglas Git

## Commits
- Imperativo: "Add feature" (no "Added feature")
- Primera línea <50 caracteres
- Body explica "why" no "what"
- Referencia issues: "Fixes #123"

## Branches
- Formato: `feature/`, `fix/`, `refactor/`, `docs/`
- Nombres: kebab-case
- Máximo 50 caracteres después del prefijo

## PRs
- Título <70 caracteres
- Descripción: Summary, Changes, Testing
- Rebase sobre main antes de merge
- Todos los checks en verde

## Verificación
- Sin `console.log()` en producción
- Sin secretos (API keys, passwords)
- Código pasa linter
- Tests pasen
