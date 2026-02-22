import express from "express";
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} from "../controllers/inquiryController.js";
import { adminOnly, optionalProtect, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", optionalProtect, createInquiry);
router.get("/", protect, adminOnly, getInquiries);
router.put("/:id/status", protect, adminOnly, updateInquiryStatus);

export default router;
