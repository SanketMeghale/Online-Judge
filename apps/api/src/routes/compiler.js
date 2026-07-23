import { Router } from "express";
import { executeJavaScript } from "../lib/executeJavaScript.js";

const router = Router();

router.post("/run", async (request, response) => {
  const { language, code, stdin = "", timeoutMs } = request.body ?? {};

  if (!language || !code) {
    response.status(400).json({ error: "Both 'language' and 'code' are required." });
    return;
  }

  if (language !== "javascript") {
    response.status(400).json({
      error: "Only JavaScript execution is supported in the first backend version."
    });
    return;
  }

  const result = await executeJavaScript({
    code,
    stdin,
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined
  });

  response.json({
    language,
    ...result
  });
});

export default router;
