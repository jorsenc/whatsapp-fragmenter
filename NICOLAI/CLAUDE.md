# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**image-gen-mcp** is a Model Context Protocol (MCP) server that provides image generation capabilities to Claude and other LLM applications. It uses Pollinations.ai (a free web-based service) as the primary provider with Stable Diffusion as an optional local fallback.

### Architecture

The project consists of four main modules:

- **server.py** — Core MCP server that defines two tools (`generate_image`, `generate_pixel_art`) and one utility tool (`list_providers`). Handles tool invocation and returns image paths.
- **providers.py** — Contains two image generation providers:
  - `PollinationsProvider` — Web-based, free, no local dependencies (primary)
  - `StableDiffusionProvider` — Local generation using diffusers/torch (optional fallback)
- **__main__.py** — Entry point that runs the server via stdio
- **__init__.py** — Package metadata

The server communicates via stdio and is configured to output generated images to `./generated_images` by default (configurable via `IMAGE_OUTPUT_DIR` env var).

## Development Setup

### Install Dependencies

```bash
# Install the package in development mode with dev tools
pip install -e ".[dev]"
```

### Common Commands

**Run the MCP server locally:**
```bash
python -m image_gen_mcp
```
This starts the server on stdio, ready to accept tool calls from a compatible client.

**Run tests:**
```bash
pytest
```

**Run a specific test:**
```bash
pytest tests/test_file.py::TestClass::test_method -v
```

**Format code (black):**
```bash
black src/
```

**Lint code (ruff):**
```bash
ruff check src/
```

**Fix lint issues:**
```bash
ruff check src/ --fix
```

## Key Implementation Details

### Tool Definitions (server.py)

The server exposes three tools via `@app.list_tools()`:

1. **generate_image** — Generates images from text prompts
   - Required: `prompt` (string)
   - Optional: `width`, `height` (default 1024), `model` (flux/flux-pro/flux-realism), `seed`
   - Returns: file path to saved image

2. **generate_pixel_art** — Generates pixel art with retro 8-bit style
   - Required: `prompt` (string)
   - Optional: `width`, `height` (default 256)
   - Returns: file path to saved image

3. **list_providers** — Shows available image generation providers and their capabilities

### Provider Selection

- **PollinationsProvider** is active by default (no local setup required, free)
- **StableDiffusionProvider** can be used by importing it, but requires `diffusers` and `torch` packages (not in default dependencies)
- Providers return file paths with timestamps to avoid collisions

### Rate Limiting & Retry Logic

The Pollinations provider includes retry logic for rate limiting (429 responses):
- Max 3 retries with exponential backoff
- Initial delay: 5 seconds, doubles on each retry
- 120-second request timeout

### File Output

- Images are saved to `OUTPUT_DIR` (default: `./generated_images`)
- Filenames: `{prompt_slug}_{timestamp}.{jpg|png}` where prompt_slug is alphanumeric (first 30 chars)
- Directory created automatically if missing

## Configuration

Set via environment variables:

- `IMAGE_OUTPUT_DIR` — Directory to save generated images (default: `./generated_images`)

The `.mcp.json` file configures how the server runs when registered with a Claude client.

## Testing Notes

Currently no test suite exists. Tests should cover:
- Tool invocation (successful and error cases)
- File output and path validation
- Provider fallback logic
- Rate limiting retries
- Invalid prompt handling

## Future Enhancements

Based on code comments and structure, potential improvements include:
- Support for additional image generation models/providers
- Local Stable Diffusion provider activation (currently optional)
- Image dimension validation
- Prompt validation/sanitization
