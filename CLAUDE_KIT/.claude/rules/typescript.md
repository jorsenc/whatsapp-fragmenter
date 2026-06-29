---
name: typescript-rules
description: Estándares TypeScript
applies_to: "**/*.ts,**/*.tsx"
---

# Reglas TypeScript

## Tipos
- Tipos explícitos en funciones públicas
- Evitar `any` — usar `unknown` + type guards
- Interfaces para tipos complejos, tipos inline para simples

## Naming
- `PascalCase` — tipos, interfaces
- `camelCase` — variables, funciones
- `UPPER_SNAKE_CASE` — constantes

## Patrones
- Utility types (Partial, Omit, Record)
- Discriminated unions
- Generics con restricciones (`extends`)

## Performance
- Lazy load tipos grandes
- Evitar tipos circulares
- `as const` para valores literales
