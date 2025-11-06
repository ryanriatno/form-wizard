#!/usr/bin/env node
/* eslint-env node */

import express from "express";
import jsonServer from "json-server";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = parseInt(process.env.PORT, 10) || 4001;

console.log(
  `Starting json-server (step1) on port ${port} (PORT env: ${process.env.PORT})`
);

if (isNaN(port) || port <= 0 || port > 65535) {
  console.error(`Invalid port: ${port}. PORT env was: ${process.env.PORT}`);
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const router = jsonServer.router(join(__dirname, "db-step1.json"));
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use(router);

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`JSON Server (step1) is running on port ${port}`);
});

server.on("error", (error) => {
  console.error("Failed to start json-server (step1):", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});
