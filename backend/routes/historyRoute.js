import express from 'express';
import { addHistory, getPatientHistory } from '../controllers/historyController.js';
import { protect, protectDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only doctors can add history records
router.post('/add', protect, protectDoctor, addHistory);

// Both doctors and patients can view history
// Using standard protect, meaning any logged in user can hit it.
// Ideally we'd verify inside the controller if the user is the patient or a doctor.
router.get('/patient/:patientId', protect, getPatientHistory);

export default router;
