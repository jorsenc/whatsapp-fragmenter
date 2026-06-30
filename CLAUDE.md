# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatsApp Chat Fragmenter processes large WhatsApp chat exports into monthly Markdown files for use with NotebookLM. It automatically detects the message format (language/timezone), parses messages, groups them by month, and generates indexed Markdown output.

**Status:** MVP complete (Phase 1). All core features implemented.

## Architecture

The system follows a **linear pipeline** architecture:

```
Input File
    ↓
[Parser] — Detects format, extracts messages
    ↓
[Fragmenter] — Groups messages by month
    ↓
[Generators] — Converts to Markdown + Index
    ↓
Output Files
```

### Core Modules

#### `src/parser/whatsappParser.js`
- **Responsibility:** Parse raw WhatsApp exports into normalized message objects
- **Key Methods:**
  - `detectFormat()` — Auto-detects language (Spanish/English/Portuguese/French/German/Italian)
  - `parseMessages()` — Converts each line to `{timestamp, user, content}` with ISO 8601 timestamps
  - `normalizeTimestamp()` — Converts dd/m/yy HH:MM:SS → ISO format (handles 2-digit year ambiguity)
- **Important Detail:** Handles invisible Unicode characters (zero-width space, RTL marks) and multiline messages (continued lines without timestamp)
- **Output:** Array of normalized message objects

#### `src/fragmenter/monthFragmenter.js`
- **Responsibility:** Group messages by month (YYYY-MM) and maintain chronological order
- **Key Method:** `fragment()` — Returns `Map<string, Message[]>` where keys are "2026-01", "2026-02", etc.
- **Validates:** No gaps in chronological ordering within each month
- **Output:** Sorted array of `[month, messages]` tuples

#### `src/generators/markdownGenerator.js`
- **Responsibility:** Convert message array to formatted Markdown with day headers
- **Format:** `## DD/M/YY` followed by `[HH:MM:SS] User: Content` lines
- **Handles:** Multiline message indentation, empty fragments
- **Output:** Single Markdown string (one fragment = one month)

#### `src/generators/indexGenerator.js`
- **Responsibility:** Create master index of all fragments with statistics
- **Generates:** `INDICE_FRAGMENTOS.md` with fragment list, message counts, file sizes
- **Output:** Summary metadata and formatted index

### Language Support

Patterns stored in `src/parser/languagePatterns.js`:
- Auto-detection uses sample of lines to identify format (checks regex matches per language)
- Each language defines: date format, time format, system message patterns
- Currently supports 6 languages (Spanish, English, Portuguese, French, German, Italian)
- Add new language: extend `LANGUAGE_PATTERNS` object with regex + patterns

## Commands

### Setup & Dependencies
```bash
npm install          # Install dependencies (Express, ESLint, Prettier)
```

### Development - CLI Mode
```bash
node src/cli/index.js <file> [options]    # Process a chat file
node src/cli/index.js chat.txt -v         # Verbose (show progress)
node src/cli/index.js chat.txt -o ./out   # Custom output dir
node src/cli/index.js chat.txt -f         # Force overwrite existing files
node src/cli/index.js --help               # Show all options
```

### Development - Web Mode
```bash
node src/web/server.js                     # Start Express server (port 3000)
# Then open http://localhost:3000 in browser
```

### Testing
```bash
npm test                                   # Run all tests (parser, fragmenter, integration)
npm test tests/parser.test.js              # Run specific test file
```

### Code Quality
```bash
npm run lint                               # Run ESLint
npm run format                             # Format with Prettier
```

### Debugging
```bash
node --inspect-brk src/cli/index.js chat.txt   # CLI with Node debugger
node --inspect src/web/server.js               # Web server with debugger
# Then open chrome://inspect to debug
```

## Data Flow & Key Concepts

### Message Structure
Normalized internal representation:
```javascript
{
  timestamp: "2026-01-15T14:32:45",  // ISO 8601
  user: "John",
  content: "Hello world"
}
```

### Timestamp Handling
- Input: `15/1/26, 14:32:45` (WhatsApp Spanish)
- Regex extracts: day, month, year (2-digit), hour, minute, second
- Conversion: Year < 50 → 20xx, Year ≥ 50 → 19xx (handles exports from 1950-2049)
- Output: ISO 8601 string for easy sorting and formatting

### Message Filtering
Two filter options (both enabled by default):
1. **skipSystemMessages** — Filters out "User X added/left/changed topic" messages
2. **skipMediaMessages** — Filters out `<Media omitted>`, `<image omitted>`, etc.

Language-specific system patterns in `languagePatterns.js`

### Fragment Output
Generated files in output directory:
- `chat_YYYY-MM.md` — One file per month with all messages for that month
- `INDICE_FRAGMENTOS.md` — Master index with summary and fragment listing

## Testing Strategy

Tests use Node.js built-in `test` module (no Jest). Three test suites:

1. **parser.test.js** — Unit tests for format detection, parsing, timestamp normalization, multiline handling, system message filtering
2. **fragmenter.test.js** — Unit tests for month grouping, chronological ordering, edge cases
3. **integration.test.js** — End-to-end tests with sample WhatsApp exports

Run: `npm test` (all) or `npm test tests/parser.test.js` (specific)

## Important Implementation Details

### Invisible Character Cleanup
Parser removes Unicode invisible characters before processing:
- ZERO WIDTH SPACE (U+200B)
- ZERO WIDTH JOINER/NON-JOINER
- RTL/LTR marks
- Arabic letter mark

These sometimes appear in WhatsApp exports and break regex matching.

### Multiline Message Handling
WhatsApp exports can have messages spanning multiple lines. Parser accumulates lines until a new message marker (regex match) is found, then treats accumulated content as single message.

### Chronological Ordering
Within each month, messages are sorted by ISO timestamp. Required because input file lines may be out of order.

### No External Dependencies for Core Logic
Parser/Fragmenter/Generators have zero external dependencies—only Express for web server. This keeps the library portable and lightweight.

## Project Structure

```
whatsapp-fragmenter/
├── src/
│   ├── parser/
│   │   ├── whatsappParser.js         # Main parser class
│   │   └── languagePatterns.js       # Regex patterns per language
│   ├── fragmenter/
│   │   └── monthFragmenter.js        # Month grouping logic
│   ├── generators/
│   │   ├── markdownGenerator.js      # Markdown formatting
│   │   └── indexGenerator.js         # Index generation
│   ├── cli/
│   │   └── index.js                  # CLI entry point (argument parsing + orchestration)
│   └── web/
│       └── server.js                 # Express server + API endpoints
├── public/
│   ├── index.html                    # Web UI
│   ├── styles.css                    # Styling
│   └── app.js                        # Frontend JavaScript
├── tests/
│   ├── parser.test.js
│   ├── fragmenter.test.js
│   └── integration.test.js
├── examples/
│   └── sample_chat_es.txt            # Example WhatsApp export (Spanish)
└── output/                           # Generated files (git-ignored)
```

## Common Development Tasks

### Adding Support for a New Language
1. Add regex pattern to `languagePatterns.js` under `LANGUAGE_PATTERNS`
2. Include: `name`, `dateFormat`, `regex`, `systemMessagePatterns`
3. Update `detectLanguage()` function with detection logic
4. Add test case in `parser.test.js` with sample messages in that language

### Debugging Message Parsing
```bash
# Check what format was detected
node -e "
const fs = require('fs');
const WhatsappParser = require('./src/parser/whatsappParser.js').default;
const content = fs.readFileSync('chat.txt', 'utf-8');
const parser = new WhatsappParser(content);
console.log('Detected format:', parser.detectFormat());
console.log('Messages parsed:', parser.getMessages().length);
"
```

### Testing with Sample Data
```bash
npm test                                  # Uses test fixtures internally
node src/cli/index.js examples/sample_chat_es.txt -v   # Parse example file
```

### Memory Usage for Large Files
For 1GB+ files, Node.js buffers entire file in memory. Current limit: 2GB (configurable via `MAX_FILE_SIZE` env var). For larger files, consider streaming implementation.

## Performance Notes

- **1 MB file:** < 100 ms
- **10 MB file:** < 500 ms
- **100 MB file:** < 2 seconds
- **1 GB file:** < 15 seconds

Bottleneck is regex matching on each line. For optimization, consider pre-compiling regex and using native modules.

## Dependencies

- **express** (4.18+) — Web server only (CLI mode has zero dependencies)
- **eslint** (8.0+) — Linting (dev only)
- **prettier** (3.0+) — Formatting (dev only)

## Stack Summary

- **Runtime:** Node.js 18+
- **Package Manager:** npm 8+
- **Language:** JavaScript (ES modules)
- **Testing:** Node.js built-in test module
- **Format:** CommonJS and ES modules mixed (see `type: "module"` in package.json)
