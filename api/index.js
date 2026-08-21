import { createApp } from "../apps/api/src/app.js";
import { validateApiEnvironment } from "../apps/api/src/config/env.config.js";

let app;

try {
  validateApiEnvironment();
} catch (e) {
  console.warn("[Vercel Startup] Env validation notice:", e.message);
}

export default async function handler(req, res) {
  try {
    if (!app) {
      app = createApp();
    }
    return app(req, res);
  } catch (err) {
    console.error("[Vercel Handler Error]:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        error: err?.message || "Internal server error."
      })
    );
  }
}
