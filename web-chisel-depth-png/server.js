import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 3001;
const DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

const files = {
  "/": {
    contentType: "text/html",
    content: fs.readFileSync(path.join(DIRECTORY, "index.html")),
  },
};

const server = http.createServer((request, response) => {
  const file = files[request.url];
  if (file) {
    response.writeHead(200, { "Content-Type": file.contentType });
    response.end(file.content);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain" });
  response.end("File not found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
