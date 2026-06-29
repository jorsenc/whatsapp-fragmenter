# Plan — 001: Amazon Product Scraper

## Estructura de ficheros

```
amazon-scraper/
├── scraper.py          # CLI entry point
├── api.py              # FastAPI entry point
├── amazon/
│   ├── __init__.py
│   ├── client.py       # HTTP client con retry/backoff
│   ├── parser.py       # Extracción de campos desde BeautifulSoup
│   ├── selectors.py    # Todos los CSS/XPath selectors centralizados
│   ├── models.py       # Dataclass ProductData + schema JSON
│   └── exceptions.py   # ProductNotFoundError, BlockedError, FetchError, InvalidURLError
├── tests/
│   ├── conftest.py
│   ├── test_client.py
│   ├── test_parser.py
│   └── test_api.py
├── requirements.txt
└── README.md
```

## JSON Schema (output)

```json
{
  "url": "https://www.amazon.es/dp/B08N5WRWNW",
  "asin": "B08N5WRWNW",
  "title": "...",
  "brand": "...",
  "price": "€49,99",
  "original_price": "€59,99",
  "rating": 4.5,
  "review_count": 1234,
  "availability": "En stock",
  "description": ["bullet 1", "bullet 2"],
  "features": {"Color": "Negro", "Peso": "1.2 kg"},
  "images": [
    "https://m.media-amazon.com/images/I/...._SL1500_.jpg"
  ],
  "categories": ["Electrónica", "Cámaras y fotos", "Cámaras digitales"],
  "scraped_at": "2026-06-26T10:30:00Z"
}
```

## CSS Selectors (amazon/selectors.py)

| Campo | Selector principal | Fallback |
|-------|-------------------|----------|
| title | `#productTitle` | `h1.a-size-large` |
| brand | `#bylineInfo` | `#brand` |
| price | `.a-price .a-offscreen` | `#priceblock_ourprice` |
| original_price | `.a-price.a-text-strike .a-offscreen` | `#priceblock_saleprice` |
| rating | `#acrPopover .a-icon-alt` | `span[data-hook="rating-out-of-text"]` |
| review_count | `#acrCustomerReviewText` | `span[data-hook="total-review-count"]` |
| availability | `#availability span` | `#outOfStock` |
| description | `#feature-bullets li span` | `#productDescription p` |
| images | `#landingImage[data-a-dynamic-image]` (JSON en attr) | `#imgTagWrapperId img` |
| categories | `#wayfinding-breadcrumbs_feature_div a` | `.a-breadcrumb a` |

## API Endpoints

### GET /product
- Query param: `url` (string, required)
- Response 200: ProductData JSON
- Response 422: `{"detail": "url parameter is required"}`
- Response 404: `{"detail": "Product not found"}`
- Response 503: `{"detail": "Amazon blocked the request"}`
- Response 500: `{"detail": "Fetch error: <message>"}`

### GET /health
- Response 200: `{"status": "ok"}`

## Dependencias (requirements.txt)

```
httpx==0.27.*
beautifulsoup4==4.12.*
lxml==5.*
fastapi==0.111.*
uvicorn[standard]==0.30.*
pytest==8.*
pytest-cov==5.*
respx==0.21.*        # mock httpx en tests
```
