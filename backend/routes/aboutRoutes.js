import express from "express";
import {
  getAboutus,
  getAboutusById,
  createAboutus,
  updateAboutus,
  deleteAboutus,
} from "../controllers/aboutController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(getAboutus).post(protect, admin, createAboutus);
router
  .route("/:id")
  .get(getAboutusById)
  .put(protect, admin, updateAboutus)
  .delete(protect, admin, deleteAboutus);

export default router;
