import cors from "cors";
import express from "express";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import compilerRoutes from "./routes/compiler.js";
import healthRoutes from "./routes/health.js";
import problemsRoutes from "./routes/problems.js";
import submissionRoutes from "./routes/submission.routes.js";

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

  app.use("/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/problems", problemsRoutes);
  app.use("/api/compiler", compilerRoutes);
  app.use("/api/submissions", submissionRoutes);

  app.use((error, _request, response, _next) => {
    console.error("[Unhandled API Error]:", error);
    response.status(error.status || 500).json({
      success: false,
      error: error?.message ?? "Internal server error."
    });
  });

  return app;
}
