"""Entry point for the image-gen-mcp server."""

import asyncio
import sys
from .server import app, main

if __name__ == "__main__":
    asyncio.run(main())
