import "dotenv/config";
import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import { createServer } from "http";

// Import registerRoutes - it expects (httpServer, app) signature
import { registerRoutes } from "../server/routes";

const app = express();

// CORS for deltacan.app
app.use(cors({
  origin: [
    "https://deltacan.app",
    "https://www.deltacan.app",
    "https://deltacare.app",
    "http://localhost:5000",
    "http://localhost:3000",
  ],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Health check at root of API
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "DeltaScan API", version: "2.0.0", timestamp: new Date().toISOString() });
});

// Register all routes
const httpServer = createServer(app);
registerRoutes(httpServer, app);

export default app;
