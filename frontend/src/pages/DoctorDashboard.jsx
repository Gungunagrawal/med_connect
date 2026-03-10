import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import PrescriptionModal from '../components/PrescriptionModal';
import HistoryModal from '../components/HistoryModal';
import HealthGraph from '../components/HealthGraph';

const DoctorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [profile, setProfile] = useState({});
    const [activeTab, setActiveTab] = useState('appointments');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [historyAppointment, setHistoryAppointment] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [doctorLogs, setDoctorLogs] = useState([]);
    const [selectedPatientForGraph, setSelectedPatientForGraph] = useState(null);
    const [patientHealthMetrics, setPatientHealthMetrics] = useState([]);

    const fetchAppointments = async () => {
        try {
            const { data } = await axios.get('http://localhost:4000/api/doctors/appointments');
            if (data.success) setAppointments(data.appointments);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDoctorLogs = async () => {
        if (!user || !user._id) return;
        try {
            const { data } = await axios.get(`http://localhost:4000/api/doctorlogs/${user._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (data.success) setDoctorLogs(data.logs);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAppointments();
        // pre-fill profile data from current user context
        if (user) {
            setProfile({ fees: user.fees || 0, about: user.about || '', availability: true, experience: user.experience || '1 Year' });
            setTimeSlots(user.timeSlots || []);
            fetchDoctorLogs();
        }
    }, [user]);

    const handleViewPatientGraph = async (patientId) => {
        try {
            const { data } = await axios.get(`http://localhost:4000/api/healthmetrics/${patientId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (data.success) {
                setPatientHealthMetrics(data.metrics);
                setSelectedPatientForGraph(patientId);
            }
        } catch (error) {
            toast.error('Could not fetch health metrics');
        }
    };

    const handleAction = async (id, status) => {
        try {
            const { data } = await axios.put(`http://localhost:4000/api/doctors/appointment/${id}`, { status });
            if (data.success) {
                toast.success(`Appointment ${status}`);
                fetchAppointments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating appointment');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...profile, timeSlots: timeSlots.map(t => ({ day: t.day, startTime: t.startTime, endTime: t.endTime })) };
            const { data } = await axios.put('http://localhost:4000/api/doctors/profile', payload);
            if (data.success) {
                toast.success('Profile/Schedule updated');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
        }
    };

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM' }]);
    };

    const removeTimeSlot = (index) => {
        setTimeSlots(timeSlots.filter((_, i) => i !== index));
    };

    const updateTimeSlot = (index, field, value) => {
        const newSlots = [...timeSlots];
        newSlots[index][field] = value;
        setTimeSlots(newSlots);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar / Menu */}
            <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md h-fit">
                <h3 className="font-bold text-xl text-primary mb-4 border-b pb-2">Doctor Menu</h3>
                <ul className="space-y-2">
                    <li className={`p-2 rounded-md cursor-pointer transition-colors ${activeTab === 'appointments' ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`} onClick={() => setActiveTab('appointments')}>Appointments</li>
                    <li className={`p-2 rounded-md cursor-pointer transition-colors ${activeTab === 'logs' ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`} onClick={() => setActiveTab('logs')}>Previous Logs</li>
                    <li className={`p-2 rounded-md cursor-pointer transition-colors ${activeTab === 'schedule' ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`} onClick={() => setActiveTab('schedule')}>Manage Schedule</li>
                    <li className={`p-2 rounded-md cursor-pointer transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`} onClick={() => setActiveTab('profile')}>Update Profile</li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[500px]">
                {activeTab === 'appointments' ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Your Appointments</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Patient Name</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Date & Time</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Status</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(app => (
                                        <tr key={app._id} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-medium">{app.patientId?.name || 'Unknown'}</td>
                                            <td className="p-3">{app.date} | {app.time}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {app.status === 'Pending' ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleAction(app._id, 'Approved')} className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Accept</button>
                                                        <button onClick={() => handleAction(app._id, 'Rejected')} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
                                                    </div>
                                                ) : app.status === 'Approved' ? (
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAppointment(app);
                                                                setIsPrescriptionModalOpen(true);
                                                            }}
                                                            className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark shadow-sm transition-all"
                                                        >
                                                            {app.prescription && app.prescription.length > 0 ? 'Update Prescription' : 'Add Prescription'}
                                                        </button>
                                                        <button
                                                            onClick={() => setHistoryAppointment(app)}
                                                            className="text-sm bg-secondary text-white px-3 py-1 rounded hover:bg-sky-600 shadow-sm transition-all"
                                                        >
                                                            Log History
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {appointments.length === 0 && <tr><td colSpan="4" className="text-center p-4 text-slate-500">No appointments found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'logs' ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Previous Patient Logs</h2>

                        {/* Patient Health Graph Modal/Section */}
                        {selectedPatientForGraph && (
                            <div className="mb-8 relative bg-white p-4 border rounded-xl shadow-sm">
                                <button onClick={() => setSelectedPatientForGraph(null)} className="absolute top-2 right-4 text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
                                <HealthGraph metrics={patientHealthMetrics} />
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Patient</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Date</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Diagnosis</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Prescription</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctorLogs.map(log => (
                                        <tr key={log._id} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-medium flex items-center gap-2">
                                                {log.patientId?.image && <img src={log.patientId.image} className="w-8 h-8 rounded-full object-cover" alt="patient" />}
                                                {log.patientId?.name || 'Unknown'}
                                            </td>
                                            <td className="p-3">{log.visitDate}</td>
                                            <td className="p-3">{log.diagnosis}</td>
                                            <td className="p-3 truncate max-w-[150px]">{log.prescription}</td>
                                            <td className="p-3">
                                                <button onClick={() => handleViewPatientGraph(log.patientId?._id)} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-semibold border border-blue-200 shadow-sm">
                                                    View Graph
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {doctorLogs.length === 0 && <tr><td colSpan="5" className="text-center p-4 text-slate-500">No previous logs created yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'schedule' ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Manage Availability</h2>
                        <div className="mb-4 text-slate-600 text-sm">Set the days and times you are available for appointments.</div>
                        <div className="space-y-4 mb-6">
                            {timeSlots.map((slot, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="w-full md:w-1/3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Day</label>
                                        <select
                                            value={slot.day}
                                            onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
                                            className="w-full border border-slate-300 p-2 rounded focus:ring-primary focus:border-primary"
                                        >
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={slot.startTime}
                                            onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                                            className="w-full border border-slate-300 p-2 rounded focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={slot.endTime}
                                            onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                                            className="w-full border border-slate-300 p-2 rounded focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                    <div className="w-full md:w-auto">
                                        <button
                                            onClick={() => removeTimeSlot(index)}
                                            className="bg-red-100 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-200 w-full"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={addTimeSlot} className="bg-slate-800 text-white py-2 px-6 rounded font-bold hover:bg-slate-900 transition-colors">
                                + Add Time Slot
                            </button>
                            <button onClick={handleProfileUpdate} className="bg-primary text-white py-2 px-6 rounded font-bold hover:bg-primary-dark transition-colors shadow-md">
                                Save Schedule
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Update Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                            <div><label className="block mb-1 text-sm font-medium">Fees ($)</label><input type="number" className="w-full border p-2 rounded" value={profile.fees || ''} onChange={e => setProfile({ ...profile, fees: parseInt(e.target.value) })} /></div>
                            <div><label className="block mb-1 text-sm font-medium">Experience</label><input type="text" className="w-full border p-2 rounded" value={profile.experience || ''} onChange={e => setProfile({ ...profile, experience: e.target.value })} /></div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Availability</label>
                                <select className="w-full border p-2 rounded" value={profile.availability} onChange={e => setProfile({ ...profile, availability: e.target.value === 'true' })}>
                                    <option value="true">Available</option>
                                    <option value="false">Not Available</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">About</label>
                                <textarea className="w-full border p-2 rounded h-32" value={profile.about || ''} onChange={e => setProfile({ ...profile, about: e.target.value })}></textarea>
                            </div>
                            <button type="submit" className="bg-primary text-white py-2 px-6 rounded font-bold hover:bg-primary-dark">Save Changes</button>
                        </form>
                    </div>
                )}
            </div>

            {isPrescriptionModalOpen && (
                <PrescriptionModal
                    appointment={selectedAppointment}
                    onClose={() => setIsPrescriptionModalOpen(false)}
                    onSave={fetchAppointments}
                />
            )}

            {historyAppointment && (
                <HistoryModal
                    appointment={historyAppointment}
                    onClose={() => setHistoryAppointment(null)}
                    onSave={() => { fetchAppointments(); fetchDoctorLogs(); }}
                />
            )}
        </div>
    );
};

export default DoctorDashboard;
