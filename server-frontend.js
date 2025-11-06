#!/usr/bin/env node
/* eslint-env node */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = parseInt(process.env.PORT, 10) || 3000;

console.log(
  `Starting frontend server on port ${port} (PORT env: ${process.env.PORT})`
);

if (isNaN(port) || port <= 0 || port > 65535) {
  console.error(`Invalid port: ${port}. PORT env was: ${process.env.PORT}`);
  process.exit(1);
}

const server = spawn(
  "npx",
  ["--yes", "serve", "-s", "dist", "-l", port.toString()],
  {
    stdio: "inherit",
    cwd: __dirname,
    env: { ...process.env },
    shell: true,
  }
);

server.on("error", (error) => {
  console.error("Failed to start frontend server:", error);
  process.exit(1);
});

server.on("exit", (code) => {
  if (code !== null && code !== 0) {
    console.error(`Frontend server exited with code ${code}`);
    process.exit(code);
  }
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  server.kill("SIGTERM");
  setTimeout(() => {
    server.kill("SIGKILL");
    process.exit(0);
  }, 5000);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  server.kill("SIGINT");
  setTimeout(() => {
    server.kill("SIGKILL");
    process.exit(0);
  }, 5000);
});
