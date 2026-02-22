import express from "express";
import { getHomeContent, upsertHomeContent } from "../controllers/cmsController.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/home", getHomeContent);
router.put("/home", protect, adminOnly, upsertHomeContent);

export default router;
