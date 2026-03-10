import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Patient'); // or Doctor or Admin

    const { login, token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Automatically redirect to dashboard if token exists (e.g., after login or if already logged in)
    useEffect(() => {
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint = 'http://localhost:4000/api/users/login';
            if (role === 'Doctor') endpoint = 'http://localhost:4000/api/doctors/login';
            if (role === 'Admin') endpoint = 'http://localhost:4000/api/admins/login';

            const { data } = await axios.post(endpoint, { email, password });

            if (data.success) {
                login(data);
                toast.success(`Welcome back ${data.name}!`);
                // Redirection is handled by useEffect to ensure context state is synced
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Login to MedConnect</h2>

                <div className="flex justify-center space-x-4 mb-6">
                    {['Patient', 'Doctor', 'Admin'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${role === r ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary transition-colors"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary transition-colors"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-secondary text-white py-2 rounded-md font-bold hover:bg-sky-600 transition-colors shadow-md mt-4"
                    >
                        Login as {role}
                    </button>
                </form>

                {role === 'Patient' && (
                    <p className="text-center text-sm text-slate-600 mt-6">
                        Don't have an account? <Link to="/register" className="text-secondary hover:underline font-medium">Register</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
