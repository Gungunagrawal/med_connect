import MedicalHistory from '../models/historyModel.js';
import Appointment from '../models/appointmentModel.js';

// @desc    Add a medical history record
// @route   POST /api/history/add
// @access  Private (Doctor)
export const addHistory = async (req, res) => {
    try {
        const { patientId, appointmentId, diagnosis, prescriptionSummary, visitDate, notes } = req.body;
        const doctorId = req.userId;

        const history = new MedicalHistory({
            patientId,
            doctorId,
            appointmentId,
            diagnosis,
            prescriptionSummary,
            visitDate,
            notes
        });

        await history.save();

        res.status(201).json({ success: true, message: 'Medical history record added successfully', history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get patient medical history
// @route   GET /api/history/patient/:patientId
// @access  Private (Doctor/User)
export const getPatientHistory = async (req, res) => {
    try {
        const history = await MedicalHistory.find({ patientId: req.params.patientId })
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
