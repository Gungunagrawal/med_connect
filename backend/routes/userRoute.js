import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    bookAppointment,
    getUserAppointments,
    cancelAppointment,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Appointment routes
router.post('/book-appointment', protect, bookAppointment);
router.get('/appointments', protect, getUserAppointments);
router.put('/cancel-appointment/:id', protect, cancelAppointment);

export default router;
