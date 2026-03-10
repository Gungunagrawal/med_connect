import express from 'express';
import {
    loginAdmin,
    addDoctor,
    removeDoctor,
    getAllUsers,
    getAllAppointments,
    getAdminDashboard
} from '../controllers/adminController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);

// Protected Admin Routes
router.post('/add-doctor', protect, protectAdmin, addDoctor);
router.delete('/doctor/:id', protect, protectAdmin, removeDoctor);
router.get('/users', protect, protectAdmin, getAllUsers);
router.get('/appointments', protect, protectAdmin, getAllAppointments);
router.get('/dashboard', protect, protectAdmin, getAdminDashboard);

export default router;
