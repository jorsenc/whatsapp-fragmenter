# Memory: C:\GOOSE\model-tester

Persistent memory for the `Model Tester` subproject. This is the session-survival anchor for this project.

---

## 📌 Project Overview

**Model Tester** — lightweight single-file SPA for tracking LLM models under test. One row per model, no runs/history, tag-based categorization, status workflow, and persistent state via `localStorage`.

**Live in workspace since**: 2026-06-19.

---

## 🛠 Current State

### Files
| File | Lines | Purpose |
| :--- | :--- | :--- |
| `index.html` | ~596 | Single-file app: HTML + CSS + vanilla JS. No deps, no build step. |

### Tech
- **Stack**: Vanilla HTML/CSS/JS in a single `index.html`.
- **Persistence**: File System Access API → writes a local JSON file (NOT `localStorage`).
  - Storage keys (when applicable) would have been `modelTester.models`, `modelTester.tagCatalog`.
  - File schema: `{ schemaVersion: 1, models: [...], tagCatalog: [...] }`.
- **External**: none (zero network requests, zero CDN).
- **Open with**: Chrome, Edge or Opera (any modern browser that supports the File System Access API).
- **Browser support**: Chrome / Edge / Opera ✅. Firefox ❌. Safari ❌.

### Data model
```js
{
  models: [
    { id: "uuid", backend: "Ollama", name: "minimax-m3:cloud",
      status: "pending|tested|failed", notes: "...", tags: ["Reasoning", ...] }
  ],
  tagCatalog: ["Reasoning","Code","Tool-Use","Long-Context","Math","Multilingual","Other"]
}
```

### UI features
- Header: title + counter + `+ Add model` / `Manage tags`.
- Filters: status (single chip) + tags (multi-chip, AND semantics).
- Table: backend, model, status badge, tag badges, notes, edit/delete actions.
- Modal Add/Edit: backend, model, status segmented, notes, tag checkboxes + new tag input.
- Modal Manage tags: catalog chips with ×, add new tag input.

### Default seed
- 1 row: `Ollama` / `minimax-m3:cloud` / `pending` / notes about Jan 2026 cutoff.
- 7 tags: `Reasoning, Code, Tool-Use, Long-Context, Math, Multilingual, Other`.

### Tag semantics
- Removing a tag from the catalog does **not** strip it from existing models.
- Tags not in the catalog render as `(custom)` with amber badge.
- Filter with multiple tags uses AND (model must contain all selected tags).

---

## 🔖 Session Checkpoint — 2026-06-19 (09:20)

### Context Snapshot
- App originally generated as goose sandbox app `model-tester` (UI: `ui://apps/model-tester`, 1100×700). Code audited by reading the resource.
- User asked to continue: **port the app to disk** so it lives as a project under `C:\GOOSE\model-tester/` (same pattern as `trade-control/`).

### Changes applied
- Created `C:\GOOSE\model-tester\index.html` — full port of the sandbox app.
  - Source: HTML extracted from `ui://apps/model-tester` via `extensionmanager__read_resource`.
  - 596 lines. Same behavior as sandbox version.
- Created this `MEMORY.md` as project anchor.

### Pending Action (Next Session)
1. **Validate app in browser** — open `C:\GOOSE\model-tester\index.html` and exercise add/edit/delete/tag flows.
2. **Decide sandbox fate** — keep or delete the goose sandbox `model-tester` app (no live sync with disk version).
3. **Iterate on UX** based on user feedback.
4. **Add export/import** if requested (currently out of scope per "keep lightweight").

### Files Touched This Session
- `C:\GOOSE\model-tester\index.html` — created (596 lines).
- `C:\GOOSE\model-tester\MEMORY.md` — created, then updated at 09:21 to reflect sandbox deletion.
- `C:\GOOSE\MEMORY.md` (parent) — checkpoint appended at 09:20 and 09:21.

---

## 🔖 Session Checkpoint — 2026-06-19 (10:20)

### Context Snapshot
- Continuación desde 09:45 (mismo día).
- Decisión: **auditar a fondo el `index.html` y desplegar en servidor local** para pruebas en Chrome.

### Cambios aplicados en `C:\GOOSE\model-tester\index.html`
- **Encoding**: se detectaron caracteres corruptos (`U+FFFD`) en CSS, HTML y JS producidos durante la generación inicial desde el sandbox de goose. Eliminados todos los chars no-ASCII y restaurados con **escapes Unicode explícitos** (`\u25CF`, `\u270E`, `\u2716`, `\u00D7`, `\u2715`, `\u2014`, `\u2026`, `\u201C`, `\u201D`). Esto sobrevive a cualquier encoding al guardar.
- **Empty state text**: corregido `Or "Save" to choose...` → `Or "New file" to choose...`.
- **Línea muerta** eliminada: `document.getElementById('newTagBtn');` placeholder sin uso.

### Verificación post-fix
- 732 líneas (era 733).
- 0 referencias a `localStorage`.
- 0 caracteres no-ASCII en el archivo (todos los símbolos via `\u…`).
- Tamaño: 31 346 bytes.

### Servidor local
- Levantado: `python -m http.server 8765 --bind 127.0.0.1` desde `C:\GOOSE`.
- Estado: `LISTENING` en `127.0.0.1:8765` (proceso detached).
- Verificación HTTP: `GET /model-tester/index.html` → 200 OK, 31 255 bytes.
- URL: **`http://127.0.0.1:8765/model-tester/index.html`**

### Files Touched This Session
- `C:\GOOSE\model-tester\index.html` — encoding fix + correcciones (732 líneas).
- `C:\GOOSE\MEMORY.md` (raíz) — checkpoint 10:20 añadido.
- `C:\GOOSE\model-tester\MEMORY.md` — checkpoint 10:20 añadido.

### Pending Action (Next Session)
1. Probar la app en Chrome/Edge vía la URL local.
2. Reportar bugs/UX issues.
3. Validar `minimax-m3:cloud` con goose.
4. Limpiar checkpoint duplicado en `trade-control\MEMORY.md`.

---

## 🔖 Session Checkpoint — 2026-06-19 (09:45)

### Context Snapshot
- Continuación desde checkpoint 09:21 (mismo día, ~24 min después).
- Decisión: migrar persistencia de **`localStorage` a archivo JSON local en disco**.

### Cambios aplicados
- `C:\GOOSE\model-tester\index.html` reescrito (596 → 733 líneas, ~31 KB).
  - **Eliminado** todo uso de `localStorage`, `loadStorage`, `saveModels`, `saveTags`, `seed()`. Verificado: 0 referencias en el archivo final.
  - **Añadido**: File System Access API (Chrome/Edge/Opera).
    - `showOpenFilePicker` (2 refs), `showSaveFilePicker` (3 refs), `createWritable` (1 ref).
  - **UI nueva**: barra de archivo con botones `New file` / `Open…` / `Save`, label de nombre, indicador `●` para cambios sin guardar, status temporal de guardado.
  - **Auto-guardado**: 600 ms tras cualquier mutación si hay handle abierto.
  - **Schema del archivo**:
    ```json
    { "schemaVersion": 1, "models": [...], "tagCatalog": [...] }
    ```
  - **Validación** al abrir: tipos, normalización de `status` inválidos a `pending`.
  - `beforeunload` advierte antes de cerrar pestaña con cambios sin guardar.

### Decisiones de UX
- Sin seed automático (antes sembraba `minimax-m3:cloud`). Ahora el usuario crea su primer modelo.
- `Save` deshabilitado hasta tener handle o cambios pendientes.

### Compatibilidad
| Navegador | Soporte |
| :--- | :--- |
| Chrome / Edge / Opera | ✅ Sí |
| Firefox | ❌ No (alerta en `New`/`Open`) |
| Safari | ❌ No |

### Files Touched This Session
- `C:\GOOSE\model-tester\index.html` — reescrito en 09:45.
- `C:\GOOSE\model-tester\MEMORY.md` — checkpoint añadido.
- `C:\GOOSE\MEMORY.md` (raíz) — checkpoint añadido en 09:45.

### Pending Action (Next Session)
1. Probar `model-tester/index.html` en Chrome/Edge.
2. Validar `minimax-m3:cloud` con goose.
3. Limpiar checkpoint duplicado en `trade-control\MEMORY.md`.

---

## 🔖 Session Checkpoint — 2026-06-19 (09:21)

### Context Snapshot
- Decisión del usuario: borrar la app sandbox `model-tester` para tener **una única versión canónica en disco**.

### Cambios aplicados
- `apps__delete_app(name="model-tester")` ejecutado.
- Verificación post-borrado: ya no aparece ni en `apps__list_apps` ni en `extensionmanager__list_resources`.
- `C:\GOOSE\MEMORY.md` (raíz) — checkpoint añadido.

### Files Touched This Session
- `C:\GOOSE\model-tester\index.html` — creada en 09:20.
- `C:\GOOSE\model-tester\MEMORY.md` — creada en 09:20, actualizada en 09:21.
- `C:\GOOSE\MEMORY.md` (raíz) — checkpoint añadido en 09:21.

---

## 🚩 Critical Notes
- **Scope**: This memory is scoped to `C:\GOOSE\model-tester` only. The parent `C:\GOOSE\MEMORY.md` tracks workspace-level context.
- **Una sola versión canónica**: este `index.html` es la **única** versión viva de `Model Tester`. La copia sandbox fue eliminada en 09:21.
- **Browser compatibility**: requires File System Access API. **Chrome, Edge, Opera ✅**. Firefox ❌ and Safari ❌ will show a clear alert when the user clicks `New file` or `Open…`.
- **Browser compatibility (language)**: modern evergreen only (`crypto.randomUUID`, `replaceChildren`, CSS variables, ES2017+, `async/await`).
- **No export/import by design** — keeps it lightweight. The file-on-disk model itself is the export.