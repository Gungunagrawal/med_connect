import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Initialize axios token immediately if exists in localStorage to avoid race conditions on page refresh
const storedToken = localStorage.getItem('token');
if (storedToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(storedToken || null);
    const [role, setRole] = useState(localStorage.getItem('role') || null);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Ideally, fetch user profile to verify token here
            // Here we just rely on localStorage for role/token
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = (userData) => {
        setUser(userData);
        setToken(userData.token);
        setRole(userData.role);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('role', userData.role);
        // Set header immediately to avoid race conditions with dashboard fetches
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };

    return (
        <AuthContext.Provider value={{ user, role, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
