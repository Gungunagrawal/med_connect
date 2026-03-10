import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:4000/api/users/register', { name, email, password });

            if (data.success) {
                login(data);
                toast.success(`Registration successful! Welcome ${data.name}.`);
                navigate('/dashboard');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Create Account</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
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
                            placeholder="Create a password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-secondary text-white py-2 rounded-md font-bold hover:bg-sky-600 transition-colors shadow-md mt-4"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center text-sm text-slate-600 mt-6">
                    Already have an account? <Link to="/login" className="text-secondary hover:underline font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
