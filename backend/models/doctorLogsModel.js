import mongoose from 'mongoose';

const doctorLogsSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        diagnosis: {
            type: String,
            default: '',
        },
        prescription: {
            type: mongoose.Schema.Types.Mixed,
            default: '',
        },
        healthMetrics: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        visitDate: {
            type: String,
            default: '',
        }
    },
    { timestamps: true }
);

const DoctorLogs = mongoose.model('DoctorLogs', doctorLogsSchema);

export default DoctorLogs;
