import express from 'express';
import { getProductReports, getOrderAnalytics } from '../controllers/reportController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getProductReports);
router.get('/analytics', protect, admin, getOrderAnalytics);

export default router;