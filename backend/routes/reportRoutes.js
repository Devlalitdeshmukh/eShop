import express from 'express';
import { getProductReports, getOrderAnalytics } from '../controllers/reportController.js';
import { protect, adminOrStaff } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOrStaff, getProductReports);
router.get('/analytics', protect, adminOrStaff, getOrderAnalytics);

export default router;
