import express from 'express';
import { addDoctorLog, getDoctorLogs } from '../controllers/logsController.js';
import { protect, protectDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', protect, protectDoctor, addDoctorLog);
router.get('/:doctorId', protect, protectDoctor, getDoctorLogs);

export default router;
