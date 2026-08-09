import cors from "cors";
import express from "express";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import compilerRoutes from "./routes/compiler.js";
import healthRoutes from "./routes/health.js";
import problemsRoutes from "./routes/problems.js";
import submissionRoutes from "./routes/submission.routes.js";

import contestRoutes from "./routes/contests.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import progressRoutes from "./routes/progress.js";
import dashboardRoutes from "./routes/dashboard.js";
import aiRoutes from "./routes/ai.routes.js";

function parseCookies(cookieHeader = "") {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    let [name, ...rest] = cookie.split("=");
    name = name?.trim();
    if (!name) return;
    const value = rest.join("=").trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });
  return list;
}

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173"
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          callback(null, true);
        } else {
          callback(null, true); // Dev fallback
        }
      },
      credentials: true
    })
  );

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(express.json({ limit: "256kb" }));

  app.use((req, _res, next) => {
    req.cookies = parseCookies(req.headers.cookie);
    next();
  });

  // Mount API endpoints with and without /api prefix for Vercel Serverless Function routing
  app.use("/health", healthRoutes);

  app.use("/api/auth", authRoutes);
  app.use("/auth", authRoutes);

  app.use("/api/problems", problemsRoutes);
  app.use("/problems", problemsRoutes);

  app.use("/api/compiler", compilerRoutes);
  app.use("/compiler", compilerRoutes);

  app.use("/api/submissions", submissionRoutes);
  app.use("/submissions", submissionRoutes);

  app.use("/api/contests", contestRoutes);
  app.use("/contests", contestRoutes);

  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/leaderboard", leaderboardRoutes);

  app.use("/api/progress", progressRoutes);
  app.use("/progress", progressRoutes);

  app.use("/api/dashboard", dashboardRoutes);
  app.use("/dashboard", dashboardRoutes);

  app.use("/api/ai", aiRoutes);
  app.use("/ai", aiRoutes);

  app.use((error, _request, response, _next) => {
    console.error("[Unhandled API Error]:", error);
    response.status(error.status || 500).json({
      success: false,
      error: error?.message ?? "Internal server error."
    });
  });

  return app;
}
