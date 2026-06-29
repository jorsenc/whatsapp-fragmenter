# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Workspace Explorer** is a web application that scans a workspace containing multiple projects, catalogs their metadata (type, technologies, structure, documentation), and provides an interactive UI for exploring, searching, and viewing project files.

The application serves a dual purpose:
1. **Backend Scanner** — Node.js script that recursively analyzes all projects in the workspace, extracting type, tech stack, file structure, and metadata
2. **Frontend Browser** — Interactive web UI (vanilla JS) for viewing project information, filtering/searching, and displaying file contents with markdown rendering support

## Architecture

### High-Level Flow

```
Workspace (C:\WORKSPACE)
    ├── .workspace_app/ (this directory)
    │   ├── scan-workspace.js    (analyzes all projects → generates JSON)
    │   ├── server.js             (serves frontend + workspace files)
    │   ├── index.html            (frontend UI)
    │   ├── styles.css            (monochrome styling)
    │   └── workspace-data.json   (generated: project metadata)
    │
    └── [20+ projects]
        ├── BirthdayManager/
        ├── GITHUB_WEB/
        ├── gdrive-mcp-server/
        └── ... (other projects, each can be any type)
```

### Data Generation Pipeline

1. **Scanning** (`scan-workspace.js`)
   - Walks workspace root directory (excluding `.git`, `node_modules`, etc.)
   - For each project directory, analyzes:
     - **Type detection**: Reads `package.json`, `astro.config.mjs`, README, etc. to classify (Web App, Node.js Project, MCP Server, Astro Site, Documentation, etc.)
     - **Tech stack**: Parses `package.json` dependencies (Express, Astro, React, TypeScript, etc.)
     - **Description**: Extracts from README.md, CLAUDE.md, or package.json
     - **File tree**: Recursively builds directory structure (max 3 levels, 50 files per level)
     - **Statistics**: Checks for `.git`, test files, `.env`, README, CLAUDE.md
     - **Intelligent classification**: Detects languages, frameworks, and purpose
   - Generates `workspace-data.json` with all project metadata

2. **Serving** (`server.js`)
   - HTTP server on port 8080
   - Serves frontend assets (`index.html`, `styles.css`)
   - **`/rescan`** endpoint: Triggers `scan-workspace.js`, returns updated project data
   - **`/workspace-files/*`** endpoint: Serves project files (with path validation for security)

3. **Frontend** (`index.html`)
   - Loads `workspace-data.json` on page load
   - Renders project list with search/filter UI
   - On project click: shows details (description, tech stack, file tree, stats)
   - On file click in tree: fetches from `/workspace-files/` endpoint
   - **Markdown rendering**: Uses `marked.js` library to parse `.md` files
   - **File browsing**: Shows raw text in `<pre>` for non-markdown files
   - **Export**: JSON and CSV export of all project metadata

### Tech Stack

- **Backend**: Node.js (no framework needed; built-in `http` module)
- **Frontend**: Vanilla JavaScript (ES6)
- **Markdown**: `marked.js` (CDN-loaded)
- **Styling**: CSS (monochrome: dark bg with white text, accent grays)
- **Runtime**: Node.js 14+

## Common Commands

### Running the Application

```bash
# Navigate to workspace_app directory
cd C:\WORKSPACE\.workspace_app

# Start the server (runs on http://localhost:8080)
node server.js

# In another terminal, rescan workspace programmatically
node scan-workspace.js

# The /rescan endpoint can also be used from the browser UI button
```

### Scanning the Workspace

```bash
# Generate/update workspace-data.json (called manually or via /rescan endpoint)
node scan-workspace.js

# Output goes to: workspace-data.json
# Console shows progress: "OK [project-name]" for each project found
```

### Development Workflow

The application doesn't have a build step — all files are served directly:
- Edit `index.html` for frontend structure/layout
- Edit `styles.css` for styling
- Edit `scan-workspace.js` to change project detection logic
- Edit `server.js` to add/modify endpoints

## File Structure

### Root Files

| File | Purpose |
|------|---------|
| `server.js` | HTTP server; serves frontend, workspace-files, rescan endpoint |
| `index.html` | Frontend UI; project list, search, file viewer, details panel |
| `styles.css` | Styling for all UI elements (responsive, monochrome theme) |
| `scan-workspace.js` | Project scanner; analyzes workspace and generates `workspace-data.json` |
| `workspace-data.json` | Generated; contains all project metadata (project count, file trees, stats, tech stack) |

### Frontend Components in `index.html`

- **Header**: Title, search bar, type filter, export buttons, statistics
- **Projects Panel**: List of all projects (searchable, filterable)
- **Details Sidebar**: Shows full details for selected project (path, type, tech, stats, file tree)
- **File Modal**: Modal dialog for viewing file contents (with markdown rendering)
- **Footer**: Version info

### Key JavaScript Functions

**Data Loading & Rendering:**
- `loadWorkspaceData()` — Fetch and parse `workspace-data.json`
- `renderProjects(projects)` — Display project list in DOM
- `showProjectDetails(project)` — Populate sidebar with project info

**File & Tree Navigation:**
- `renderFileTree(tree, depth, projectName)` — Recursive file tree HTML generator
- `previewTreeFile(projectName, filePath)` — Load and display file in modal
- `loadFileContent(projectName, fileName)` — Load specific file (README, CLAUDE.md, etc.)

**Search & Filter:**
- `filterProjects()` — Filter by search text and type dropdown

**Export:**
- `exportJSON()` / `exportCSV()` — Generate and download exports

**Utilities:**
- `escapeHtml(text)` — Sanitize HTML to prevent XSS
- `formatBytes(bytes)` — Convert bytes to human-readable size
- `calculateTotalSize(projects)` — Sum all project sizes

### Project Detection Logic in `scan-workspace.js`

The scanner identifies project types through this sequence:

1. **Check `package.json`** (if exists):
   - If name contains "mcp" or has `index.ts` → "MCP Server"
   - If has `astro.config.mjs` → "Astro Site"
   - If has `scripts.start` or `scripts.dev` → "Web App"
   - Otherwise → "Node.js Project"

2. **Check config files**:
   - `astro.config.mjs` → "Astro Site"
   - `index.md` or `.md` files → "Documentation"
   - `.py` files → "Python Project"
   - `.git/` → "Git Repository"

3. **Fallback** → "Mixed Project"

**Tech Stack Detection** parses `package.json` for:
- Frameworks: Express, Astro, React, Vue, Next.js, Ollama
- Languages: TypeScript, Python
- Tools: Axios, CORS
- File extensions: `.ts`, `.tsx`, `.py`, `requirements.txt`

**Intelligent Classification** adds tags like: "Web Application", "Backend", "Frontend", "Testing", etc. based on dependencies and file analysis.

### Styling Architecture

CSS uses CSS variables for a cohesive monochrome design:

```css
--primary: #ffffff          /* Main accent (borders, headers) */
--accent: #e0e0e0          /* Light gray for secondary elements */
--accent2: #b0b0b0         /* Medium gray */
--accent3: #a0a0a0         /* Darker gray */
--bg: #0d0d0d              /* Very dark background */
--bg-light: #1a1a1a        /* Slightly lighter background */
--text: #ffffff            /* Main text color */
--text-muted: #888888      /* Muted/secondary text */
```

Key sections:
- **Header**: Sticky, with two-column layout (search left, stats/buttons right)
- **Projects Panel**: Left side; scrollable project list with items
- **Details Sidebar**: Right side; collapsible, shows full project info and file tree
- **File Tree**: Nested HTML with toggle arrows; clickable files trigger preview
- **Modal**: Centered overlay for file content preview; scrollable
- **Responsive**: Grid layout adapts to screen size

## Extending the Application

### Adding New Export Formats

In `index.html`, add to export functions:

```javascript
function exportXML() {
  // Generate XML from allProjects
  // Use downloadFile(content, 'workspace-export.xml', 'application/xml')
}
```

### Modifying Project Detection

Edit `scan-workspace.js` functions:
- `getProjectType(dirPath)` — Change type classification logic
- `getTechStack(dirPath)` — Add new tech detection
- `classifyProject(...)` — Extend intelligent classification
- `IGNORE_DIRS` — Add directories to skip during scanning

### Adding File Preview Support

In `previewTreeFile()` in `index.html`:
```javascript
if (filePath.toLowerCase().endsWith('.xml')) {
  document.getElementById('modalContent').innerHTML = `<pre>${escapeHtml(content)}</pre>`;
}
```

### Changing Styling

Modify `.css` for layout/colors. The monochrome theme is maintained via CSS variables in `:root`.

## Important Notes

### Security

- **Path Traversal Protection**: `server.js` validates all `/workspace-files/` requests to ensure files stay within `WORKSPACE_ROOT`
- **XSS Prevention**: `escapeHtml()` sanitizes content before inserting into DOM as plain text
- **Markdown Rendering**: `marked.js` is trusted; if user-controlled input fed to markdown, add `DOMPurify` or similar

### Performance

- **File Tree Limiting**: Scanner limits to 3 levels deep and 50 files per directory to avoid huge JSON files
- **Large File Truncation**: Frontend truncates files >100KB in modal preview to prevent memory issues
- **Lazy Rendering**: Projects list renders only visible items (no virtual scrolling currently, but feasible to add)

### Known Limitations

- No authentication — accessible to anyone on the network
- No real-time updates — requires manual "Rescan" button click or page reload
- File preview is read-only — no editing capability
- Single-process server — not suitable for high concurrency
- No indexing — search is client-side (slow for very large workspaces >1000 projects)

## Testing

No automated tests currently. Manual testing:

1. Start server: `node server.js`
2. Open browser: `http://localhost:8080`
3. Verify project list loads
4. Click projects; verify details appear
5. Click files in tree; verify modal opens with correct content
6. Test search/filter; verify results update
7. Click "Rescan"; verify projects are updated
8. Test exports; verify JSON/CSV downloads

## Future Improvements

- **Real-time sync**: Watch workspace directory for changes
- **Search indexing**: Build full-text index of file contents
- **Authentication**: Restrict access by user/role
- **Dark/light theme toggle**: Add theme switcher
- **Project editing**: Allow inline editing of metadata
- **Git integration**: Show branch, commits, contributors per project
- **CI/CD status**: Display build status, test coverage
- **Performance**: Add virtual scrolling for large project lists
