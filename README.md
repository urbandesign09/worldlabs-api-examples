# World Labs API Examples

Simple examples for generating worlds from text or images via the World Labs API. This repo includes CLI scripts in NodeJS and Python, plus a small web app/server.

## Get an API key

1. Register for your platform API access at `https://platform.worldlabs.ai/`.
2. Create a new API key and copy the key to a file for safe storage (in this example `my-api-key.txt`).
3. Set the key in environment variable `WLT_API_KEY`:
```bash
export WLT_API_KEY=`cat my-api-key.txt`
```

## Repository layout

- `generate-world-from-text.js` / `generate-world-from-text.py`: CLI scripts to generate a world from a text prompt.
- `generate-world-from-image.js` / `generate-world-from-image.py`: CLI scripts to generate a world from an image file.
- `web-generate-world/`: NodeJS server + web UI to generate worlds from text/images and list/view worlds.

## Run the CLI examples

NodeJS:

```bash
node generate-world-from-text.js "A cozy modern interior jazz lounge"
node generate-world-from-image.js igloo.jpg
```

Python:

```bash
python generate-world-from-text.py "A cozy modern interior jazz lounge"
python generate-world-from-image.py igloo.jpg
```

## Run the web app

```bash
cd web-generate-world
npm install
npm start
```

Then open [http://localhost:3000/](http://localhost:3000/) in your browser.

Paste your API key into the input field and click "List Worlds" at the bottom to see all your generated worlds. Enter a text prompt or select / drag an image prompt and click "Generate World".

**Warning:** This is for illustration purposes only. You probably want to keep your API key secret on a server you control and make the API requests from there. Never embed your API key directly in your client-side code, or others can see it in their browser.
