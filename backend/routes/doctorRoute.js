import express from 'express';
import {
    loginDoctor,
    getDoctorAppointments,
    updateAppointmentStatus,
    updateDoctorProfile,
    getDoctosList,
} from '../controllers/doctorController.js';
import { protect, protectDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginDoctor);
router.get('/list', getDoctosList); // Public route for users to see doctors

// Protected Doctor routes
router.get('/appointments', protect, protectDoctor, getDoctorAppointments);
router.put('/appointment/:id', protect, protectDoctor, updateAppointmentStatus);
router.put('/profile', protect, protectDoctor, updateDoctorProfile);

export default router;
