import express from "express";
import {
  getPrivacyPolicy,
  updatePrivacyPolicy,
} from "../controllers/privacyController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getPrivacyPolicy);
router.put("/", protect, admin, updatePrivacyPolicy);

export default router;
