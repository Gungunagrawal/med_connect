import HealthMetrics from '../models/healthModel.js';

// @desc    Add health metrics
// @route   POST /api/healthmetrics/add
// @access  Private (Doctor)
export const addHealthMetrics = async (req, res) => {
    try {
        const { patientId, appointmentId, bloodPressure, weight, sugarLevel, heartRate, recordedDate } = req.body;
        const doctorId = req.userId;

        const metrics = new HealthMetrics({
            patientId,
            doctorId,
            appointmentId,
            bloodPressure,
            weight,
            sugarLevel,
            heartRate,
            recordedDate: recordedDate || Date.now()
        });

        await metrics.save();
        res.status(201).json({ success: true, message: 'Health metrics saved successfully', metrics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get patient health metrics
// @route   GET /api/healthmetrics/patient/:patientId
// @access  Private (Doctor/User)
export const getPatientMetrics = async (req, res) => {
    try {
        const metrics = await HealthMetrics.find({ patientId: req.params.patientId }).sort({ recordedDate: 1 });
        res.json({ success: true, metrics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
