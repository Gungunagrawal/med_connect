import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '../components/ReviewModal';
import HealthGraph from '../components/HealthGraph';
import StarRating from '../components/StarRating';
import { AuthContext, useContext } from 'react';
import { AuthContext as AuthProviderContext } from '../context/AuthContext';

const PatientDashboard = () => {
    const { user } = useContext(AuthProviderContext);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [history, setHistory] = useState([]);
    const [healthMetrics, setHealthMetrics] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings');
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [reviewAppointment, setReviewAppointment] = useState(null);

    // Filters
    const [searchName, setSearchName] = useState('');
    const [filterSpeciality, setFilterSpeciality] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const navigate = useNavigate();

    const fetchHistory = async () => {
        if (!user || !user._id) return;
        try {
            const { data } = await axios.get(`http://localhost:4000/api/history/patient/${user._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (data.success) setHistory(data.history);

            const metricsData = await axios.get(`http://localhost:4000/api/healthmetrics/${user._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (metricsData.data.success) setHealthMetrics(metricsData.data.metrics);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data } = await axios.get('http://localhost:4000/api/users/appointments');
            if (data.success) setAppointments(data.appointments);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDoctors = async () => {
        try {
            let queryParams = [];
            if (searchName) queryParams.push(`name=${searchName}`);
            if (filterSpeciality) queryParams.push(`speciality=${filterSpeciality}`);
            if (filterRating) queryParams.push(`minRating=${filterRating}`);

            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

            const { data } = await axios.get(`http://localhost:4000/api/doctors/list${queryString}`);
            if (data.success) setDoctors(data.doctors);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        // Debounce search/filters
        const timeout = setTimeout(() => {
            fetchDoctors();
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchName, filterSpeciality, filterRating]);

    useEffect(() => {
        fetchAppointments();
        // fetchDoctors(); // Removed from here, now handled by the debounced useEffect
        if (user && user._id) {
            fetchHistory();
        }
    }, [user]);

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel?")) return;
        try {
            const { data } = await axios.put(`http://localhost:4000/api/users/cancel-appointment/${id}`);
            if (data.success) {
                toast.success('Appointment cancelled');
                fetchAppointments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error cancelling appointment');
        }
    };

    // Quick Book helper
    const handleQuickBook = (docId) => {
        // Pass to a booking page or use a modal
        // For now, redirect to specialized booking page (to map later)
        toast.info("Select a date and time!");
        // simple inline booking could happen here, or a dedicated page.
    };

    const handleReviewModalClose = (success) => {
        setReviewAppointment(null);
        if (success) fetchAppointments();
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md h-fit">
                <h3 className="font-bold text-xl text-primary mb-4 border-b pb-2">My Menu</h3>
                <ul className="space-y-2">
                    <li className={`p-2 rounded-md cursor-pointer transition-colors ${activeTab === 'bookings' ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`} onClick={() => setActiveTab('bookings')}>My Bookings</li>
                    <li className={`p-2 rounded-md cursor-pointer transition-colors ${activeTab === 'history' ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`} onClick={() => setActiveTab('history')}>Medical History</li>
                    <li className={`p-2 rounded-md cursor-pointer transition-colors ${activeTab === 'doctors' ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`} onClick={() => setActiveTab('doctors')}>Find Doctors</li>
                </ul>
            </div>

            <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[500px]">
                {activeTab === 'bookings' ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">My Appointments</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {appointments.map(app => (
                                <div key={app._id} className="border bg-slate-50 p-4 rounded-lg shadow-sm border-l-4 border-primary">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">Dr. {app.doctorId?.name || 'Unknown'}</h3>
                                            <p className="text-sm text-slate-600 font-medium">{app.doctorId?.specialization}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm"><span className="font-semibold">Date:</span> {app.date}</p>
                                        <p className="text-sm"><span className="font-semibold">Time:</span> {app.time}</p>
                                        <p className="text-sm"><span className="font-semibold">Fees:</span> ${app.doctorId?.fees}</p>
                                    </div>
                                    {app.status === 'Pending' && (
                                        <button onClick={() => handleCancel(app._id)} className="w-full text-sm bg-red-50 text-red-600 font-semibold px-3 py-2 rounded hover:bg-red-100 transition-colors">
                                            Cancel Appointment
                                        </button>
                                    )}

                                    {app.status === 'Approved' && app.prescription && app.prescription.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
                                            <button
                                                onClick={() => setSelectedPrescription(app)}
                                                className="w-full text-sm bg-primary text-white font-bold px-3 py-2 rounded hover:bg-primary-dark transition-all shadow-sm"
                                            >
                                                View Prescription
                                            </button>
                                            <button
                                                onClick={() => setReviewAppointment(app)}
                                                className="w-full text-sm bg-secondary text-white font-bold px-3 py-2 rounded hover:bg-sky-600 transition-all shadow-sm"
                                            >
                                                Leave a Review
                                            </button>
                                        </div>
                                    )}

                                    {app.nextVisitDate && (
                                        <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-blue-800 uppercase tracking-tighter">Next Visit</p>
                                                <p className="text-sm font-semibold text-blue-900">{new Date(app.nextVisitDate).toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                                Follow-up Required
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {appointments.length === 0 && <p className="text-center p-8 pl-0 text-slate-500 col-span-2">You have no appointments yet.</p>}
                        </div>
                    </div>
                ) : activeTab === 'history' ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">My Health & History</h2>

                        {/* Health Trend Graph */}
                        <div className="mb-8">
                            <HealthGraph metrics={healthMetrics} />
                        </div>

                        <h3 className="text-xl font-bold mb-4 text-slate-700">Past Visit Records</h3>
                        {history.length === 0 ? (
                            <p className="text-slate-500 italic p-6 text-center border bg-slate-50 rounded-lg">No medical history records found.</p>
                        ) : (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {history.map((record, idx) => (
                                    <div key={record._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 group-[.is-active]:bg-primary group-[.is-active]:text-white group-[.is-active]:shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <svg className="fill-current w-4 h-4" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 8 8 8.009 8.009 0 0 0-8-8Zm0 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" /></svg>
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-md border border-slate-100 bg-white">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="font-bold text-slate-800 text-lg">{record.diagnosis}</h3>
                                                <time className="text-xs font-semibold text-primary px-2 py-1 bg-blue-50 rounded uppercase tracking-wider">{new Date(record.visitDate).toLocaleDateString()}</time>
                                            </div>
                                            <div className="text-sm font-semibold text-slate-500 mb-3 border-b pb-2">Dr. {record.doctorId?.name} | {record.doctorId?.specialization}</div>
                                            <div className="space-y-2 mt-2">
                                                {record.prescriptionSummary && (
                                                    <div className="bg-slate-50 p-2 rounded border-l-2 border-primary text-sm">
                                                        <span className="font-semibold block text-xs text-slate-400 uppercase">Prescription</span>
                                                        <span className="italic text-slate-700">{record.prescriptionSummary}</span>
                                                    </div>
                                                )}
                                                {record.notes && (
                                                    <div className="bg-yellow-50 p-2 rounded border-l-2 border-yellow-400 text-sm">
                                                        <span className="font-semibold block text-xs text-slate-400 uppercase">Notes</span>
                                                        <span className="italic text-slate-700">{record.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-slate-800 shrink-0">Available Doctors</h2>

                            {/* Search and Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search doctor name..."
                                    className="border border-slate-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary w-full sm:w-48"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                />
                                <select
                                    className="border border-slate-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary w-full sm:w-40"
                                    value={filterSpeciality}
                                    onChange={(e) => setFilterSpeciality(e.target.value)}
                                >
                                    <option value="">All Specialities</option>
                                    <option value="General physician">General physician</option>
                                    <option value="Gynecologist">Gynecologist</option>
                                    <option value="Dermatologist">Dermatologist</option>
                                    <option value="Pediatricians">Pediatricians</option>
                                    <option value="Neurologist">Neurologist</option>
                                    <option value="Gastroenterologist">Gastroenterologist</option>
                                </select>
                                <select
                                    className="border border-slate-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary w-full sm:w-40"
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(e.target.value)}
                                >
                                    <option value="">Any Rating</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="3">3+ Stars</option>
                                    <option value="2">2+ Stars</option>
                                </select>
                            </div>
                        </div>

                        {doctors.length === 0 ? (
                            <p className="text-slate-500 italic text-center p-8 bg-slate-50 border rounded-lg">No doctors found matching filters.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {doctors.map(doc => (
                                    <div key={doc._id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-slate-100 h-32 flex items-center justify-center">
                                            {doc.image ? (
                                                <img src={doc.image} alt={doc.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="text-5xl font-bold text-slate-300">👨‍⚕️</div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg mb-1">Dr. {doc.name}</h3>
                                            <p className="text-secondary font-medium text-sm mb-2">{doc.specialization}</p>
                                            <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
                                                <span>Fees: ${doc.fees}</span>
                                                <span className="flex items-center gap-1">Experience: {doc.experience}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <StarRating rating={doc.averageRating || 0} readonly={true} size="w-4 h-4" />
                                                <span className="text-sm font-bold text-slate-700">{doc.averageRating?.toFixed(1) || '0.0'}</span>
                                                <span className="text-xs text-slate-500">({doc.totalReviews || 0} reviews)</span>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/book-appointment/${doc._id}`)}
                                                className="w-full bg-primary text-white py-2 rounded font-bold hover:bg-primary-dark transition-colors"
                                            >
                                                Book Appointment
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Prescription Overlay / Medical Card */}
            {selectedPrescription && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Medical Card Header */}
                        <div className="bg-primary p-6 text-white flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-widest">Medical Prescription</h2>
                                <p className="opacity-90 font-medium">Dr. {selectedPrescription.doctorId?.name} | {selectedPrescription.doctorId?.specialization}</p>
                            </div>
                            <button onClick={() => setSelectedPrescription(null)} className="text-3xl font-light hover:rotate-90 transition-transform">&times;</button>
                        </div>

                        {/* Card Body */}
                        <div className="p-8 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                            <div className="flex justify-between border-b-2 border-slate-100 pb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Name</p>
                                    <p className="text-lg font-bold text-slate-800">You</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</p>
                                    <p className="text-lg font-bold text-slate-800">{selectedPrescription.date}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] border-l-4 border-primary pl-3">Medications</h3>
                                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4">Medicine</th>
                                                <th className="p-4">Dosage</th>
                                                <th className="p-4">Duration</th>
                                                <th className="p-4">Timing</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 italic">
                                            {selectedPrescription.prescription.map((med, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-bold text-slate-800">{med.medicineName}</td>
                                                    <td className="p-4 text-slate-600">{med.dosage}</td>
                                                    <td className="p-4 text-slate-600">{med.duration}</td>
                                                    <td className="p-4">
                                                        <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-teal-100">
                                                            {med.instructions}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {selectedPrescription.notes && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] border-l-4 border-primary pl-3">Doctor's Notes</h3>
                                    <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400 text-slate-700 italic leading-relaxed shadow-inner">
                                        "{selectedPrescription.notes}"
                                    </div>
                                </div>
                            )}

                            {selectedPrescription.nextVisitDate && (
                                <div className="pt-4 border-t-2 border-slate-100 flex justify-end">
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Appointment</p>
                                        <p className="text-xl font-black text-primary">{new Date(selectedPrescription.nextVisitDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Card Footer */}
                        <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid Medical Record • System Generated</span>
                            <button
                                onClick={() => setSelectedPrescription(null)}
                                className="bg-slate-800 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                            >
                                Close Card
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewAppointment && (
                <ReviewModal
                    appointment={reviewAppointment}
                    onClose={handleReviewModalClose}
                />
            )}
        </div>
    );
};

export default PatientDashboard;
