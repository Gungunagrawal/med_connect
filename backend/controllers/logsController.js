import DoctorLogs from '../models/doctorLogsModel.js';

// @desc    Add doctor log
// @route   POST /api/doctorlogs/add
// @access  Private (Doctor)
export const addDoctorLog = async (req, res) => {
    try {
        const { patientId, appointmentId, diagnosis, prescription, healthMetrics, visitDate } = req.body;
        const doctorId = req.userId;

        const newLog = new DoctorLogs({
            doctorId,
            patientId,
            appointmentId,
            diagnosis,
            prescription,
            healthMetrics,
            visitDate
        });

        await newLog.save();
        res.status(201).json({ success: true, message: 'Log added successfully', log: newLog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get doctor logs
// @route   GET /api/doctorlogs/:doctorId
// @access  Private (Doctor)
export const getDoctorLogs = async (req, res) => {
    try {
        const logs = await DoctorLogs.find({ doctorId: req.params.doctorId })
            .populate('patientId', 'name image') // populate patient details
            .sort({ createdAt: -1 });
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
