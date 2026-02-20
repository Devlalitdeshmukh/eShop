import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createReview, getProductReviews } from '../controllers/reviewController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Product Routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Review Routes
router.route('/:id/reviews')
  .post(protect, createReview)
  .get(getProductReviews);

export default router;