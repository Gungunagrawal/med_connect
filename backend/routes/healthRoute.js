import express from 'express';
import { addHealthMetrics, getPatientMetrics } from '../controllers/healthController.js';
import { protect, protectDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', protect, protectDoctor, addHealthMetrics);
router.get('/:patientId', protect, getPatientMetrics);

export default router;
