import Review from '../models/reviewModel.js';
import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';

// @desc    Add a new review
// @route   POST /api/reviews/add
// @access  Private (Patient)
export const addReview = async (req, res) => {
    try {
        const { doctorId, appointmentId, rating, reviewText } = req.body;
        const patientId = req.userId;

        // Verify the appointment belongs to this patient and doctor and is approved/completed
        const appointment = await Appointment.findOne({ _id: appointmentId, patientId, doctorId });
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Valid appointment not found' });
        }

        if (appointment.status !== 'Approved') {
            return res.status(400).json({ success: false, message: 'Can only review approved appointments' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ appointmentId, patientId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'Review already submitted for this appointment' });
        }

        const review = new Review({
            patientId,
            doctorId,
            appointmentId,
            rating: Number(rating),
            reviewText,
        });

        await review.save();

        // Update Doctor's totalReviews and averageRating
        const reviews = await Review.find({ doctorId });
        const numReviews = reviews.length;
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

        await Doctor.findByIdAndUpdate(doctorId, {
            totalReviews: numReviews,
            averageRating: avgRating.toFixed(1), // keep 1 decimal place
        });

        res.status(201).json({ success: true, message: 'Review added successfully', review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
export const getDoctorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ doctorId: req.params.doctorId })
            .populate('patientId', 'name') // get patient name
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
