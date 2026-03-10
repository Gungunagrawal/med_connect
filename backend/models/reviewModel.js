import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        reviewText: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent user from submitting more than one review per appointment
reviewSchema.index({ appointmentId: 1, patientId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
