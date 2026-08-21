import { createApp } from "../apps/api/src/app.js";
import { connectDatabase } from "../apps/api/src/lib/db.js";

let app;

export default async function handler(req, res) {
  try {
    await connectDatabase();
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
        error: "Internal server error."
      })
    );
  }
}
