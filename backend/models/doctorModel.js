import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        specialization: {
            type: String,
            required: true,
        },
        fees: {
            type: Number,
            required: true,
        },
        about: {
            type: String,
            default: '',
        },
        experience: {
            type: String,
            default: '1 Year',
        },
        availability: {
            type: Boolean,
            default: true,
        },
        image: {
            type: String,
            default: '',
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        timeSlots: [
            {
                day: { type: String, required: true },
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
            }
        ]
    },
    { timestamps: true }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
