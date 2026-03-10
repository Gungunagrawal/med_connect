import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { role, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-primary text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold tracking-wider">
                    MedConnect
                </Link>

                <div className="space-x-4">
                    <Link to="/" className="hover:text-secondary transition-colors">Home</Link>

                    {token ? (
                        <>
                            <Link to="/dashboard" className="hover:text-secondary transition-colors">Dashboard</Link>
                            <button
                                onClick={handleLogout}
                                className="bg-white text-primary px-4 py-1 rounded-md hover:bg-slate-100 transition-colors font-medium">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-secondary transition-colors">Login</Link>
                            <Link to="/register" className="bg-secondary text-white px-4 py-1 rounded-md hover:bg-sky-600 transition-colors font-medium">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
