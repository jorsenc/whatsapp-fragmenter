"""MCP Server for Image Generation."""

import asyncio
import json
import os

from mcp.server import Server
from mcp.types import TextContent, Tool

from .providers import PollinationsProvider as ImageProvider
PROVIDER_NAME = "Pollinations.ai (Free, Web-based, Fast)"

app = Server("image-gen-mcp")
OUTPUT_DIR = os.getenv("IMAGE_OUTPUT_DIR", "./generated_images")


@app.list_tools()
async def list_tools():
    """List available tools."""
    return [
        Tool(
            name="generate_image",
            description="Generate an image from a text prompt using Pollinations.ai",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Description of the image to generate"
                    },
                    "width": {
                        "type": "integer",
                        "description": "Image width in pixels (default: 1024)",
                        "default": 1024
                    },
                    "height": {
                        "type": "integer",
                        "description": "Image height in pixels (default: 1024)",
                        "default": 1024
                    },
                    "model": {
                        "type": "string",
                        "description": "Model to use: flux, flux-pro, or flux-realism (default: flux)",
                        "enum": ["flux", "flux-pro", "flux-realism"],
                        "default": "flux"
                    },
                    "seed": {
                        "type": "integer",
                        "description": "Random seed for reproducibility (optional)"
                    }
                },
                "required": ["prompt"]
            }
        ),
        Tool(
            name="generate_pixel_art",
            description="Generate pixel art from a text prompt",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Description of the pixel art to generate"
                    },
                    "width": {
                        "type": "integer",
                        "description": "Image width in pixels (default: 256)",
                        "default": 256
                    },
                    "height": {
                        "type": "integer",
                        "description": "Image height in pixels (default: 256)",
                        "default": 256
                    }
                },
                "required": ["prompt"]
            }
        ),
        Tool(
            name="list_providers",
            description="List available image generation providers and their capabilities",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict):
    """Handle tool calls."""
    try:
        if name == "generate_image":
            prompt = arguments.get("prompt")
            if not prompt:
                return [TextContent(type="text", text="Error: prompt is required")]

            width = arguments.get("width", 1024)
            height = arguments.get("height", 1024)
            model = arguments.get("model", "flux")
            seed = arguments.get("seed")

            filepath = await asyncio.to_thread(
                ImageProvider.generate,
                prompt=prompt,
                width=width,
                height=height,
                seed=seed,
                model=model,
                output_dir=OUTPUT_DIR
            )
            return [
                TextContent(
                    type="text",
                    text=f"Image generated successfully!\nPath: {filepath}\nPrompt: {prompt}"
                )
            ]

        elif name == "generate_pixel_art":
            prompt = arguments.get("prompt")
            if not prompt:
                return [TextContent(type="text", text="Error: prompt is required")]

            width = arguments.get("width", 256)
            height = arguments.get("height", 256)

            filepath = await asyncio.to_thread(
                ImageProvider.generate_pixel_art if hasattr(ImageProvider, 'generate_pixel_art') else ImageProvider.generate,
                prompt=f"pixel art, retro, 8-bit style: {prompt}",
                width=width,
                height=height,
                output_dir=OUTPUT_DIR
            )
            return [
                TextContent(
                    type="text",
                    text=f"Pixel art generated successfully!\nPath: {filepath}\nPrompt: {prompt}"
                )
            ]

        elif name == "list_providers":
            providers_info = {
                "current_provider": PROVIDER_NAME,
                "providers": [
                    {
                        "name": "Stable Diffusion (Recommended)",
                        "status": "available",
                        "free": True,
                        "local": True,
                        "models": ["stabilityai/stable-diffusion-2-1", "stabilityai/stable-diffusion-3-medium"],
                        "description": "Free, open-source, runs locally on your machine. No API key needed."
                    },
                    {
                        "name": "Pollinations.ai",
                        "status": "fallback",
                        "free": True,
                        "local": False,
                        "models": ["flux", "flux-pro", "flux-realism"],
                        "description": "Web-based backup if Stable Diffusion is not installed"
                    }
                ]
            }
            return [TextContent(type="text", text=json.dumps(providers_info, indent=2))]

        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

    except Exception as e:
        return [TextContent(type="text", text=f"Error: {str(e)}")]


async def main():
    """Run the MCP server."""
    from mcp.server.stdio import stdio_server

    async with stdio_server() as (reader, writer):
        await app.run(reader, writer, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
