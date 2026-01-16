import fs from "fs/promises";

// Get World Labs API key from environment variable
const WLT_API_KEY = process.env.WLT_API_KEY;
if (!WLT_API_KEY) {
  console.error("Please set environment variable WLT_API_KEY to your World Labs API key");
  process.exit(1);
}

const apiBaseUrl = "http://api-autopush.worldlabs.ai/marble/v1";

async function apiFetch(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}/${path}`, {
    ...options,
    headers: {
      "WLT-Api-Key": WLT_API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${path}: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function generateWorld(textPrompt, imageBase64, autoEnhance, draft, seed) {
  if (!textPrompt && !imageBase64) {
    throw new Error("Enter a text prompt or select an image first.");
  }

  const worldPrompt = {
    type: imageBase64 ? "image" : "text",
    text_prompt: textPrompt || null,
    disable_recaption: !autoEnhance,
    image_prompt: imageBase64 ? {
      source: "data_base64",
      data_base64: imageBase64,
    } : null,
  };
  const operation = await apiFetch("worlds:generate", {
    method: "POST",
    body: JSON.stringify({
      world_prompt: worldPrompt,
      model: draft ? "Marble 0.1-mini" : "Marble 0.1-plus",
      seed,
    }),
  });
  return operation.operation_id;
}

async function getOperation(operationId) {
  return await apiFetch(`operations/${operationId}`);
}

async function getWorld(worldId) {
  return await apiFetch(`worlds/${worldId}`);
}


const imageFile = process.argv[2];
if (!imageFile) {
  console.error("Usage: node generate-world-from-image.js my-image.png");
  process.exit(1);  
}

const imageBytes = await fs.readFile(imageFile);
const imageBase64 = imageBytes.toString("base64");
const textPrompt = null;
const autoEnhance = true;
const draft = true;
const seed = null;

const operationId = await generateWorld(textPrompt, imageBase64, autoEnhance, draft);
console.log(`Submitted world generation for "${imageFile}"`, { operationId });

let operation;
while (true) {
  operation = await getOperation(operationId);
  if (operation.done) {
    break;
  }
  
  console.log(`Operation ${operationId} still processing`);
  // Wait 5000ms before trying again
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

const worldId = operation.response.world_id;
const world = await getWorld(worldId);
console.log("World", world);
