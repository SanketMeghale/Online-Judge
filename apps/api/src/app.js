import cors from "cors";
import express from "express";
import compilerRoutes from "./routes/compiler.js";
import healthRoutes from "./routes/health.js";
import problemsRoutes from "./routes/problems.js";
import submissionsRoutes from "./routes/submissions.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "256kb" }));

  app.use("/health", healthRoutes);
  app.use("/api/problems", problemsRoutes);
  app.use("/api/compiler", compilerRoutes);
  app.use("/api/submissions", submissionsRoutes);

  app.use((error, _request, response, _next) => {
    response.status(500).json({
      error: error?.message ?? "Internal server error."
    });
  });

  return app;
}
