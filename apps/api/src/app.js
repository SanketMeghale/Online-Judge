import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.js";
import compilerRoutes from "./routes/compiler.js";
import healthRoutes from "./routes/health.js";
import problemsRoutes from "./routes/problems.js";
import submissionRoutes from "./routes/submission.routes.js";
import userRoutes from "./routes/user.routes.js";

// Helper function to parse raw HTTP Cookie header into req.cookies object
function simpleCookieParser(req, _res, next) {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        req.cookies[key] = decodeURIComponent(value);
      }
    });
  }
  next();
}

export function createApp() {
  const app = express();

  // Configure CORS for production-readiness with credentials support
  const allowedOrigins = [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
    process.env.CLIENT_ORIGIN
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
          callback(null, true);
        } else {
          callback(new Error("CORS policy restriction."));
        }
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: "256kb" }));
  app.use(simpleCookieParser);

  // Mount API Gateway routes
  app.use("/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/problems", problemsRoutes);
  app.use("/api/compiler", compilerRoutes);
  app.use("/api/submissions", submissionRoutes);

  // Centralized Error Handler
  app.use((error, _request, response, _next) => {
    console.error("[API Gateway Error]", error);
    response.status(error.status || 500).json({
      success: false,
      error: error?.message ?? "Internal server error."
    });
  });

  return app;
}
