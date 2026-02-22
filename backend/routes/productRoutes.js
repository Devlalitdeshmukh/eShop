import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellingProducts,
  getProductsBySeason,
  setBestSellingStatus,
  getProductSalesAnalytics,
} from '../controllers/productController.js';
import { createReview, getProductReviews } from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Product Routes
router.get('/', getProducts);
router.get('/best-selling', getBestSellingProducts);
router.get('/season/:season', getProductsBySeason);
router.get('/sales-analytics', protect, adminOnly, getProductSalesAnalytics);
router.put('/:id/best-selling', protect, adminOnly, setBestSellingStatus);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Review Routes
router.route('/:id/reviews')
  .post(protect, createReview)
  .get(getProductReviews);

export default router;
