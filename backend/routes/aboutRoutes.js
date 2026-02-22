import express from "express";
import {
  getAboutus,
  getAboutusById,
  createAboutus,
  updateAboutus,
  deleteAboutus,
} from "../controllers/aboutController.js";
import { protect, adminOnly, adminOrStaff } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(getAboutus).post(protect, adminOnly, createAboutus);
router
  .route("/:id")
  .get(getAboutusById)
  .put(protect, adminOrStaff, updateAboutus)
  .delete(protect, adminOnly, deleteAboutus);

export default router;
