import express from 'express';
import { addOrUpdatePrescription, getPrescription } from '../controllers/prescriptionController.js';
import { protect, protectDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', protect, protectDoctor, addOrUpdatePrescription);
router.put('/update', protect, protectDoctor, addOrUpdatePrescription); // Using same function for both as it handles update
router.get('/:appointmentId', protect, getPrescription);

export default router;
