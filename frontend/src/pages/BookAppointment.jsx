import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import StarRating from '../components/StarRating';

const BookAppointment = () => {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (!token) {
            toast.warning('Please login to book an appointment');
            navigate('/login');
            return;
        }

        const fetchDoctorAndReviews = async () => {
            try {
                // Fetch all doctors from public route for quick access
                const doctorRes = await axios.get('http://localhost:4000/api/doctors/list');
                if (doctorRes.data.success) {
                    const doc = doctorRes.data.doctors.find(d => d._id === id);
                    if (doc) setDoctor(doc);
                    else toast.error('Doctor not found');
                }

                // Fetch reviews
                const reviewRes = await axios.get(`http://localhost:4000/api/reviews/doctor/${id}`);
                if (reviewRes.data.success) {
                    setReviews(reviewRes.data.reviews);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchDoctorAndReviews();
    }, [id, token, navigate]);

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:4000/api/users/book-appointment', {
                doctorId: id,
                date,
                time
            });

            if (data.success) {
                toast.success('Appointment booked successfully!');
                navigate('/dashboard'); // Take back to Patient Dashboard
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error booking appointment');
        }
    };

    if (!doctor) return <div className="text-center p-8">Loading doctor details...</div>;

    // Generate slots based on doctor's schedule for the selected date
    const getDynamicSlots = () => {
        if (!date || !doctor || !doctor.timeSlots) return [];

        const selectedDate = new Date(date);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[selectedDate.getDay()]; // Note UTC vs local date issues, assuming local

        const daySchedule = doctor.timeSlots.find(slot => slot.day === dayOfWeek);
        if (!daySchedule) return []; // No schedule for this day

        // Assuming startTime and endTime are in format "HH:MM" 24hr format from input type="time"
        const startParts = daySchedule.startTime.split(':');
        const endParts = daySchedule.endTime.split(':');

        if (startParts.length !== 2 || endParts.length !== 2) return [];

        let currentHour = parseInt(startParts[0]);
        let currentMin = parseInt(startParts[1]);
        const endHour = parseInt(endParts[0]);
        const endMin = parseInt(endParts[1]);

        const generatedSlots = [];

        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
            // Format hour and minute
            let period = 'AM';
            let displayHour = currentHour;
            if (displayHour >= 12) {
                period = 'PM';
                if (displayHour > 12) displayHour -= 12;
            }
            if (displayHour === 0) displayHour = 12;

            const timeString = `${displayHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')} ${period}`;
            generatedSlots.push(timeString);

            // Add 30 minutes
            currentMin += 30;
            if (currentMin >= 60) {
                currentMin -= 60;
                currentHour += 1;
            }
        }

        return generatedSlots;
    };

    const availableSlots = getDynamicSlots();

    return (
        <div className="max-w-2xl mx-auto my-10">
            <h2 className="text-3xl font-bold mb-8 text-primary border-b pb-4">Book Appointment</h2>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-100 flex flex-col md:flex-row gap-8">
                {/* Doctor Info */}
                <div className="md:w-1/3 flex flex-col items-center border-r border-slate-100 pr-4">
                    <div className="bg-slate-100 w-32 h-32 rounded-full mb-4 flex items-center justify-center text-4xl shadow-inner">
                        {doctor.image ? <img src={doctor.image} alt={doctor.name} className="h-full w-full rounded-full object-cover" /> : '👨‍⚕️'}
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 text-center">Dr. {doctor.name}</h3>
                    <p className="text-secondary font-medium">{doctor.specialization}</p>

                    <div className="mt-3 flex flex-col items-center">
                        <StarRating rating={doctor.averageRating || 0} readonly={true} size="w-5 h-5" />
                        <span className="text-xs text-slate-500 mt-1">({doctor.totalReviews || 0} Reviews)</span>
                    </div>

                    <div className="w-full mt-6 space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between py-1 border-b"><span className="font-semibold">Fees:</span> <span className="text-green-600 font-bold">${doctor.fees}</span></div>
                        <div className="flex justify-between py-1 border-b"><span className="font-semibold">Experience:</span> <span>{doctor.experience}</span></div>
                    </div>
                </div>

                {/* Booking Form */}
                <div className="md:w-2/3">
                    <form onSubmit={handleBooking} className="space-y-6">
                        <div>
                            <label className="block mb-2 font-bold text-slate-700">Select Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border border-slate-300 p-3 rounded-md focus:ring-primary focus:border-primary shadow-sm transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-bold text-slate-700">Select Time Slot</label>
                            {availableSlots.length === 0 ? (
                                <p className="text-sm text-red-500 italic p-3 bg-red-50 border border-red-100 rounded">
                                    {date ? 'The doctor is not available on this day or outside scheduled hours.' : 'Please select a date first to see available slots.'}
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {availableSlots.map(slot => (
                                        <div
                                            key={slot}
                                            onClick={() => setTime(slot)}
                                            className={`cursor-pointer border p-2 text-center text-sm rounded-md transition-all font-medium ${time === slot ? 'bg-primary border-primary text-white shadow-md transform scale-105' : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-secondary hover:text-secondary'}`}
                                        >
                                            {slot}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!date || !time}
                            className={`w-full py-3 rounded-md font-bold text-lg shadow-md transition-colors ${(!date || !time) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-secondary text-white hover:bg-sky-600'}`}
                        >
                            Confirm Booking
                        </button>
                    </form>
                </div>
            </div>

            {/* Doctor Reviews Section */}
            <div className="mt-10 bg-white p-6 rounded-lg shadow-lg border border-slate-100">
                <h3 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">Patient Reviews</h3>
                {reviews.length === 0 ? (
                    <p className="text-slate-500 italic">No reviews yet for this doctor.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map(review => (
                            <div key={review._id} className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-700">{review.patientId?.name || 'Anonymous User'}</h4>
                                        <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <StarRating rating={review.rating} readonly={true} size="w-4 h-4" />
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed italic">"{review.reviewText}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookAppointment;
