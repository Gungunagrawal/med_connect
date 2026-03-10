import Appointment from '../models/appointmentModel.js';

// @desc    Add or Update prescription for an appointment
// @route   POST /api/prescription/add
// @access  Private (Doctor)
export const addOrUpdatePrescription = async (req, res) => {
    try {
        const { appointmentId, prescription, notes, nextVisitDate } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Ensure it belongs to the logged-in doctor
        if (appointment.doctorId.toString() !== req.userId) {
            return res.status(401).json({ success: false, message: 'Not authorized for this appointment' });
        }

        appointment.prescription = prescription || appointment.prescription;
        appointment.notes = notes || appointment.notes;
        appointment.nextVisitDate = nextVisitDate || appointment.nextVisitDate;

        const updatedAppointment = await appointment.save();

        res.json({
            success: true,
            message: 'Prescription updated successfully',
            appointment: updatedAppointment,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get prescription for an appointment
// @route   GET /api/prescription/:appointmentId
// @access  Private (Doctor/User)
export const getPrescription = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId)
            .populate('doctorId', 'name specialization fees')
            .populate('patientId', 'name email');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Check if the user is authorized (either the doctor or the patient)
        if (
            appointment.doctorId._id.toString() !== req.userId &&
            appointment.patientId._id.toString() !== req.userId
        ) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this prescription' });
        }

        res.json({
            success: true,
            prescription: appointment.prescription,
            notes: appointment.notes,
            nextVisitDate: appointment.nextVisitDate,
            doctor: appointment.doctorId,
            patient: appointment.patientId,
            date: appointment.date
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
