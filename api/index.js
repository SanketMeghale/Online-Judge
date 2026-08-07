import { createApp } from "../apps/api/src/app.js";
import { connectDatabase } from "../apps/api/src/lib/db.js";

let app;

export default async function handler(req, res) {
  try {
    await connectDatabase();
  } catch (err) {
    console.error("[Vercel Serverless DB Connection Warning]:", err);
  }

  if (!app) {
    app = createApp();
  }

  return app(req, res);
}
