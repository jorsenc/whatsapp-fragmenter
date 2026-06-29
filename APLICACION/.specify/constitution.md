# Constitution — Amazon Product Scraper

## Stack (no-negociable)
- **Lenguaje:** Python 3.11+
- **HTTP:** `httpx` (async) con fallback a `requests`
- **Parsing:** `BeautifulSoup4` + `lxml`
- **CLI:** `argparse` (stdlib)
- **API REST:** `FastAPI` + `uvicorn`
- **Output:** `json` (stdlib, indent=2)

## Interfaces
- CLI: `python scraper.py <url> [--output <file>]`
- API REST: `GET /product?url=<encoded_url>` → JSON

## Output
- Las imágenes se representan como **URLs** (no se descargan)
- El JSON resultante sigue el schema definido en `plan.md`

## Política de scraping
- User-Agent real de Chrome/Firefox rotado aleatoriamente
- Retry con backoff exponencial (3 intentos)
- Timeout: 30 segundos por request
- No se bypassea CAPTCHA; si Amazon bloquea, se lanza error claro

## Testing
- Cobertura mínima: 80%
- Framework: `pytest`
- Tests unitarios con mocks HTTP (sin hits reales a Amazon)

## Restricciones de código
- Sin hardcode de selectores en múltiples sitios; centralizados en `selectors.py`
- Toda extracción retorna `None` si falla (no excepciones silenciosas)
- Logging con nivel configurable vía `--log-level`
