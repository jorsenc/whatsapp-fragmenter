# Tasks — 001: Amazon Product Scraper

## Task 1: Excepciones y modelos de datos
- **Ficheros:** `amazon/exceptions.py`, `amazon/models.py`
- **Output:** Clases `ProductNotFoundError`, `BlockedError`, `FetchError`, `InvalidURLError`; dataclass `ProductData`
- **Test:** `tests/test_models.py` — instanciación y serialización JSON
- **Success:** `ProductData.to_dict()` produce JSON válido conforme al schema

## Task 2: Selectores CSS centralizados
- **Ficheros:** `amazon/selectors.py`
- **Output:** Dict `SELECTORS` con campo → (selector_principal, fallback)
- **Test:** No requiere test unitario; validado indirectamente por parser
- **Success:** Todos los campos del schema tienen al menos un selector

## Task 3: HTTP Client con retry
- **Ficheros:** `amazon/client.py`
- **Output:** Función `fetch_page(url: str) -> str` con retry 3×, backoff 1/2/4s, User-Agent rotado
- **Test:** `tests/test_client.py` con `respx` mockeando 503→503→200 para validar retry
- **Success:** Lanza `BlockedError` si 3 intentos fallan con 503; lanza `ProductNotFoundError` si 404

## Task 4: Parser HTML
- **Ficheros:** `amazon/parser.py`
- **Output:** Función `parse_product(html: str, url: str) -> ProductData`
- **Test:** `tests/test_parser.py` con HTML fixtures de una página Amazon real (sanitizada)
- **Success:** Extrae todos los campos; campos no encontrados → `None`; imágenes extraídas del JSON en `data-a-dynamic-image`

## Task 5: CLI entry point
- **Ficheros:** `scraper.py`
- **Output:** CLI `python scraper.py <url> [--output file] [--log-level LEVEL]`
- **Test:** `tests/test_cli.py` con subprocess mock
- **Success:** Sin `--output` imprime JSON a stdout; con `--output` escribe fichero; URL inválida → exit code 1

## Task 6: API REST
- **Ficheros:** `api.py`
- **Output:** FastAPI app con `GET /product?url=...` y `GET /health`
- **Test:** `tests/test_api.py` con `TestClient` de FastAPI
- **Success:** Retorna JSON correcto en 200; errores mapeados a códigos HTTP correctos

## Task 7: README y requirements.txt
- **Ficheros:** `README.md`, `requirements.txt`
- **Output:** Instrucciones de instalación y uso
- **Success:** `pip install -r requirements.txt && python scraper.py --help` funciona sin errores
