import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderAnalytics,
  getRevenueTracker,
  updateOrderStatus,
  downloadInvoicePdf,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.get("/analytics", protect, adminOnly, getOrderAnalytics);
router.get("/revenue-tracker", protect, adminOnly, getRevenueTracker);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.get("/:id/invoice", protect, downloadInvoicePdf);
router.get("/:id", protect, getOrderById);

export default router;
