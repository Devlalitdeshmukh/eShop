import express from "express";
import {
  markAttendance,
  getAttendance,
  getAttendanceStats,
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  getLeaveBalance,
  getHolidays,
  createHoliday,
  deleteHoliday,
  getWorkingHours,
  setWorkingHours,
} from "../controllers/staffController.js";
import { protect, adminOnly, adminOrStaff } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Attendance routes
router.post("/attendance", protect, adminOrStaff, markAttendance);
router.get("/attendance", protect, adminOrStaff, getAttendance);
router.get("/attendance/stats", protect, adminOrStaff, getAttendanceStats);

// Leave routes
router.post("/leaves", protect, adminOrStaff, applyLeave);
router.get("/leaves", protect, adminOrStaff, getLeaves);
router.put("/leaves/:id", protect, adminOnly, updateLeaveStatus);
router.get("/leaves/balance", protect, adminOrStaff, getLeaveBalance);

// Holiday routes
router.get("/holidays", protect, adminOrStaff, getHolidays);
router.post("/holidays", protect, adminOnly, createHoliday);
router.delete("/holidays/:id", protect, adminOnly, deleteHoliday);

// Working hours routes
router.get("/working-hours", protect, adminOrStaff, getWorkingHours);
router.post("/working-hours", protect, adminOnly, setWorkingHours);

export default router;
