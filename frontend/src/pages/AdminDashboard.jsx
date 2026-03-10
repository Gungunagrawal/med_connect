import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [showAddDoctor, setShowAddDoctor] = useState(false);

    // Add Doctor form state
    const [newDoctor, setNewDoctor] = useState({
        name: '', email: '', password: '', specialization: 'General', fees: 0, experience: '1 Year', about: ''
    });

    const fetchDashData = async () => {
        try {
            const { data } = await axios.get('http://localhost:4000/api/admins/dashboard');
            if (data.success) setStats(data.dashData);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDoctors = async () => {
        try {
            // We can use the public route or an admin-specific one. 
            // Using the public route just to populate the list for now
            const { data } = await axios.get('http://localhost:4000/api/doctors/list');
            if (data.success) setDoctors(data.doctors);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchDashData();
        fetchDoctors();
    }, []);

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:4000/api/admins/add-doctor', newDoctor);
            if (data.success) {
                toast.success('Doctor added successfully');
                setShowAddDoctor(false);
                fetchDoctors();
                fetchDashData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding doctor');
        }
    };

    const removeDoctor = async (id) => {
        if (!window.confirm("Are you sure you want to remove this doctor?")) return;
        try {
            const { data } = await axios.delete(`http://localhost:4000/api/admins/doctor/${id}`);
            if (data.success) {
                toast.success('Doctor removed');
                fetchDoctors();
                fetchDashData();
            }
        } catch (error) {
            toast.error('Error removing doctor');
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar / Menu */}
            <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md h-fit">
                <h3 className="font-bold text-xl text-primary mb-4 border-b pb-2">Admin Menu</h3>
                <ul className="space-y-2">
                    <li className="p-2 bg-slate-100 rounded-md cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => setShowAddDoctor(false)}>Dashboard Stats</li>
                    <li className="p-2 bg-slate-100 rounded-md cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => setShowAddDoctor(true)}>Add Doctor</li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[500px]">
                {showAddDoctor ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New Doctor</h2>
                        <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block mb-1 text-sm">Name</label><input required className="w-full border p-2 rounded" type="text" onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} /></div>
                            <div><label className="block mb-1 text-sm">Email</label><input required className="w-full border p-2 rounded" type="email" onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })} /></div>
                            <div><label className="block mb-1 text-sm">Password</label><input required className="w-full border p-2 rounded" type="password" onChange={e => setNewDoctor({ ...newDoctor, password: e.target.value })} /></div>
                            <div>
                                <label className="block mb-1 text-sm">Specialization</label>
                                <select className="w-full border p-2 rounded" onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })}>
                                    {['General', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Psychiatrist'].map(spec => <option key={spec} value={spec}>{spec}</option>)}
                                </select>
                            </div>
                            <div><label className="block mb-1 text-sm">Experience</label><input required className="w-full border p-2 rounded" type="text" placeholder="e.g., 5 Years" onChange={e => setNewDoctor({ ...newDoctor, experience: e.target.value })} /></div>
                            <div><label className="block mb-1 text-sm">Fees ($)</label><input required className="w-full border p-2 rounded" type="number" onChange={e => setNewDoctor({ ...newDoctor, fees: parseInt(e.target.value) })} /></div>
                            <div className="md:col-span-2">
                                <label className="block mb-1 text-sm">About</label>
                                <textarea className="w-full border p-2 rounded h-24" onChange={e => setNewDoctor({ ...newDoctor, about: e.target.value })}></textarea>
                            </div>
                            <button type="submit" className="md:col-span-2 bg-primary text-white py-2 rounded font-bold hover:bg-primary-dark">Add Doctor</button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Platform Analytics</h2>
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-sky-50 p-6 rounded-lg border border-sky-100 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-secondary mb-2">{stats.doctors}</span>
                                    <span className="text-slate-600 font-medium">Total Doctors</span>
                                </div>
                                <div className="bg-teal-50 p-6 rounded-lg border border-teal-100 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-primary mb-2">{stats.users}</span>
                                    <span className="text-slate-600 font-medium">Total Patients</span>
                                </div>
                                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-indigo-500 mb-2">{stats.appointments}</span>
                                    <span className="text-slate-600 font-medium">Total Appointments</span>
                                </div>
                            </div>
                        )}

                        <h3 className="text-xl font-bold mb-4">Manage Doctors</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Name</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Specialization</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Fees</th>
                                        <th className="p-3 text-left border-b font-medium text-slate-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map(doc => (
                                        <tr key={doc._id} className="border-b hover:bg-slate-50">
                                            <td className="p-3">{doc.name}</td>
                                            <td className="p-3">{doc.specialization}</td>
                                            <td className="p-3">${doc.fees}</td>
                                            <td className="p-3">
                                                <button onClick={() => removeDoctor(doc._id)} className="text-red-500 hover:text-red-700 font-medium bg-red-50 px-3 py-1 rounded">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {doctors.length === 0 && <tr><td colSpan="4" className="text-center p-4 text-slate-500">No doctors registered yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
