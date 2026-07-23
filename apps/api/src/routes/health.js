import { Router } from "express";

const router = Router();

router.get("/", (_request, response) => {
  response.json({
    ok: true,
    service: "online-judge-api",
    timestamp: new Date().toISOString()
  });
});

export default router;
