# Memory: C:\GOOSE Workspace

Persistent memory and iteration log for the `C:\GOOSE` working directory. This file is the **session-survival anchor** — when a new session starts, read this first to resume context.

---

## 📌 Workspace Overview
Root working directory for the local goose / Pinokio development environment. Hosts multiple subprojects (e.g. `trade-control/`) and shared registries (e.g. `TESTED_MODELS.md`).

## 🛠 Current State (2026-06-19)

### Files in this directory
| File | Size | Purpose |
| :--- | :--- | :--- |
| `TESTED_MODELS.md` | 9 lines | Registry of LLM models tested with goose. |

### Active Subprojects
- `trade-control/` — TradeMaster Logger (single-file SPA, see its own `MEMORY.md`).

---

## 🔖 Session Checkpoint — 2026-06-19 (10:20)

### Context Snapshot
- Continuación desde checkpoint 09:45.
- Decisión del usuario: **auditar la app en profundidad y levantarla en servidor local** para poder probarla en Chrome.

### Auditoría realizada sobre `C:\GOOSE\model-tester\index.html`
**Verificaciones OK**:
- HTML bien formado (DOCTYPE, `<html lang>`, charset, viewport).
- Todos los tags cierran correctamente.
- JS IIFE con `'use strict'`, sin errores de sintaxis.
- 0 referencias a `localStorage`, 2 a `showOpenFilePicker`, 3 a `showSaveFilePicker`, 1 a `createWritable`.
- File System Access API correctamente envuelta con detección + mensaje claro para Firefox/Safari.
- Validación al abrir JSON: tipos, normalización de `status` inválidos.
- `AbortError` ignorado correctamente.
- `beforeunload` advierte si hay cambios sin guardar.
- Filtros con semántica AND.

**Issues encontrados y corregidos**:
| # | Issue | Fix |
| - | - | - |
| 1 | Caracteres corruptos (mojibake `�`) en CSS, HTML y JS por encoding UTF-8 mal interpretado al generar el archivo | Eliminados todos los chars no-ASCII; restaurados como escapes Unicode (`\u25CF`, `\u270E`, `\u2716`, `\u00D7`, `\u2715`, `\u2014`, `\u2026`, `\u201C`, `\u201D`) |
| 2 | Texto del empty state decía `Or "Save" to choose a location and begin.` (incorrecto) | Cambiado a `Or "New file" to choose a location and begin.` |
| 3 | Línea muerta `document.getElementById('newTagBtn');` | Eliminada |

**Resultado final**: 732 líneas, 31 346 bytes, 0 caracteres no-ASCII, sintaxis válida.

### Servidor local levantado
- **Comando**: `python -m http.server 8765 --bind 127.0.0.1` ejecutándose desde `C:\GOOSE`.
- **Proceso**: detached, sobrevive al shell padre. Confirmado `LISTENING` en `127.0.0.1:8765`.
- **Verificación**: `Invoke-WebRequest -Uri 'http://127.0.0.1:8765/model-tester/index.html'` → Status 200, 31 255 bytes, contenido válido.
- **URL para abrir en Chrome/Edge**: `http://127.0.0.1:8765/model-tester/index.html`

### Archivos vivos del workspace
| Path | Líneas | Tamaño | Propósito |
| :--- | ---: | ---: | :--- |
| `C:\GOOSE\MEMORY.md` | ~280 | * | Anclaje raíz (7 checkpoints) |
| `C:\GOOSE\TESTED_MODELS.md` | 14 | * | Registro de modelos (1 fila ⏳) |
| `C:\GOOSE\model-tester\index.html` | 732 | 31 346 B | App canónica en disco |
| `C:\GOOSE\model-tester\MEMORY.md` | ~100 | * | Anclaje subproyecto |
| `C:\GOOSE\trade-control\MEMORY.md` | * | * | Subproyecto TradeMaster Logger |

### Conclusión de la saga auditoría+deploy
- ✅ App auditada a fondo
- ✅ Encoding issues resueltos con escapes Unicode robustos
- ✅ Bugs menores corregidos
- ✅ Servidor local activo en `127.0.0.1:8765`
- ✅ URL verificada con HTTP 200
- ⏳ **Pendiente para el usuario**: abrir la URL en Chrome y probar manualmente (CRUD, tags, filtros, New file / Open / Save).

### Pending Action (Next Session)
1. **El usuario prueba la app manualmente** en Chrome vía `http://127.0.0.1:8765/model-tester/index.html`.
2. **Reportar feedback** de UX o bugs que aparezcan.
3. **Validar `minimax-m3:cloud`** con una tarea representativa con goose.
4. **Actualizar fila** de `TESTED_MODELS.md` con el resultado.
5. *(Opcional)* Limpiar checkpoint duplicado en `trade-control\MEMORY.md`.

---

## 🔖 Session Checkpoint — 2026-06-19 (09:45)

### Context Snapshot
- Continuación desde checkpoint 09:21.
- Decisión del usuario: **migrar la persistencia de `localStorage` a archivo JSON local en disco**.
- Motivación: `localStorage` ata los datos al navegador/perfil; el usuario quiere un archivo visible, portable y respaldable.

### Cambios aplicados
- **`C:\GOOSE\model-tester\index.html` reescrito** (596 → 733 líneas, ~31 KB).
  - Eliminado por completo: `localStorage`, `loadStorage`, `saveModels`, `saveTags`, `seed()`. Confirmado: 0 referencias en el archivo final.
  - Añadido: barra de archivo con `New file`, `Open…`, `Save` + label de archivo + indicador `●` de cambios sin guardar + status de guardado.
  - **API usada**: File System Access API (`window.showOpenFilePicker`, `window.showSaveFilePicker`, `FileSystemFileHandle.createWritable`).
  - **Auto-guardado**: 600 ms después de cualquier mutación (add/edit/delete/tags) cuando hay un archivo abierto.
  - **Schema del archivo JSON** (versión 1):
    ```json
    {
      "schemaVersion": 1,
      "models": [{ "id", "backend", "name", "status", "notes", "tags": [] }],
      "tagCatalog": ["Reasoning", ...]
    }
    ```
  - **Validación al abrir**: chequea tipos y normaliza `status` inválidos a `pending`; lanza error legible si el JSON no es válido.
  - **`Save` explícito** deshabilitado hasta que haya handle o cambios pendientes. `beforeunload` advierte si hay cambios sin guardar.

### Decisiones de UX
- **`New file`**: pide destino, crea archivo vacío con `schemaVersion` + `tagCatalog` por defecto.
- **`Open…`**: filtra por `.json`, valida, reemplaza estado en memoria.
- **`Save`**: escribe sobre el handle abierto. Si no hay handle, dispara `Save As`.
- Sin seed automático (antes sembraba `minimax-m3:cloud`): ahora el primer modelo lo añade el usuario.

### Compatibilidad
| Navegador | ¿Funciona? |
| :--- | :--- |
| Chrome / Edge / Opera | ✅ Sí |
| Firefox | ❌ No (muestra alerta al pulsar `New file` / `Open…`) |
| Safari | ❌ No |

### Archivos vivos del workspace
| Path | Líneas | Propósito |
| :--- | :--- | :--- |
| `C:\GOOSE\MEMORY.md` | ~225 | Anclaje raíz (6 checkpoints) |
| `C:\GOOSE\TESTED_MODELS.md` | 14 | Registro de modelos (1 fila ⏳) |
| `C:\GOOSE\model-tester\index.html` | 733 | **App canónica en disco** — usa File System Access API |
| `C:\GOOSE\model-tester\MEMORY.md` | ~95 | Anclaje subproyecto |
| `C:\GOOSE\trade-control\MEMORY.md` | * | Subproyecto TradeMaster Logger |

### Pending Action (Next Session)
1. **Validar `minimax-m3:cloud`** ejecutando una tarea representativa con goose.
2. **Actualizar fila** de `TESTED_MODELS.md` con el resultado.
3. **Probar `model-tester/index.html`** en Chrome/Edge — `New file` → añadir modelo → cerrar y reabrir.
4. *(Opcional)* Limpiar checkpoint duplicado en `trade-control\MEMORY.md`.
5. **Añadir nuevo checkpoint** con resultados.

---

## 🔖 Session Checkpoint — 2026-06-19 (09:21)

### Context Snapshot
- Continuación desde checkpoint 09:20.
- Decisión del usuario: **borrar la app sandbox `model-tester`**; el archivo en disco `C:\GOOSE\model-tester\index.html` pasa a ser la versión canónica.

### Cambios aplicados
- `apps__delete_app(name="model-tester")` ejecutado → respuesta `Deleted app 'model-tester'`.
- Verificación post-borrado:
  - `apps__list_apps` → 6 apps (sin `model-tester`).
  - `extensionmanager__list_resources` → no aparece `ui://apps/model-tester`.
- `C:\GOOSE\model-tester\MEMORY.md` — actualizada la sección crítica (sin copia paralela).
- `C:\GOOSE\MEMORY.md` (raíz) — este checkpoint.

### Estado final del workspace
| Path | Líneas | Propósito |
| :--- | :--- | :--- |
| `C:\GOOSE\MEMORY.md` | ~190 | Anclaje raíz (5 checkpoints acumulados) |
| `C:\GOOSE\TESTED_MODELS.md` | 14 | Registro de modelos (1 fila ⏳) |
| `C:\GOOSE\model-tester\index.html` | 596 | App Model Tester — **versión canónica en disco** |
| `C:\GOOSE\model-tester\MEMORY.md` | ~90 | Anclaje del subproyecto |
| `C:\GOOSE\trade-control\MEMORY.md` | * | Subproyecto TradeMaster Logger |

### Conclusión de la saga `Model Tester`
- ✅ Brief capturado (5 preguntas).
- ✅ App prototipada en sandbox de goose.
- ✅ Código auditado.
- ✅ App portada a archivo en disco en `C:\GOOSE\model-tester/`.
- ✅ Sandbox borrada — sin duplicidad.
- ⏳ Pendiente: validar manualmente abriendo el `index.html` en navegador.

### Pending Action (Next Session)
1. **Validar `minimax-m3:cloud`** ejecutando una tarea representativa con goose.
2. **Actualizar fila** de `TESTED_MODELS.md` con el resultado.
3. **Abrir `C:\GOOSE\model-tester\index.html`** en navegador y probar CRUD + tags + filtros.
4. *(Opcional)* Limpiar checkpoint duplicado en `trade-control\MEMORY.md`.
5. **Añadir nuevo checkpoint** con resultados.

---

## 🔖 Session Checkpoint — 2026-06-19 (09:20)

### Context Snapshot
- Continuación desde checkpoint 09:15.
- Usuario pidió continuar → **portar `Model Tester` a archivo en disco** en `C:\GOOSE\model-tester/` para tener persistencia entre navegadores/sandbox, mismo patrón que `trade-control/`.

### Cambios aplicados
- `C:\GOOSE\model-tester\index.html` — creado (596 líneas).
  - Código fuente: extraído del recurso `ui://apps/model-tester` (goose sandbox app).
  - HTML+CSS+JS vanilla, mismo comportamiento, mismas storage keys (`modelTester.models`, `modelTester.tagCatalog`).
- `C:\GOOSE\model-tester\MEMORY.md` — creado (86 líneas) como anclaje del subproyecto.

### Decisión sobre la app sandbox
- **Estado actual**: existen **dos copias**:
  1. Sandbox app `model-tester` (en el panel `[Apps]` de goose, recurso `ui://apps/model-tester`).
  2. Archivo `C:\GOOSE\model-tester\index.html` (nuevo, en disco).
- **No están sincronizadas**: comparten keys de `localStorage` pero viven en distintos orígenes de navegador (sandbox vs `file://`).
- **Recomendación**: usar la versión en disco como canónica y borrar la sandbox para evitar confusión. Pendiente de confirmación del usuario.

### Archivos vivos del workspace (post-sesión)
| Path | Líneas | Propósito |
| :--- | :--- | :--- |
| `C:\GOOSE\MEMORY.md` | ~155 | Anclaje raíz |
| `C:\GOOSE\TESTED_MODELS.md` | 14 | Registro de modelos |
| `C:\GOOSE\model-tester\index.html` | 596 | App Model Tester (disco) |
| `C:\GOOSE\model-tester\MEMORY.md` | 86 | Anclaje subproyecto |
| `C:\GOOSE\trade-control\MEMORY.md` | * | Subproyecto TradeMaster Logger |
| Sandbox `model-tester` (apps panel) | — | ⚠️ Duplicado a eliminar |

### Pending Action (Next Session)
1. **Validar `minimax-m3:cloud`** ejecutando una tarea representativa con goose.
2. **Actualizar fila** de `TESTED_MODELS.md` con el resultado (flip status + notas).
3. **Probar `C:\GOOSE\model-tester\index.html`** en navegador (CRUD, tags, filtros).
4. **Decidir y ejecutar** el borrado de la app sandbox `model-tester`.
5. *(Opcional)* Limpiar checkpoint duplicado en `trade-control\MEMORY.md`.
6. **Añadir nuevo checkpoint** a `MEMORY.md` con los resultados.

---

## 🔖 Session Checkpoint — 2026-06-19 (09:15)

### Context Snapshot
- Reload del estado: leído `MEMORY.md` → continuaba checkpoint 08:37 con el cambio de convención de columnas en `TESTED_MODELS.md`.
- Usuario pidió construir una **app ligera** para gestionar el testing de modelos (alta/baja, editar estado).
- Hicimos **briefing de 5 preguntas**:
  1. Forma del dato → **una línea por modelo**, sin runs ni historial.
  2. *(N/A)* — sin runs, se anuló la pregunta 2 original sobre campos por run.
  3. Sistema de tags → **catálogo cerrado predefinido**.
  4. Estado global → mismo set que `TESTED_MODELS.md` (Servicio/Backend, Modelo, Estado, Notas) **+ tags** como único campo nuevo.
  5. Catálogo inicial (a) **curado genérico** (`Reasoning, Code, Tool-Use, Long-Context, Math, Multilingual, Other`); (ii) **ampliable desde UI**; (β) **varios por modelo**.
- Usuario confirmó: nombre **`Model Tester`**, mantener todo lo lightweight posible (sin export/import, sin librerías).
- Verificación `tom`: tras acción del usuario, `tom` sigue marcada "not currently available" y sin tools/recursos. Se documenta como **sin cambio efectivo**.

### Cambios aplicados
- App **`Model Tester`** generada vía `apps__create_app` (1100×700).
  - Primer intento falló por error de parseo del tool (`missing field 'html'`) — el LLM devolvió texto adicional junto al JSON.
  - Segundo intento con PRD más compacto **funcionó**.
  - Código **auditado leyendo el HTML completo** vía `extensionmanager__read_resource(uri="ui://apps/model-tester")`. Cumplimiento del brief: 100%.
- `C:\GOOSE\TESTED_MODELS.md` — intacto desde el checkpoint 08:37 (14 líneas).
- `C:\GOOSE\MEMORY.md` — este checkpoint (el de 08:37 queda conservado arriba).

### Especificación ejecutada (resumen técnico)
- **Stack**: HTML+CSS+JS vanilla en un solo `index.html`, ~370 líneas.
- **Persistencia**: `localStorage` con keys `modelTester.models` y `modelTester.tagCatalog`.
- **Modelo**: `{ id, backend, name, status, notes, tags[] }` — `status ∈ {pending, tested, failed}`.
- **Seed**: si vacío, precarga `minimax-m3:cloud` (Ollama, pending) + catálogo por defecto.
- **UI**: header (título + contador + botones), filtros (status single + tags multi), tabla con badges, modal add/edit, modal tag manager.
- **Tag semantics**: filtrado AND; tags fuera del catálogo se muestran como `(custom)` en ámbar; eliminarlos del catálogo **no** los quita de filas existentes.
- **Seguridad**: solo `textContent` (nada de `innerHTML` con user data); `crypto.randomUUID()` con fallback.

### Archivos / artefactos tocados
- App `model-tester` — creada y registrada (no es un archivo en disco; vive en el sandbox de apps de goose).
- `C:\GOOSE\MEMORY.md` — checkpoint añadido.

### Notas operativas
- **Apps en sandbox**: la app **no se abre automáticamente**; el usuario debe abrirla desde el panel `[Apps]` de goose. No vive como archivo en `C:\GOOSE\`.
- **Persistencia**: vive en el `localStorage` del navegador donde se abra la app. Cada sesión de UI tiene su propio storage → si se abre en otro perfil/navegador, los datos no aparecen.
- **Próxima iteración posible**: si se quiere archivo `.html` portable en disco (estilo `trade-control/index.html`), habría que extraerlo del recurso `ui://apps/model-tester` y guardarlo en `C:\GOOSE\model-tester/index.html` con `apps__delete_app` + `write` manual.

### Pending Action (Next Session)
1. **Validar `minimax-m3:cloud`** ejecutando una tarea representativa con goose.
2. **Actualizar fila** de `TESTED_MODELS.md` con el resultado (flip status + notas).
3. *(Opcional)* **Portar `Model Tester` a `C:\GOOSE\model-tester/index.html`** para tener archivo en disco y persistente entre navegadores.
4. *(Opcional)* **Resolver limpieza** del checkpoint duplicado en `trade-control/MEMORY.md`.
5. **Añadir nuevo checkpoint** a `MEMORY.md` con la validación del modelo.

---

## 🔖 Session Checkpoint — 2026-06-19 (08:37)

### Context Snapshot
- Reload del estado: leído `C:\GOOSE\MEMORY.md` y confirmado el checkpoint previo (validación de `minimax-m3:cloud` seguía pendiente).
- Decisión del usuario: la columna "Proveedor" en `TESTED_MODELS.md` debe reflejar el **servicio / backend** que sirve el modelo. En este workspace todo se ejecuta vía **Ollama** (incluso los tags `:cloud`, que delegan en la nube de Ollama pero siguen entrando por el runtime de Ollama).

### Cambios aplicados
- `C:\GOOSE\TESTED_MODELS.md` — refactor de la tabla para separar dos columnas:
  - **Servicio / Backend** → ahora `Ollama`.
  - **Modelo** → ahora `minimax-m3:cloud`.
  - Añadido bloque `## 📝 Notas de servicio` describiendo Ollama como runtime / bridge y el significado del tag `:cloud`.
- `C:\GOOSE\MEMORY.md` — este checkpoint.

### Convensión adoptada (a respetar en filas futuras)
| Columna | Significado |
| :--- | :--- |
| **Servicio / Backend** | Infraestructura que sirve el modelo (Ollama, OpenAI, Anthropic, …). |
| **Modelo** | Identificador invocado desde ese servicio. |
| **Estado** | ⏳ Pendiente / ✅ Tested / ❌ Failed. |
| **Notas** | Detalles operativos (cutoff, comando, observaciones). |

### Pending Action (Next Session)
1. **Validar `minimax-m3:cloud`** ejecutando una tarea representativa con goose.
2. **Actualizar `TESTED_MODELS.md`**:
   - Flip status ⏳ Pendiente → ✅ Tested / ❌ Failed (con motivo).
   - Rellenar comando del provider, notas de compatibilidad, observaciones de benchmark.
3. **Resolver limpieza opcional** del checkpoint duplicado en `trade-control/MEMORY.md`.
4. **Añadir un nuevo checkpoint** a este `MEMORY.md` con el resultado de la validación.

### Files Touched This Session (08:37)
- `C:\GOOSE\TESTED_MODELS.md` — refactor de columnas (9 → 20 líneas) + sección `📝 Notas de servicio`.
- `C:\GOOSE\MEMORY.md` — checkpoint actualizado.

---

## 🔖 Session Checkpoint — 2026-06-19 (anterior, conservado para historial)

### Context Snapshot
- User asked to inspect the `trade-control/` project structure → confirmed single-file SPA (`index.html`) with `localStorage` persistence.
- User requested adding [`minimax-m3:cloud`](https://ollama.com/library/minimax-m3:cloud) to `C:\GOOSE\TESTED_MODELS.md`.
- `TESTED_MODELS.md` existed but was **empty (0 bytes)**. Created initial scaffold (markdown table) with one row:
  - **Model**: `minimax-m3:cloud` — Provider: Ollama Cloud — Status: ⏳ Pendiente — Notes: MiniMax-M3, knowledge cutoff Jan 2026.
- User then asked to **persist this checkpoint** in the current directory's memory (not the `trade-control/` one). This file is the result.

### Files Touched This Session (original)
- `C:\GOOSE\TESTED_MODELS.md` — created from empty (0 → 9 líneas).
- `C:\GOOSE\MEMORY.md` — created (this file).
- `C:\GOOSE\trade-control\MEMORY.md` — appended an earlier (now-superseded) checkpoint. *Limpieza opcional pendiente.*

---

## 🚩 Critical Notes
- **Scope**: This memory is scoped to `C:\GOOSE` itself, not its subprojects. Each subproject should keep its own `MEMORY.md` for project-specific context.
- **Convención de tabla en `TESTED_MODELS.md`**: columna **Servicio / Backend** = infraestructura (Ollama, OpenAI, …); columna **Modelo** = identificador concreto.
- **Update protocol**: Whenever a session ends with unresolved work, append a new `## 🔖 Session Checkpoint — YYYY-MM-DD (HH:MM)` block before closing.
