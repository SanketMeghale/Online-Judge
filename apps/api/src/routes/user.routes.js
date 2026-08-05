import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/dashboard", requireAuth, (req, res) => userController.getDashboard(req, res));
router.get("/profile", requireAuth, (req, res) => userController.getDashboard(req, res));

export default router;
