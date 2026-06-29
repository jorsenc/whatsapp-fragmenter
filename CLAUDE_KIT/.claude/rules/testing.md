---
name: testing-rules
description: Estándares Testing
applies_to: "**/*.test.ts,**/*.spec.ts"
---

# Reglas Testing

## Jest/Vitest
- Describe blocks organizan por feature
- Nombres claros: describe what, not how
- Máximo 3 expects por test (idealmente 1)
- `beforeEach` para setup compartido

## Mocking
- Mock solo en boundaries (API, DB, filesystem)
- No mockear lógica interna
- Stubs para simplificar, no ocultar

## Coverage
- 80% líneas mínimo
- 100% branches para lógica crítica (auth, validation)
- Excluir: boilerplate, setup, exports

## Async
- Await en tests async
- No `done()` callback
- `timeout` explícito si >1s

## Patrón AAA
1. **Arrange** — Setup
2. **Act** — Ejecutar
3. **Assert** — Verificar
