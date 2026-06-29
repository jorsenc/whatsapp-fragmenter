# Spec — 001: Amazon Product Scraper

## Comportamientos universales

The system SHALL accept a valid Amazon product URL as input.
The system SHALL return a JSON object conforming to the product schema.
The system SHALL extract product data using CSS selectors defined in `selectors.py`.
The system SHALL set a realistic browser User-Agent on every HTTP request.
The system SHALL retry failed requests up to 3 times with exponential backoff (1s, 2s, 4s).
The system SHALL log all HTTP requests at DEBUG level and errors at ERROR level.

## CLI

WHEN the user runs `python scraper.py <url>`, THE system SHALL print the JSON to stdout.
WHEN the user passes `--output <file>`, THE system SHALL write the JSON to that file instead of stdout.
WHEN the user passes `--log-level <level>`, THE system SHALL configure logging at that level.
WHEN the URL argument is missing, THE system SHALL print usage and exit with code 1.

## API REST

WHEN a GET request arrives at `/product` with a `url` query parameter, THE system SHALL return HTTP 200 with the product JSON body.
WHEN the `url` parameter is missing, THE system SHALL return HTTP 422 with an error detail.
WHEN the user starts the server with `python api.py`, THE system SHALL listen on `0.0.0.0:8000`.

## Extracción de datos

WHEN the page is fetched successfully, THE system SHALL extract:
- title (texto completo del producto)
- brand (marca/fabricante)
- price (precio actual, como string con símbolo de moneda)
- original_price (precio tachado si existe, o null)
- rating (puntuación media, float 0.0–5.0 o null)
- review_count (número entero de reseñas o null)
- availability (texto de disponibilidad o null)
- asin (código ASIN de Amazon)
- description (lista de bullet points del producto)
- features (lista de características técnicas key:value)
- images (lista de URLs de imágenes en alta resolución)
- categories (lista de strings representando el breadcrumb)
- url (URL canónica del producto)
- scraped_at (timestamp ISO 8601 UTC)

## Manejo de errores

IF the HTTP response status is 404, THEN the system SHALL raise a `ProductNotFoundError` with message "Product not found".
IF the HTTP response status is 503 or contains CAPTCHA indicators, THEN the system SHALL raise a `BlockedError` with message "Amazon blocked the request".
IF a field cannot be extracted, THEN the system SHALL set that field to null (not raise an exception).
IF all 3 retries fail, THEN the system SHALL raise a `FetchError` with the last HTTP status code.
IF the URL does not match Amazon domain pattern, THEN the system SHALL raise a `InvalidURLError` immediately without fetching.
