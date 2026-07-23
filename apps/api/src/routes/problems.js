import { Router } from "express";
import { problems } from "../data/problems.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json({ problems });
});

router.get("/:problemId", (request, response) => {
  const problem = problems.find((item) => item.id === request.params.problemId);

  if (!problem) {
    response.status(404).json({ error: "Problem not found." });
    return;
  }

  response.json({ problem });
});

export default router;
