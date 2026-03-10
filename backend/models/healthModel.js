import mongoose from 'mongoose';

const healthSchema = new mongoose.Schema(
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
            required: true,
        },
        bloodPressure: {
            type: String, // e.g., "120/80"
            default: '',
        },
        weight: {
            type: Number, // in kg
        },
        sugarLevel: {
            type: Number, // e.g., mg/dL
        },
        heartRate: {
            type: Number, // bpm
        },
        recordedDate: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);

const HealthMetrics = mongoose.model('HealthMetrics', healthSchema);

export default HealthMetrics;
