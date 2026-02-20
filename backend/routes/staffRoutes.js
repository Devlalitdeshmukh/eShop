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
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Attendance routes
router.post("/attendance", protect, markAttendance);
router.get("/attendance", protect, getAttendance);
router.get("/attendance/stats", protect, getAttendanceStats);

// Leave routes
router.post("/leaves", protect, applyLeave);
router.get("/leaves", protect, getLeaves);
router.put("/leaves/:id", protect, admin, updateLeaveStatus);
router.get("/leaves/balance", protect, getLeaveBalance);

// Holiday routes
router.get("/holidays", protect, getHolidays);
router.post("/holidays", protect, admin, createHoliday);
router.delete("/holidays/:id", protect, admin, deleteHoliday);

// Working hours routes
router.get("/working-hours", protect, getWorkingHours);
router.post("/working-hours", protect, admin, setWorkingHours);

export default router;
