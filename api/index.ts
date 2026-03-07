import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Register all API routes
registerRoutes(app);

export default app;
