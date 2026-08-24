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
import adminRoutes from "./routes/admin.routes.js";
import evaluationRoutes from "./routes/evaluation.routes.js";
import companyRoutes from "./routes/company.routes.js";
import userRoutes from "./routes/user.routes.js";

function parseCookies(cookieHeader = "") {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    let [name, ...rest] = cookie.split("=");
    name = name?.trim();
    if (!name) return;
    const value = rest.join("=").trim();
    if (!value) return;
    try {
      list[name] = decodeURIComponent(value);
    } catch {
      list[name] = value;
    }
  });
  return list;
}

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  const production = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);
  const configuredOrigins = String(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowedOrigins = production
    ? configuredOrigins
    : [...configuredOrigins, "http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080", "http://127.0.0.1:5173"];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin)
        ) {
          callback(null, true);
        } else {
          const error = new Error("Origin is not allowed by CORS.");
          error.statusCode = 403;
          callback(error);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"]
    })
  );

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(express.json({ limit: "512kb" }));

  app.use((req, _res, next) => {
    req.cookies = parseCookies(req.headers.cookie);
    next();
  });

  // Mount API endpoints with and without /api prefix for Vercel Serverless Function routing
  app.use("/health", healthRoutes);
  app.use("/api/health", healthRoutes);

  app.use("/api/auth", authRoutes);
  app.use("/auth", authRoutes);

  app.use("/api/users", userRoutes);
  app.use("/users", userRoutes);

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

  app.use("/api/evaluation", evaluationRoutes);
  app.use("/evaluation", evaluationRoutes);

  app.use("/api/companies", companyRoutes);
  app.use("/companies", companyRoutes);

  app.use("/api/admin", adminRoutes);
  app.use("/admin", adminRoutes);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: "API endpoint not found." });
  });

  app.use((error, _request, response, _next) => {
    console.error("[Unhandled API Error]:", error);
    const status = error.status || error.statusCode || 500;
    response.status(status).json({
      success: false,
      error: status >= 500 ? "Internal server error." : error?.message || "Request failed."
    });
  });

  return app;
}
