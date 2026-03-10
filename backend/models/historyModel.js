import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        diagnosis: {
            type: String,
            required: true,
        },
        prescriptionSummary: {
            type: String,
            default: '',
        },
        visitDate: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            default: '',
        }
    },
    { timestamps: true }
);

const MedicalHistory = mongoose.model('MedicalHistory', historySchema);

export default MedicalHistory;
