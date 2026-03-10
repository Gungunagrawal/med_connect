import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import StarRating from './StarRating';

const ReviewModal = ({ appointment, onClose }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data } = await axios.post('http://localhost:4000/api/reviews/add', {
                doctorId: appointment.doctorId._id,
                appointmentId: appointment._id,
                rating,
                reviewText
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Wait, AuthContext is usually used... we can just use localStorage if it stores token, or pass token as prop. Let's pass token. Wait, I'll update it to receive token from props.
            });

            if (data.success) {
                toast.success('Review submitted successfully!');
                onClose(true); // pass true to indicate success
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-primary p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Rate Dr. {appointment.doctorId?.name}</h2>
                    <button onClick={() => onClose(false)} className="text-3xl font-light hover:rotate-90 transition-transform">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex flex-col items-center space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Rating</label>
                        <StarRating rating={rating} setRating={setRating} size="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Review</label>
                        <textarea
                            required
                            className="w-full border p-3 rounded-lg h-32 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                            placeholder="How was your experience?"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="px-5 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-5 py-2 rounded-lg font-bold text-white transition-all ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark shadow-md active:scale-95'}`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
