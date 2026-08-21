import "dotenv/config"; // Load .env variables FIRST before any other import
import { createApp } from "./app.js";
import { validateApiEnvironment } from "./config/env.config.js";
import { connectDatabase } from "./lib/db.js";

const port = Number(process.env.PORT || 4000);
const app = createApp();

async function startServer() {
  try {
    validateApiEnvironment();
    const dbConnected = await connectDatabase();
    if (dbConnected) {
      console.log("[Server] MongoDB connected successfully.");
    } else {
      console.warn("[Server] MongoDB not connected — running with in-memory fallback.");
    }
  } catch (err) {
    console.error("[Server] Startup failed:", err.message);
    if (process.env.NODE_ENV === "production") {
      process.exitCode = 1;
      return;
    }
  }

  app.listen(port, () => {
    console.log(`\n🚀 Online Judge API running at http://localhost:${port}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   MongoDB URI: ${process.env.MONGODB_URI ? "✅ Configured" : "⚠️  Not set (in-memory mode)"}\n`);
  });
}

startServer();
