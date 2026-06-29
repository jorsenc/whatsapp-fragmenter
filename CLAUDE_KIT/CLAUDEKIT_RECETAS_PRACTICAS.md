# Claude Kit: Recetas Prácticas

Guía paso a paso para tareas específicas con Claude Kit.

---

## Receta 1: Implementar Nueva Característica (Rápido)

**Tiempo estimado:** 30 minutos para feature pequeña

### Paso 1: Crea especificación
```
Usuario: Necesito agregar 2FA a la autenticación
Claude: /spec:create "two-factor-authentication"
```

Claude genera automáticamente:
```markdown
# SPEC: Two-Factor Authentication

## Overview
Implementar autenticación de dos factores (2FA) con TOTP

## Requirements
- User model: agregar `twoFactorSecret`, `twoFactorEnabled`
- Endpoint: POST /auth/2fa/setup
- Endpoint: POST /auth/2fa/verify
- QR code generation
- Backup codes

## Architecture
- Use `speakeasy` para TOTP
- QR codes con `qrcode`
- Validación con Zod

## Tests
- Unit: TOTP generation y verification
- Integration: Setup y verify flow
- E2E: Login con 2FA

## Implementation Order
1. Database: Add columns
2. Models: Update User schema
3. Utils: TOTP helpers
4. API: Setup endpoint
5. API: Verify endpoint
6. Tests: All flows
```

### Paso 2: Desglosa en subtareas
```
Claude: /spec:decompose
```

Genera lista ejecutable:
```
Subtask 1: Database migration
Subtask 2: User model update
Subtask 3: TOTP generation utility
Subtask 4: /auth/2fa/setup endpoint
Subtask 5: /auth/2fa/verify endpoint
Subtask 6: Backup codes generation
Subtask 7: Unit tests
Subtask 8: Integration tests
```

### Paso 3: Implementa primero la subtarea 1
```
Claude: Voy a crear la migración de base de datos

[edita migration file]

✓ Validación automática (typecheck, lint)
```

### Paso 4: Subtarea 2
```
Claude: Actualizar User model

[edita schemas/User.ts]

✓ TypeScript compilation OK
✓ Linting passed
```

### Paso 5-6: Utilities + Endpoints
```
Claude: Crear utilidad TOTP y endpoints

[edita utils/totp.ts, routes/auth/2fa.ts]

✓ Tests ejecutados automáticamente
✓ Coverage: 88%
```

### Paso 7: Validación final
```
Claude: /spec:validate

Resultado:
✓ Todos requisitos implementados
✓ 92% test coverage
✓ Documentación actualizada
✓ No hay console.logs o debugger
```

### Paso 8: Commit
```
Claude: /git:commit

Mensaje generado:
feat: Add two-factor authentication (2FA) with TOTP
- Support TOTP-based 2FA
- Generate QR codes for authenticator apps
- Backup codes for account recovery
- Full E2E test coverage

Co-authored-by: Claude <claude@anthropic.com>
```

---

## Receta 2: Refactorizar Módulo Grande (Seguro)

**Tiempo estimado:** 2 horas

### Paso 1: Guardar punto de control
```
Claude: /checkpoint:create "Before UserService refactoring"
```

Git guarda estado actual como stash.

### Paso 2: Especificar cambios
```
Claude: /spec:create "refactor-user-service"

Contenido:
## Refactoring Goals
- Separar lógica de negocio en validators
- Extraer queries en repository pattern
- Mejorar error handling con custom errors
- Mantener 100% backwards compatibility

## Files to Change
- src/services/UserService.ts
- src/repositories/UserRepository.ts (nuevo)
- src/validators/UserValidator.ts (nuevo)
- src/errors/UserErrors.ts (nuevo)

## Test Plan
- Todos los tests existentes deben pasar
- Nuevos tests para validators
- Mock tests para repository
```

### Paso 3: Implementa cambios
```
Claude: Voy a refactorizar UserService

[edita archivos]

❌ Tests fallan: "UserService not exported"
Claude: Veo el problema, lo arreglo
[fix exports]

✓ Todos tests pasan
```

### Paso 4: Valida refactoring
```
Claude: /spec:validate

✓ Arquitectura mejorada
✓ Tests: 100%
✓ Backwards compatibility maintained
✓ Performance: equal or better
```

### Paso 5: Commit
```
Claude: /git:commit

Message: "refactor: Improve UserService architecture with repository pattern"
```

### Paso 6 (Si algo falla después):
```
Claude: /checkpoint:restore

[Vuelve al estado antes del refactoring]
[Nada perdido - puedes intentar de nuevo]
```

---

## Receta 3: Integración con Otro Asistente

**Escenario:** Usas Cursor en casa, Windsurf en oficina

### Paso 1: Migrar configuración
```
Claude: /agents-md:migration

[genera AGENTS.md con tu configuración]
```

### Paso 2: Crear symlink
```bash
# En terminal:
cd tu-proyecto
ln -s CLAUDE.md AGENTS.md
```

### Paso 3: Resultado
```
Archivo AGENTS.md → apunta a CLAUDE.md
(son el mismo archivo)

Cursor:   lee AGENTS.md
Windsurf: lee AGENTS.md
Claude:   lee CLAUDE.md

✓ Todos leen exactamente lo mismo
✓ Un único punto de verdad
```

### Paso 4: Capturar herramientas CLI
```
Claude: /agents-md:cli docker
Claude: /agents-md:cli kubectl
Claude: /agents-md:cli aws

[Añade a AGENTS.md todos los flags y opciones]
```

Ahora en cualquier asistente:
```
Usuario (en Windsurf): "¿Cómo debugueo un container?"
Windsurf: [consulta AGENTS.md]
→ Responde perfectamente con docker flags
```

---

## Receta 4: Code Review Pre-Deploy

**Tiempo:** 15 minutos

### Paso 1: Ejecutar review
```
Claude: /code-review
```

Obtiene análisis en 6 aspectos:

```
✓ ARCHITECTURE
  - Separación de responsabilidades OK
  - Coupling aceptable
  
⚠ SECURITY
  - Password validation OK
  - ⚠ API key en .env.example (DEBE ser .env.local)
  
✓ PERFORMANCE
  - No hay n+1 queries
  - Memoization apropiada en React
  
⚠ TESTING
  - 82% cobertura
  - ⚠ Falta E2E test para happy path
  
✓ DOCUMENTATION
  - API documentada con JSDoc
  - README actualizado
```

### Paso 2: Arreglar issues
```
Claude: Voy a mover API key a .env.local

[edita .env.example, .env.local]

Claude: Voy a agregar E2E test

[edita tests/e2e/auth.test.ts]

✓ Tests pasan
```

### Paso 3: Limpiar
```
Claude: /dev:cleanup
```

Elimina:
- console.log()
- debugger statements
- Archivos .backup o .tmp
- Comentarios // TODO sin asignar

### Paso 4: Final review
```
Claude: /code-review
```

Resultado:
```
CLEAN:
✓ Architecture: 9/10
✓ Security: 10/10
✓ Performance: 9/10
✓ Testing: 92%
✓ Documentation: Complete

Ready to deploy!
```

### Paso 5: Push
```
Claude: /git:commit
Claude: /git:push
```

---

## Receta 5: Sesión Larga con Compactación de Contexto

**Escenario:** Trabajas 8 horas en feature grande

### Hora 1-3: Desarrollo Normal
```
/spec:create
/checkpoint:create

[editas código]
```

### Hora 4: Contexto se agranda
```
Claude: Veo que el contexto está creciendo...
/compact

[resume últimas 4 horas]
[preserva reglas del CLAUDE.md]
[mantiene especificación]
```

### Hora 5-8: Continúa normal
```
Claude: Contexto limpio, continuamos
[trabaja igual que antes, pero más eficiente]
```

**Beneficio:** Mantiene velocidad mesmo en sesiones largas.

---

## Receta 6: Testing de Nueva Feature

**Escenario:** Acabas de terminar código, necesitas tests

### Paso 1: Especifica requisitos de testing
```
Claude: /spec:create "tests-payment-module"

Contenido:
## Test Requirements
- Unit tests: validators, helpers (95% coverage)
- Integration tests: API endpoints (mock DB)
- E2E tests: Happy path + error cases
- Performance: <100ms per request
```

### Paso 2: Implementa tests
```
Claude: Voy a crear unit tests

[edita tests/payment.unit.test.ts]

✓ Todos pasan
✓ Coverage: 97%

Claude: Ahora integration tests

[edita tests/payment.integration.test.ts]

✓ API endpoints funciona
```

### Paso 3: Valida
```
Claude: /spec:validate

✓ Unit: 97% coverage
✓ Integration: 100% happy path
✓ E2E: All flows tested
✓ Performance: 82ms average
```

### Paso 4: Report
```
Claude: /code-review

Testing section:
✓ 95%+ coverage
✓ Edge cases covered
✓ Error handling tested
✓ Integration tests present
```

---

## Receta 7: Debugging en Vivo

**Escenario:** Bug misterioso en producción

### Paso 1: Checkpoint del error
```
Claude: /checkpoint:create "Bug: Payment fails silently on weekends"

[guarda contexto actual]
```

### Paso 2: Investiga
```
Claude: /research "postgres connection pool issues weekends"

[busca artículos, documentación]
```

### Paso 3: Implementa fix
```
Claude: Voy a agregar retry logic

[edita src/db/connection.ts]

[agrega logging para debug]

✓ Tipos OK
✓ Tests pasan
```

### Paso 4: Verifica
```
Claude: /spec:validate "bugfix-weekend-payments"

✓ Retry logic implementada
✓ Logging en lugar correcto
✓ Tests pasan
```

### Paso 5: Deploy seguro
```
Claude: /git:commit "fix: Add retry logic for weekend DB connection issues"
Claude: /git:push

[Monitorea logs...]

✓ Bug resuelto
```

---

## Receta 8: Configurar Proyecto Nuevo

**Tiempo:** 10 minutos

### Paso 1: Inicializar proyecto
```bash
npm create next-app@latest my-project
cd my-project
```

### Paso 2: Instalar Claude Kit
```bash
npm install -g claudekit
claudekit setup -y --all
```

### Paso 3: Crear CLAUDE.md
```markdown
# My Project

## Tech Stack
- Next.js 14 (App Router)
- TypeScript, Tailwind, PostgreSQL
- Prisma ORM

## Quick Start
npm install
npm run dev
npm test

## Common Tasks
- Build: npm run build
- Deploy: vercel deploy
- DB: npx prisma migrate dev
```

### Paso 4: Capturar herramientas
```
Claude: /agents-md:cli npm
Claude: /agents-md:cli git
Claude: /agents-md:cli prisma
```

### Paso 5: Listo
```
Claude: /checkpoint:create "Initial setup"

[Ahora puedes empezar a desarrollar]
```

---

## Receta 9: Migración de Base de Datos Segura

**Escenario:** Cambios grandes de schema

### Paso 1: Planifica
```
Claude: /spec:create "migration-add-user-profiles"

Contenido:
## Migration Plan
1. Add `profiles` table
2. Migrate existing user data
3. Add NOT NULL constraint
4. Update models
5. Update tests

## Rollback Plan
- Keep previous schema in git
- Test rollback script
```

### Paso 2: Checkpoint
```
Claude: /checkpoint:create "Before database migration"
```

### Paso 3: Ejecuta cambios
```
Claude: Voy a crear la migración

[edita migrations/001_create_profiles.sql]

[edita prisma/schema.prisma]

Claude: Voy a migrar datos

[edita migrations/002_migrate_user_data.sql]

✓ Migration OK
✓ Data validated
```

### Paso 4: Tests
```
Claude: Voy a testear rollback

[edita tests/migrations.test.ts]

✓ Rollback funciona
✓ Data integrity maintained
```

### Paso 5: Deploy
```
Claude: /git:commit "feat: Add user profiles table"
Claude: /git:push

[Monitorea en producción...]
✓ Migration ejecutada exitosamente
```

---

## Receta 10: Equipo Colaborativo

**Escenario:** Múltiples personas en mismo proyecto

### Paso 1: Cada persona mantiene MEMORY.md local
```
sendra/MEMORY.md     - Preferencias y aprendizajes de Sendra
team/MEMORY.md       - Aprendizajes compartidos del equipo
```

### Paso 2: CLAUDE.md compartido (source of truth)
```
CLAUDE.md            - Reglas del proyecto (versionado en git)
.claude/rules/       - Reglas modulares compartidas
.claude/agents/      - Agentes configurados globalmente
```

### Paso 3: Workflow
```
Sendra:
1. /checkpoint:create "Starting feature X"
2. /spec:create "feature-x"
3. [trabaja]
4. /git:push

Juan:
1. /git:pull
2. Lee spec generada por Sendra en SPEC.md
3. [revisar cambios]
4. /code-review
```

### Paso 4: Sincronizar conocimiento
```
Sendra: /agents-md:cli postgres-special-syntax
[Añade a AGENTS.md - compartido en git]

Juan: [próxima sesión]
✓ Ya sabe sobre postgres-special-syntax
```

---

## Receta 11: Performance Optimization

**Escenario:** App lenta, necesita profiling

### Paso 1: Especificar
```
Claude: /spec:create "performance-optimization"

Contenido:
## Current State
- Page load: 3.2s (target: <1s)
- TTI: 4.1s (target: <2.5s)
- LCP: 2.8s (target: <1.2s)

## Investigation Areas
1. Bundle size (webpack analysis)
2. React renders (DevTools Profiler)
3. Database queries (n+1 detection)
4. CDN / Image optimization

## Success Criteria
- LCP: <1.2s
- TTI: <2.5s
- Core Web Vitals: Green
```

### Paso 2: Análisis
```
Claude: Voy a analizar bundle size

npm run analyze
[Identifica react, lodash, moment como problemas]

Claude: Voy a checkear N+1 queries

[agregar logging]
✓ Detecta 47 queries innecesarias
```

### Paso 3: Implementa optimizaciones
```
Claude: Voy a reemplazar moment con date-fns

[edita package.json, imports]

✓ Bundle: -340KB

Claude: Voy a usar useMemo en UserCard

[agrega memo + useMemo]

✓ Renders: -67%
```

### Paso 4: Valida
```
Claude: npm run analyze
Results: 2.3s → 0.9s (61% improvement)

Claude: /code-review
✓ Performance: Excellent
✓ No new issues introduced
```

---

## Quick Reference: Comandos Más Usados

```bash
# Desarrollo
/checkpoint:create "nombre"      # Guardar progreso
/checkpoint:restore              # Volver atrás

# Especificaciones
/spec:create "feature"           # Nueva feature
/spec:decompose                  # Dividir en tareas
/spec:validate                   # Verificar completitud

# Git
/git:status                      # Ver cambios
/git:commit                      # Commit automático
/git:push                        # Push a remoto

# Validación
/dev:cleanup                     # Limpiar código
/code-review                     # Análisis profundo

# Herramientas
/agents-md:cli <tool>            # Capturar CLI help
/research <tema>                 # Investigación web
```

---

**Última actualización:** 29 de junio de 2026
