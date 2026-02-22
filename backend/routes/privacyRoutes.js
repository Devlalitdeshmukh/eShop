import express from "express";
import {
  getPrivacyPolicy,
  updatePrivacyPolicy,
} from "../controllers/privacyController.js";
import { protect, adminOrStaff } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getPrivacyPolicy);
router.put("/", protect, adminOrStaff, updatePrivacyPolicy);

export default router;
