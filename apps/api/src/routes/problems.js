import { Router } from "express";
import { problems as seedProblems } from "../data/problems.js";
import { isDatabaseConnected } from "../lib/db.js";
import { Problem } from "../models/Problem.js";

const router = Router();

router.get("/", async (_request, response) => {
  if (isDatabaseConnected()) {
    try {
      const dbProblems = await Problem.find().lean();
      if (dbProblems && dbProblems.length > 0) {
        response.json({ problems: dbProblems });
        return;
      }
    } catch {}
  }

  response.json({ problems: seedProblems });
});

router.get("/:problemId", async (request, response) => {
  const { problemId } = request.params;

  if (isDatabaseConnected()) {
    try {
      const dbProblem = await Problem.findOne({ id: problemId }).lean();
      if (dbProblem) {
        response.json({ problem: dbProblem });
        return;
      }
    } catch {}
  }

  const problem = seedProblems.find((item) => item.id === problemId);
  if (!problem) {
    response.status(404).json({ error: "Problem not found." });
    return;
  }

  response.json({ problem });
});

export default router;
