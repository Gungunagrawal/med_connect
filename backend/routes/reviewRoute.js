import express from 'express';
import { addReview, getDoctorReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', protect, addReview);
router.get('/doctor/:doctorId', getDoctorReviews);

export default router;
