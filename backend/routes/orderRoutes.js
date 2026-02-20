import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderAnalytics,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/", protect, admin, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.get("/analytics", protect, admin, getOrderAnalytics);

export default router;
