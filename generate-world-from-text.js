// Generate a World Labs world from a text prompt.

// Get World Labs API key from environment variable
const WLT_API_KEY = process.env.WLT_API_KEY;
if (!WLT_API_KEY) {
  console.error("Please set environment variable WLT_API_KEY to your World Labs API key");
  process.exit(1);
}

const apiBaseUrl = "https://api.worldlabs.ai/marble/v1";

// Send an API request and parse JSON response.
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

// Start a world generation operation from text.
async function generateWorld(textPrompt, autoEnhance, draft, seed) {
  if (!textPrompt) {
    throw new Error("Enter a text prompt first.");
  }

  const worldPrompt = {
    type: "text",
    text_prompt: textPrompt,
    disable_recaption: !autoEnhance,
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

// Fetch operation status by ID.
async function getOperation(operationId) {
  return await apiFetch(`operations/${operationId}`);
}

// Fetch world details by ID.
async function getWorld(worldId) {
  return await apiFetch(`worlds/${worldId}`);
}


// Run the CLI flow for text-based generation.
const textPrompt = process.argv[2];
if (!textPrompt) {
  console.error("Usage: node generate-world-from-text.js 'A cozy modern interior jazz lounge'");
  process.exit(1);  
}

const autoEnhance = true;
const draft = true;
const seed = null;

const operationId = await generateWorld(textPrompt, autoEnhance, draft, seed);
console.log(`Submitted world generation for "${textPrompt}"`, { operationId });

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
