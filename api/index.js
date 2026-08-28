import { createApp } from "../apps/api/src/app.js";
import { validateApiEnvironment } from "../apps/api/src/config/env.config.js";
import { connectDatabase } from "../apps/api/src/lib/db.js";

let app;
let configurationError = null;

try {
  validateApiEnvironment();
} catch (e) {
  configurationError = e;
  console.error("[Vercel Startup] Production configuration is incomplete:", e.message);
}

export default async function handler(req, res) {
  try {
    if (configurationError) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          error: "Service configuration is incomplete.",
          details: configurationError.message
        })
      );
      return;
    }
    if (!app) {
      app = createApp();
    }
    if (!(await connectDatabase())) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, error: "Service persistence is temporarily unavailable." }));
      return;
    }
    return app(req, res);
  } catch (err) {
    console.error("[Vercel Handler Error]:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        error: "Internal server error."
      })
    );
  }
}
