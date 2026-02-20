import express from "express";
import {
  getContactus,
  getContactusById,
  createContactus,
  updateContactus,
  deleteContactus,
} from "../controllers/contactController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(getContactus).post(protect, admin, createContactus);
router
  .route("/:id")
  .get(getContactusById)
  .put(protect, admin, updateContactus)
  .delete(protect, admin, deleteContactus);

export default router;
