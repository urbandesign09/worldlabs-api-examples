"""Generate a World Labs world from an image prompt."""

import base64
import json
import os
import sys
import time
from urllib import request, error


# Get World Labs API key from environment variable
WLT_API_KEY = os.environ.get("WLT_API_KEY")
if not WLT_API_KEY:
    print("Please set environment variable WLT_API_KEY to your World Labs API key")
    sys.exit(1)

API_BASE_URL = "https://api.worldlabs.ai/marble/v1"


def api_fetch(path, method="GET", body=None, headers=None):
    """Send an API request and parse JSON response."""
    url = f"{API_BASE_URL}/{path}"
    payload = json.dumps(body).encode("utf-8") if body is not None else None
    req_headers = {"WLT-Api-Key": WLT_API_KEY, "Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    req = request.Request(url, data=payload, headers=req_headers, method=method)
    try:
        with request.urlopen(req) as response:
            response_body = response.read().decode("utf-8")
            return json.loads(response_body) if response_body else {}
    except error.HTTPError as exc:
        response_body = exc.read().decode("utf-8")
        raise RuntimeError(
            f"{path}: {exc.code} {response_body}"
        ) from exc


def generate_world(text_prompt, image_base64, auto_enhance, draft, seed):
    """Start a world generation operation from text or image."""
    if not text_prompt and not image_base64:
        raise RuntimeError("Enter a text prompt or select an image first.")

    world_prompt = {
        "type": "image" if image_base64 else "text",
        "text_prompt": text_prompt or None,
        "disable_recaption": not auto_enhance,
        "image_prompt": {
            "source": "data_base64",
            "data_base64": image_base64,
        } if image_base64 else None,
    }
    operation = api_fetch(
        "worlds:generate",
        method="POST",
        body={
            "world_prompt": world_prompt,
            "model": "Marble 0.1-mini" if draft else "Marble 0.1-plus",
            "seed": seed,
        },
    )
    return operation["operation_id"]


def get_operation(operation_id):
    """Fetch operation status by ID."""
    return api_fetch(f"operations/{operation_id}")


def get_world(world_id):
    """Fetch world details by ID."""
    return api_fetch(f"worlds/{world_id}")


def main():
    """Run the CLI flow for image-based generation."""
    if len(sys.argv) < 2:
        print("Usage: python generate-world-from-image.py my-image.png")
        sys.exit(1)

    image_file = sys.argv[1]
    with open(image_file, "rb") as handle:
        image_bytes = handle.read()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    text_prompt = None
    auto_enhance = True
    draft = True
    seed = None

    operation_id = generate_world(text_prompt, image_base64, auto_enhance, draft, seed)
    print(f'Submitted world generation for "{image_file}"', {"operationId": operation_id})

    operation = None
    while True:
        operation = get_operation(operation_id)
        if operation.get("done"):
            break
        print(f"Operation {operation_id} still processing")
        time.sleep(5)

    world_id = operation["response"]["world_id"]
    world = get_world(world_id)
    print("World", json.dumps(world, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
