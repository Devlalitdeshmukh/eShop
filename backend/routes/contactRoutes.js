import express from "express";
import {
  getContactus,
  getContactusById,
  createContactus,
  updateContactus,
  deleteContactus,
} from "../controllers/contactController.js";
import { protect, adminOnly, adminOrStaff } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(getContactus).post(protect, adminOnly, createContactus);
router
  .route("/:id")
  .get(getContactusById)
  .put(protect, adminOrStaff, updateContactus)
  .delete(protect, adminOnly, deleteContactus);

export default router;
