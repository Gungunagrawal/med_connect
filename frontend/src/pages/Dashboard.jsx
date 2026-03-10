import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { role, token } = useContext(AuthContext);

    if (!token) return <Navigate to="/login" />;

    if (!role) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse text-xl font-medium text-primary">Loading your dashboard...</div>
        </div>
    );

    if (role === 'Admin') return <AdminDashboard />;
    if (role === 'Doctor') return <DoctorDashboard />;

    return <PatientDashboard />;
};

export default Dashboard;
