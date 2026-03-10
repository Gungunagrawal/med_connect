import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
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
        date: {
            type: String, // Format: DD-MM-YYYY
            required: true,
        },
        time: {
            type: String, // Format: HH:MM
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        prescription: [
            {
                medicineName: String,
                dosage: String,
                duration: String,
                instructions: String,
            },
        ],
        notes: {
            type: String,
        },
        nextVisitDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
